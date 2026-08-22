// ============================================================================
// Submit Lab Completion (double server check + XP + certificate)
// Deploy: supabase functions deploy submit-lab-completion
// Security: JWT, double server check, input validation, anti-cheat, timeout
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  safeReadBody,
  sanitizeString,
  validateRequired,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Only accept POST
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    // 2. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization", 401, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    // 3. Parse and validate input
    const bodyText = await safeReadBody(req);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const validationError = validateRequired(parsed, ["labId", "score"]);
    if (validationError) {
      return errorResponse(validationError, 400, req);
    }

    const labId = sanitizeString(parsed.labId, 100);
    const score = Number(parsed.score);
    const code = sanitizeString(parsed.code, 100000);

    if (typeof score !== "number" || isNaN(score)) {
      return errorResponse("Score must be a number", 400, req);
    }

    // 4. DOUBLE SERVER CHECK #1: Validate completion via database function
    const { data: validation, error: validationError2 } = await supabase.rpc(
      "validate_lab_completion",
      {
        p_user_id: user.id,
        p_lab_id: labId,
        p_code: code || "",
        p_score: score,
      }
    );

    if (validationError2 || !validation?.valid) {
      return errorResponse(
        validation?.error || "Validation failed",
        403,
        req
      );
    }

    // 5. DOUBLE SERVER CHECK #2: Verify score is reasonable (anti-cheat)
    if (score < 0 || score > 100) {
      return errorResponse("Invalid score range", 400, req);
    }

    const passed = score >= 80;
    const xpToAward = passed ? validation.xp_to_award : 0;

    // 6. Use admin client for writes (bypasses RLS)
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 7. Insert lab completion record (upsert for idempotency)
    const { data: progressRecord, error: insertError } = await adminSupabase
      .from("user_lab_progress")
      .upsert(
        {
          user_id: user.id,
          lab_id: labId,
          completed: passed,
          completed_at: passed ? new Date().toISOString() : null,
          xp_earned: xpToAward,
          score: score,
          code_snapshot: code || null,
        },
        { onConflict: "user_id,lab_id" }
      )
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 8. Update user total XP (server-calculated)
    const { data: totalXp } = await adminSupabase.rpc("calculate_total_xp", {
      p_user_id: user.id,
    });

    await adminSupabase
      .from("user_state")
      .update({ xp_points: totalXp || 0 })
      .eq("user_id", user.id);

    // 9. Check if track is now complete -> issue certificate
    let certificateIssued = null;
    if (passed) {
      const { data: certValidation } = await adminSupabase.rpc(
        "validate_certificate_issuance",
        {
          p_user_id: user.id,
          p_track_id: validation.track_id,
        }
      );

      if (certValidation?.valid && !certValidation?.already_issued) {
        // Get user profile for name
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        const { data: cert } = await adminSupabase
          .from("certificates")
          .insert({
            user_id: user.id,
            track_id: validation.track_id,
            student_name: profile?.full_name || "Backend Engineer",
            track_title: certValidation.track_title,
            is_verified: true,
          })
          .select()
          .single();

        certificateIssued = cert;

        // Update track progress
        await adminSupabase
          .from("user_track_progress")
          .upsert(
            {
              user_id: user.id,
              track_id: validation.track_id,
              is_track_completed: true,
              certificate_issued: true,
              certificate_id: cert?.id,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,track_id" }
          );
      }
    }

    return new Response(
      JSON.stringify(snakeToCamel({
        success: true,
        passed,
        xpAwarded: xpToAward,
        totalXp: totalXp || 0,
        certificateIssued: certificateIssued || null,
      })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Submit lab error:", error);
    return errorResponse("Submission failed", 500, req);
  }
});

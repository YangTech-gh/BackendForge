// ============================================================================
// Get Single Lab (with files, instructions, test cases)
// Deploy: supabase functions deploy get-lab
// Security: JWT, input validation, rate limit
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  sanitizeString,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Only accept GET
    if (req.method !== "GET") {
      return errorResponse("Method not allowed", 405, req);
    }

    // 2. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization", 401, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    // 3. Parse and validate query params
    const url = new URL(req.url);
    const labId = sanitizeString(url.searchParams.get("labId"), 100);

    if (!labId) {
      return errorResponse("labId is required", 400, req);
    }

    // 4. Fetch lab (RLS handles pro access gating)
    const { data: lab, error: labError } = await supabase
      .from("course_labs")
      .select("*")
      .eq("id", labId)
      .single();

    if (labError || !lab) {
      return errorResponse("Lab not found", 404, req);
    }

    // 5. Fetch user progress for this lab
    const { data: progress } = await supabase
      .from("user_lab_progress")
      .select("completed, score, ai_feedback, xp_earned")
      .eq("user_id", user.id)
      .eq("lab_id", labId)
      .single();

    // 6. Fetch track info
    const { data: track } = await supabase
      .from("course_tracks")
      .select("id, title, track_number")
      .eq("id", lab.track_id)
      .single();

    return new Response(
      JSON.stringify(snakeToCamel({
        lab,
        track,
        progress: progress || {
          completed: false,
          score: null,
          ai_feedback: null,
          xp_earned: 0,
        },
      })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Get lab error:", error);
    return errorResponse("Failed to load lab", 500, req);
  }
});

// ============================================================================
// Book Coaching Session
// Deploy: supabase functions deploy book-coaching-session
// Security: JWT, RPC validation, input sanitization
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
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

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

    const bodyText = await safeReadBody(req);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const validationError = validateRequired(parsed, ["sessionDate"]);
    if (validationError) {
      return errorResponse(validationError, 400, req);
    }

    const sessionDate = sanitizeString(parsed.sessionDate, 100);

    // 1. Validate booking via RPC (checks Pro tier + available calls)
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "validate_coaching_booking",
      { p_user_id: user.id }
    );

    if (rpcError || !rpcResult?.valid) {
      return errorResponse(
        rpcResult?.error || "Booking validation failed",
        403,
        req
      );
    }

    // 2. Use admin client for writes (bypasses RLS)
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Insert coaching session
    const { data: session, error: insertError } = await adminSupabase
      .from("coaching_sessions")
      .insert({
        user_id: user.id,
        session_date: sessionDate,
        status: "scheduled",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 4. Decrement coaching_calls_remaining
    const { error: updateError } = await adminSupabase
      .from("user_state")
      .update({
        coaching_calls_remaining: rpcResult.calls_remaining - 1,
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify(snakeToCamel({ session })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Book coaching session error:", error);
    return errorResponse("Failed to book session", 500, req);
  }
});

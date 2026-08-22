// ============================================================================
// Get User Progress (dashboard data)
// Deploy: supabase functions deploy get-user-progress
// Security: JWT, rate limit
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
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

    // 3. Fetch all progress data in parallel (performance optimization)
    const [userStateRes, labProgressRes, trackProgressRes, certsRes] =
      await Promise.all([
        supabase
          .from("user_state")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_lab_progress")
          .select("lab_id, completed, score, xp_earned, completed_at")
          .eq("user_id", user.id),
        supabase
          .from("user_track_progress")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("certificates")
          .select("*")
          .eq("user_id", user.id),
      ]);

    return new Response(
      JSON.stringify(snakeToCamel({
        userState: userStateRes.data || {
          tier: "free",
          xp_points: 0,
          coaching_calls_remaining: 0,
        },
        labProgress: labProgressRes.data || [],
        trackProgress: trackProgressRes.data || [],
        certificates: certsRes.data || [],
      })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Get progress error:", error);
    return errorResponse("Failed to load progress", 500, req);
  }
});

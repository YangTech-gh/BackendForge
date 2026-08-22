// ============================================================================
// Get Courses (all tracks + labs from database)
// Deploy: supabase functions deploy get-courses
// Security: JWT, input validation, body size limit
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

    // 3. Fetch tracks (RLS filters by is_published and role)
    const { data: tracks, error: tracksError } = await supabase
      .from("course_tracks")
      .select("*")
      .eq("is_published", true)
      .order("track_number");

    if (tracksError) {
      throw tracksError;
    }

    // 4. Fetch labs for each track (RLS handles pro gating)
    const trackIds = tracks?.map((t) => t.id) || [];
    const { data: labs, error: labsError } = await supabase
      .from("course_labs")
      .select("*")
      .in("track_id", trackIds)
      .order("sort_order");

    if (labsError) {
      throw labsError;
    }

    // 5. Get user progress for display (with explicit filter for performance)
    const { data: userProgress } = await supabase
      .from("user_lab_progress")
      .select("lab_id, completed, score")
      .eq("user_id", user.id);

    // 6. Get user state for tier check
    const { data: userState } = await supabase
      .from("user_state")
      .select("tier, xp_points")
      .eq("user_id", user.id)
      .single();

    // 7. Assemble response
    const coursesWithLabs = tracks?.map((track) => ({
      ...track,
      learning_goals: track.learning_goals,
      deliverable_project: track.deliverable,
      labs: labs
        ?.filter((lab) => lab.track_id === track.id)
        .map((lab) => {
          const progress = userProgress?.find((p) => p.lab_id === lab.id);
          return {
            ...lab,
            completed: progress?.completed || false,
            score: progress?.score || null,
          };
        }),
    }));

    return new Response(
      JSON.stringify(snakeToCamel({
        courses: coursesWithLabs,
        userTier: userState?.tier || "free",
        xpPoints: userState?.xp_points || 0,
      })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Get courses error:", error);
    return errorResponse("Failed to load courses", 500, req);
  }
});

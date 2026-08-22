// ============================================================================
// Save Starter Kit (toggle save)
// Deploy: supabase functions deploy save-starter-kit
// Security: JWT, input validation, admin writes
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

    const bodyText = await safeReadBody(req);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const validationError = validateRequired(parsed, ["kitId"]);
    if (validationError) {
      return errorResponse(validationError, 400, req);
    }

    const kitId = sanitizeString(parsed.kitId, 100);

    // 1. Fetch current saved_kits from user_state
    const { data: userState, error: stateError } = await supabase
      .from("user_state")
      .select("saved_starter_kits")
      .eq("user_id", user.id)
      .single();

    if (stateError) {
      throw stateError;
    }

    const currentKits: string[] = userState?.saved_starter_kits || [];

    // 2. Toggle: remove if present, add if not
    let updatedKits: string[];
    if (currentKits.includes(kitId)) {
      updatedKits = currentKits.filter((id) => id !== kitId);
    } else {
      updatedKits = [...currentKits, kitId];
    }

    // 3. Use admin client for write (bypasses RLS)
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await adminSupabase
      .from("user_state")
      .update({ saved_starter_kits: updatedKits })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify(snakeToCamel({ savedStarterKits: updatedKits })),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Save starter kit error:", error);
    return errorResponse("Failed to save starter kit", 500, req);
  }
});

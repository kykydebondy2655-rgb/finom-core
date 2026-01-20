import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default temporary password - must match the one used in the app
const DEFAULT_TEMP_PASSWORD = "TempPass123!";

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all profiles with must_change_password = true
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("must_change_password", true)
      .eq("role", "client");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No profiles found with must_change_password = true",
          updated: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${profiles.length} profiles to sync`);

    const results = {
      total: profiles.length,
      success: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[],
    };

    // Reset password for each user
    for (const profile of profiles) {
      try {
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          profile.id,
          { password: DEFAULT_TEMP_PASSWORD }
        );

        if (updateError) {
          console.error(`Failed to update password for ${profile.email}:`, updateError);
          results.failed++;
          results.errors.push({ 
            email: profile.email || profile.id, 
            error: updateError.message 
          });
        } else {
          console.log(`Password synced for ${profile.email}`);
          results.success++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error updating ${profile.email}:`, errorMsg);
        results.failed++;
        results.errors.push({ 
          email: profile.email || profile.id, 
          error: errorMsg 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password sync completed`,
        password: DEFAULT_TEMP_PASSWORD,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in sync-temp-passwords:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

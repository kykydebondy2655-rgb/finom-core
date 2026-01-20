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

    // Generate unique test email
    const timestamp = Date.now();
    const testEmail = `test.workflow.${timestamp}@example-test.com`;
    
    console.log(`Creating test lead with email: ${testEmail}`);
    console.log(`Using password: ${DEFAULT_TEMP_PASSWORD}`);

    // 1. Create auth user with the temp password
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: DEFAULT_TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: "Test",
        last_name: "Workflow",
        role: "client",
      },
    });

    if (authError) {
      console.error("Auth creation error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "No user created" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;
    console.log(`Auth user created with ID: ${userId}`);

    // 2. Update profile with additional fields
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        must_change_password: true,
        lead_status: "new",
        pipeline_stage: "nouveau",
        lead_source: "test",
        phone: "+33600000000",
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // 3. Ensure role exists
    await adminClient
      .from("user_roles")
      .upsert({ user_id: userId, role: "client" }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test lead created successfully",
        testCredentials: {
          email: testEmail,
          password: DEFAULT_TEMP_PASSWORD,
        },
        userId,
        instructions: [
          `1. Go to login page`,
          `2. Enter email: ${testEmail}`,
          `3. Enter password: ${DEFAULT_TEMP_PASSWORD}`,
          `4. You should be prompted to change your password`,
        ],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-test-lead:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

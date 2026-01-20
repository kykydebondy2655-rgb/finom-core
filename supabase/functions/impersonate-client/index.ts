import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's JWT to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin or agent
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    const isAgent = roles?.some((r) => r.role === "agent");

    if (!isAdmin && !isAgent) {
      return new Response(JSON.stringify({ error: "Unauthorized: admin or agent role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, targetUserId, token } = await req.json();

    // ACTION: Generate impersonation token
    if (action === "generate") {
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "targetUserId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If agent, verify they're assigned to this client
      if (isAgent && !isAdmin) {
        const { data: assignment } = await adminClient
          .from("client_assignments")
          .select("id")
          .eq("agent_user_id", user.id)
          .eq("client_user_id", targetUserId)
          .single();

        if (!assignment) {
          return new Response(JSON.stringify({ error: "You are not assigned to this client" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Generate secure token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const impersonationToken = Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Token expires in 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store token
      const { error: insertError } = await adminClient
        .from("impersonation_tokens")
        .insert({
          admin_user_id: user.id,
          target_user_id: targetUserId,
          token: impersonationToken,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to create token" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          token: impersonationToken,
          expiresAt,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Consume token and get session
    if (action === "consume") {
      if (!token) {
        return new Response(JSON.stringify({ error: "token required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find valid token
      const { data: tokenData, error: tokenError } = await adminClient
        .from("impersonation_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark token as used
      await adminClient
        .from("impersonation_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenData.id);

      // Generate magic link for target user
      const { data: targetUser } = await adminClient.auth.admin.getUserById(tokenData.target_user_id);
      
      if (!targetUser?.user?.email) {
        return new Response(JSON.stringify({ error: "Target user not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a session for the target user
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: targetUser.user.email,
        options: {
          redirectTo: `${req.headers.get("origin") || supabaseUrl}/dashboard`,
        },
      });

      if (linkError) {
        console.error("Link generation error:", linkError);
        return new Response(JSON.stringify({ error: "Failed to generate session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          magicLink: linkData.properties?.action_link,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Impersonation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

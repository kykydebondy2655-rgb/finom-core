import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "agent" | "client";
  phone?: string;
  propertyPrice?: number;
  downPayment?: string;
  purchaseType?: string;
  leadSource?: string;
  pipelineStage?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT to verify they're admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Session invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerUserId = claimsData.claims.sub;
    console.log("Request from user:", callerUserId);

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin using the has_role function
    const { data: isAdmin, error: roleError } = await adminClient.rpc("has_role", {
      _user_id: callerUserId,
      _role: "admin",
    });

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification des droits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isAdmin) {
      console.error("User is not admin:", callerUserId);
      return new Response(
        JSON.stringify({ error: "Seuls les administrateurs peuvent créer des utilisateurs" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, password, firstName, lastName, role, phone, propertyPrice, downPayment, purchaseType, leadSource, pipelineStage } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: "Tous les champs obligatoires doivent être remplis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    if (role !== "agent" && role !== "client") {
      return new Response(
        JSON.stringify({ error: "Rôle invalide. Doit être 'agent' ou 'client'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 6 caractères" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating user:", email, "with role:", role);

    // Create user using admin API (does NOT affect caller's session)
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
      },
    });

    if (createError) {
      console.error("User creation error:", createError);
      
      // Handle duplicate email
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({ error: "Cet email est déjà utilisé" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: createError.message || "Erreur lors de la création de l'utilisateur" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!createData.user) {
      console.error("No user returned from createUser");
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création de l'utilisateur" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = createData.user.id;
    console.log("User created successfully:", newUserId);

    // The profile is created automatically by the trigger, but we need to update additional fields
    const profileUpdate: Record<string, unknown> = {
      must_change_password: true,
    };

    if (role === "client") {
      profileUpdate.lead_status = "new";
      if (phone) profileUpdate.phone = phone;
      if (propertyPrice) profileUpdate.property_price = propertyPrice;
      if (downPayment) profileUpdate.down_payment = downPayment;
      if (purchaseType) profileUpdate.purchase_type = purchaseType;
      if (leadSource) profileUpdate.lead_source = leadSource;
      if (pipelineStage) profileUpdate.pipeline_stage = pipelineStage;
    }

    // Update profile with additional data
    const { error: profileError } = await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("id", newUserId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't fail the whole operation, user is already created
    }

    // Insert role into user_roles table
    const { error: roleInsertError } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUserId, role });

    if (roleInsertError) {
      console.error("Role insert error:", roleInsertError);
      // Check if role already exists (trigger might have created it)
      if (!roleInsertError.message?.includes("duplicate")) {
        console.warn("Failed to insert role, but continuing...");
      }
    }

    console.log("User setup complete:", newUserId);

    // Return success - DO NOT return session data
    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        message: `${role === "agent" ? "Agent" : "Client"} créé avec succès`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in create-user function:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur inattendue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

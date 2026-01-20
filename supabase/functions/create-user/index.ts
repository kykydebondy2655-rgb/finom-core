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

// Default temp password - must match frontend constant
const DEFAULT_TEMP_PASSWORD = Deno.env.get("DEFAULT_TEMP_PASSWORD") || "TempPass123!";

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    // Verify the user session
    const { data: userData, error: userError } = await userClient.auth.getUser();

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Session invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerUserId = userData.user.id;

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin using the has_role function
    const { data: isAdmin, error: roleError } = await adminClient.rpc("has_role", {
      _user_id: callerUserId,
      _role: "admin",
    });

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "Erreur de vérification des droits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isAdmin) {
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

      // If the email already exists, treat this as an "upsert" for lead imports.
      // Important: in this project, some users may exist in auth but NOT have a row in `profiles`.
      // In that case we must:
      // - find the existing auth user by email
      // - upsert a profile row using the auth user id
      // - ensure the role exists
      if (
        createError.code === "email_exists" ||
        createError.message?.includes("already been registered") ||
        createError.message?.includes("already exists")
      ) {
        const normalizedEmail = email.toLowerCase().trim();

        // Find auth user id by email by paging through users.
        // (auth-js v2 does not provide getUserByEmail)
        let existingUserId: string | null = null;
        let page = 1;
        const perPage = 1000;

        while (!existingUserId) {
          const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
            page,
            perPage,
          });

          if (listError) {
            break;
          }

          const users = usersData?.users ?? [];
          const match = users.find((u) => (u.email ?? "").toLowerCase().trim() === normalizedEmail);
          if (match?.id) {
            existingUserId = match.id;
            break;
          }

          if (users.length < perPage) break; // no more pages
          page += 1;
        }

        // Fallback: if we can't find the auth user id, we can't safely upsert a profile.
        if (!existingUserId) {
          return new Response(
            JSON.stringify({ error: "Cet email est déjà utilisé" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // CRITICAL: Update the user's password to the DEFAULT temp password
        // This ensures consistency when re-importing leads - always use the centralized temp password
        const passwordToSet = DEFAULT_TEMP_PASSWORD;
        const { error: updatePasswordError } = await adminClient.auth.admin.updateUserById(
          existingUserId,
          { password: passwordToSet }
        );

        if (updatePasswordError) {
          console.error("Failed to reset password for existing user:", updatePasswordError);
          // Continue anyway - the profile update is still important
        }

        // Build profile update payload
        const profileUpdate: Record<string, unknown> = {
          id: existingUserId,
          email: normalizedEmail,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          must_change_password: true,
          updated_at: new Date().toISOString(),
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

        const { error: upsertError } = await adminClient
          .from("profiles")
          .upsert(profileUpdate, { onConflict: "id" });

        if (upsertError) {
          return new Response(
            JSON.stringify({ error: "Impossible de mettre à jour le profil" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Ensure role exists (upsert to handle duplicates gracefully)
        const { error: roleError } = await adminClient
          .from("user_roles")
          .upsert({ user_id: existingUserId, role }, { onConflict: 'user_id' });
        
        if (roleError && !roleError.message?.includes('duplicate')) {
          console.warn('Role upsert warning:', roleError.message);
        }

        return new Response(
          JSON.stringify({
            success: true,
            userId: existingUserId,
            message: "Client existant mis à jour",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: createError.message || "Erreur lors de la création de l'utilisateur" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!createData.user) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création de l'utilisateur" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = createData.user.id;

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
    await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("id", newUserId);

    // Insert role into user_roles table (ignore duplicates)
    try {
      await adminClient
        .from("user_roles")
        .insert({ user_id: newUserId, role });
    } catch {
      // Role might already exist via trigger - ignore duplicate errors
    }

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
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur inattendue";
    console.error("Error in create-user:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Erreur serveur inattendue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

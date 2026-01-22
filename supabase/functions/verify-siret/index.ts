import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PappersRepresentant {
  nom?: string;
  prenom?: string;
  qualite?: string;
}

interface PappersResponse {
  siren: string;
  siret: string;
  denomination?: string;
  nom_entreprise?: string;
  forme_juridique?: string;
  date_creation?: string;
  date_creation_formate?: string;
  representants?: PappersRepresentant[];
  siege?: {
    siret: string;
    adresse_ligne_1?: string;
    code_postal?: string;
    ville?: string;
  };
}

interface VerifyResponse {
  valid: boolean;
  companyName?: string;
  legalForm?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  directorName?: string;
  creationDate?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siret } = await req.json();

    if (!siret || typeof siret !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'SIRET requis' } as VerifyResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean SIRET (remove spaces)
    const cleanSiret = siret.replace(/\D/g, '');

    if (cleanSiret.length !== 14) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Le SIRET doit contenir 14 chiffres' } as VerifyResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Luhn algorithm validation
    const luhnValid = validateLuhn(cleanSiret);
    if (!luhnValid) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Format SIRET invalide (Luhn)' } as VerifyResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Pappers API
    const apiKey = Deno.env.get('PAPPERS_API_KEY');
    if (!apiKey) {
      console.error('PAPPERS_API_KEY not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Configuration API manquante' } as VerifyResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pappersUrl = `https://api.pappers.fr/v2/entreprise?siret=${cleanSiret}&api_token=${apiKey}`;
    const pappersResponse = await fetch(pappersUrl);

    if (!pappersResponse.ok) {
      if (pappersResponse.status === 404) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Entreprise non trouvée' } as VerifyResponse),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Pappers API error:', pappersResponse.status);
      return new Response(
        JSON.stringify({ valid: false, error: 'Erreur de vérification' } as VerifyResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: PappersResponse = await pappersResponse.json();

    // Extract director name (first representant with qualite containing "Gérant" or "Président")
    let directorName = '';
    if (data.representants && data.representants.length > 0) {
      const director = data.representants.find(r => 
        r.qualite?.toLowerCase().includes('gérant') || 
        r.qualite?.toLowerCase().includes('président') ||
        r.qualite?.toLowerCase().includes('directeur')
      ) || data.representants[0];
      
      if (director.prenom && director.nom) {
        directorName = `${director.prenom} ${director.nom}`;
      } else if (director.nom) {
        directorName = director.nom;
      }
    }

    const response: VerifyResponse = {
      valid: true,
      companyName: data.denomination || data.nom_entreprise || '',
      legalForm: data.forme_juridique || '',
      address: data.siege?.adresse_ligne_1 || '',
      city: data.siege?.ville || '',
      postalCode: data.siege?.code_postal || '',
      directorName: directorName,
      creationDate: data.date_creation_formate || data.date_creation || '',
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-siret:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erreur serveur' } as VerifyResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Luhn algorithm for SIRET validation
function validateLuhn(siret: string): boolean {
  let sum = 0;
  for (let i = 0; i < siret.length; i++) {
    let digit = parseInt(siret[i], 10);
    // For SIRET, multiply by 2 at even positions (0-indexed)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

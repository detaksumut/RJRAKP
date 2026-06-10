import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    const clientId = Deno.env.get('ORCID_CLIENT_ID') || 'APP-AJ40VLU6GXMHQBNA';
    const clientSecret = Deno.env.get('ORCID_CLIENT_SECRET') || 'ae02efd3-9f2c-47e2-af60-b2710c77fc50';
    const redirectUri = 'https://rjrakp.com/auth/callback';

    // 1. Exchange code for ORCID token
    const tokenResponse = await fetch('https://orcid.org/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange ORCID token');
    }

    const orcidId = tokenData.orcid;
    const name = tokenData.name || 'ORCID User';

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const generatedEmail = `orcid_${orcidId}@rjrakp.com`;
    const generatedPassword = `OrcidSecret_${orcidId}_${clientSecret.substring(0, 5)}`;

    // 3. Check if user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    let userExists = false;
    let userId = null;
    if (existingUsers && existingUsers.users) {
      const foundUser = existingUsers.users.find(u => u.email === generatedEmail);
      if (foundUser) {
        userExists = true;
        userId = foundUser.id;
      }
    }

    if (!userExists) {
      // 4. Create user if not exists
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: generatedEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          orcid: orcidId,
          role: 'author'
        }
      });

      if (createError) throw createError;
      userId = newUser?.user?.id;
    }

    // Ensure profile exists in users table
    if (userId) {
      const { error: insertError } = await supabaseAdmin.from('users').upsert({
        id: userId,
        email: generatedEmail,
        full_name: name,
        role: 'author',
        status: 'APPROVED'
      });

      if (insertError) {
        console.error("Error inserting into users table:", insertError);
      }
    }

    // 5. Return the credentials to the frontend so it can sign in
    return new Response(JSON.stringify({ 
      email: generatedEmail, 
      password: generatedPassword,
      name: name,
      orcid: orcidId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})

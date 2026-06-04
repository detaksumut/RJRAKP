require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function registerTest() {
  console.log("STEP 2 BEFORE SIGNUP");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'robbyshahary2@gmail.com', // use slightly different email to avoid "already registered"
    password: 'password123',
  });

  console.log("STEP 3 SIGNUP RESULT", authData);
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("STEP 4 INSERT USERS TABLE");
  const { error: userError } = await supabase.from('users').insert({
    id: authData.user.id,
    full_name: 'Robby Shahary',
    email: 'robbyshahary2@gmail.com',
    phone: '085270659155',
    role: 'reviewer',
    status: 'PENDING',
    institution: 'Universitas',
    faculty: 'Hukum',
    degree_level: 'S2'
  });

  if (userError) {
    console.error("User insert error:", userError);
    return;
  }

  console.log("STEP 5 INSERT REVIEWER PROFILE");
  const { error: profileError } = await supabase.from('reviewer_profiles').insert({
    user_id: authData.user.id,
    affiliation: 'Universitas',
    faculty: 'Hukum',
    education_level: 'S2',
    expertise_area: 'Perdata',
    orcid_id: '',
    google_scholar: '',
    cv_url: 'cv.pdf',
  });

  if (profileError) {
    console.error("Profile insert error:", profileError);
    return;
  }

  console.log("STEP 6 INSERT SUCCESS");
}

registerTest();

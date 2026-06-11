import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { email } = await req.json()

    if (!email) {
      throw new Error('Alamat email wajib diisi.')
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Cari user di tabel public.users
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone')
      .eq('email', email)
      .maybeSingle()

    if (profileError || !userProfile) {
      throw new Error('Email tidak ditemukan atau belum terdaftar.')
    }

    if (!userProfile.phone) {
      throw new Error('Akun ini tidak memiliki nomor WhatsApp yang terdaftar. Silakan hubungi administrator.')
    }

    // 2. Generate random temporary password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let tempPassword = ''
    const cryptoArr = new Uint8Array(8)
    crypto.getRandomValues(cryptoArr)
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(cryptoArr[i] % chars.length)
    }

    // 3. Update password di auth.users menggunakan auth.admin
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userProfile.id,
      { password: tempPassword }
    )

    if (updateAuthError) {
      throw new Error(`Gagal memperbarui kata sandi: ${updateAuthError.message}`)
    }

    // 4. Kirim WA via Fonnte API
    const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN')
    if (!FONNTE_TOKEN) {
      throw new Error('FONNTE_TOKEN tidak terkonfigurasi di server.')
    }

    // Bersihkan nomor telepon (ubah awalan 0 menjadi 62)
    let cleanedTarget = userProfile.phone.replace(/[^0-9]/g, '');
    if (cleanedTarget.startsWith('0')) {
      cleanedTarget = '62' + cleanedTarget.slice(1);
    }

    const message = `*Notifikasi SIP RJRAKP*\n\nHalo *${userProfile.full_name}*,\n\nAnda telah melakukan permintaan reset password. Berikut adalah kredensial login baru Anda:\n\n*Email (User ID):* ${email}\n*Password Sementara:* ${tempPassword}\n\nSilakan gunakan password sementara di atas untuk login kembali di sistem SIP RJRAKP.\n\n*PENTING (KEAMANAN):*\nDemi keamanan akun Anda, harap segera mengubah password sementara ini melalui menu *Profil & Rekening* setelah Anda berhasil masuk ke dashboard.\n\nTerima kasih.`

    const waResponse = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_TOKEN,
      },
      body: new URLSearchParams({
        target: cleanedTarget,
        message: message,
        countryCode: "62"
      })
    });

    const waData = await waResponse.json();

    if (!waResponse.ok || !waData.status) {
      console.warn("Fonnte warning/error status:", waData);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Kata sandi baru telah berhasil dikirim ke nomor WhatsApp Anda.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

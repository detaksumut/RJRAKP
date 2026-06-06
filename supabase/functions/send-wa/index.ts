import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { target, message } = await req.json()

    if (!target || !message) {
      throw new Error('Target phone number and message are required.')
    }

    // Fonnte API Key from environment variable
    const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN')

    if (!FONNTE_TOKEN) {
      throw new Error('FONNTE_TOKEN is not set in environment variables.')
    }

    // Clean phone number (replace starting 0 with 62)
    let cleanedTarget = target.replace(/[^0-9]/g, '');
    if (cleanedTarget.startsWith('0')) {
      cleanedTarget = '62' + cleanedTarget.slice(1);
    }

    // Send to Fonnte API
    const response = await fetch("https://api.fonnte.com/send", {
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

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
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

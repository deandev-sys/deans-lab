// supabase/functions/lynk-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // 1. Setup Client Supabase
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    console.log("Webhook received:", payload)

    // --- LOGIKA PARSING BARU (SESUAI DATA KAMU) ---
    // Struktur: payload.data.message_data...
    const messageData = payload.data?.message_data;
    const eventType = payload.event; // "payment.received"
    
    // Ambil data penting
    const userEmail = messageData?.customer?.email;
    // KITA PAKAI TITLE SEBAGAI ID PAKET
    const packageId = messageData?.items?.[0]?.title; 
    const totalAmount = messageData?.totals?.grandTotal || 0;

    // --- SIMPAN LOG (PENTING) ---
    await supabaseAdmin.from('payment_logs').insert({
      provider: 'lynk.id',
      email: userEmail || 'unknown',
      package_sku: packageId || 'unknown', // Disimpan di kolom sku biar konsisten
      amount: totalAmount,
      status: eventType,
      raw_data: payload
    })

    // 2. Validasi Status Sukses
    if (eventType !== 'payment.received' && payload.data?.message_action !== 'SUCCESS') {
      return new Response(JSON.stringify({ message: "Payment not success" }), { status: 200 })
    }

    if (!userEmail || !packageId) {
      // Return 200 biar Lynk.id gak error, tapi log error di console
      console.error("Data email atau title kosong")
      return new Response(JSON.stringify({ message: "Incomplete data" }), { status: 200 })
    }

    // 3. Cari User ID berdasarkan Email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, owned_packages')
      .eq('email', userEmail) 
      .single()

    if (userError || !userData) {
      console.error("User tidak ditemukan di database:", userEmail)
      return new Response(JSON.stringify({ message: "User not found" }), { status: 200 })
    }

    // 4. Cek apakah paket sudah dimiliki
    if (userData.owned_packages && userData.owned_packages.includes(packageId)) {
      console.log("Paket sudah dimiliki user")
      return new Response(JSON.stringify({ message: "Package already owned" }), { status: 200 })
    }

    // 5. Update Database: Tambahkan paket baru
    const currentPackages = userData.owned_packages || []
    // Pastikan tidak duplikat
    if (!currentPackages.includes(packageId)) {
        const newPackages = [...currentPackages, packageId]

        const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ owned_packages: newPackages })
        .eq('id', userData.id)

        if (updateError) throw updateError
    }

    // Update log jadi processed
    await supabaseAdmin
      .from('payment_logs')
      .update({ processed: true })
      .eq('email', userEmail)
      .eq('package_sku', packageId) 
      // Note: Kita cocokkan berdasarkan log terakhir yg belum processed sebenarnya lebih aman, 
      // tapi untuk MVP ini cukup.

    console.log(`Sukses unlock paket: ${packageId} untuk: ${userEmail}`)
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
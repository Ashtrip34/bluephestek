// use global fetch provided by Node 18+/Next.js runtimes

export default async function handler(req, res){
  if(req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try{
    const reference = (req.body && req.body.reference) || req.query.reference
    if(!reference) return res.status(400).json({ error: 'Missing reference' })
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || null
    // For local dev, try check the backend API (if provided) or return mock success only for DEV-
    if(!PAYSTACK_SECRET && reference.startsWith('DEV-')){
      // attempt to call backend verify if available
      try{
        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const resp = await fetch(`${backendBase}/payments/verify?reference=${encodeURIComponent(reference)}`)
        const data = await resp.json()
        return res.status(200).json(data)
      }catch(e){ return res.json({ ok:true, verified: true, details: { reference, reason: 'mock-dev' } }) }
    }

    if(!PAYSTACK_SECRET) return res.status(500).json({ error: 'Paystack not configured' })
    const resp = await fetch(`${process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'}/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } })
    const data = await resp.json()
    if(!resp.ok) return res.status(502).json({ error: 'Paystack verify failed', details: data })
    return res.json({ ok:true, verified: data.data.status === 'success', details: data.data })
  }catch(e){ console.error('serverless verify error', e); return res.status(500).json({ error: 'Server error' }) }
}

// use global fetch provided by Node 18+/Next.js runtimes

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try{
    const { email, amount, currency='NGN' } = req.body || {}
    if(!email || !amount) return res.status(400).json({ error: 'Missing email or amount' })

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || null
    if(!PAYSTACK_SECRET){
      // local dev fallback with deterministic ref
      const providedRef = req.body.reference || req.query.reference
      const reference = providedRef || `DEV-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      return res.status(200).json({ ok:true, authorization_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/mock/${encodeURIComponent(reference)}`, reference })
    }

    const amt = Math.round(Number(amount) * 100)
    const response = await fetch(`${process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'}/transaction/initialize`, { method: 'POST', headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, amount: amt, currency }) })
    const data = await response.json()
    if(!response.ok) return res.status(502).json({ error: 'Paystack initialize failed', details: data })
    return res.status(200).json({ ok:true, authorization_url: data.data.authorization_url, reference: data.data.reference })
  }catch(e){ console.error('serverless initialize error', e); return res.status(500).json({ error: 'Server error' }) }
}

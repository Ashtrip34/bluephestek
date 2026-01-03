/**
 * Serverless webhook proxy/handler for Paystack
 * - If NEXT_PUBLIC_API_URL is set, this will proxy the webhook to your external backend (/payments/webhook)
 * - Otherwise, if PAYSTACK_SECRET is set in Vercel, it will verify HMAC and respond (but WILL NOT persist unless you add DB access)
 */

export const config = { api: { bodyParser: false } }

import crypto from 'crypto'

async function buffer(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const raw = await buffer(req)
  const sig = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature']
  const backend = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || ''
  if(backend){
    try{
      const fetchResp = await fetch(`${backend.replace(/\/$/, '')}/payments/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Paystack-Signature': sig }, body: raw })
      const body = await fetchResp.text()
      return res.status(fetchResp.status).send(body)
    }catch(e){ console.error('Webhook proxy error', e); return res.status(502).json({ error: 'Proxy failed' }) }
  }

  // If no backend configured, optionally verify signature if PAYSTACK_SECRET is present
  const secret = process.env.PAYSTACK_SECRET || null
  if(!secret){
    console.warn('Received webhook but no BACKEND_URL or PAYSTACK_SECRET configured. Returning 200 to acknowledge.')
    return res.status(200).json({ received: true })
  }
  const hmac = crypto.createHmac('sha512', secret).update(raw).digest('hex')
  if(!sig || sig !== hmac) return res.status(400).json({ error: 'Invalid signature' })
  try{
    const payload = JSON.parse(raw.toString('utf8'))
    console.log('Paystack webhook event (serverless):', payload.event)
    // Perform custom logic here (e.g., call an external service, persist to DB via Data Proxy, etc.)
    return res.status(200).json({ received: true })
  }catch(e){ console.error('Failed to parse webhook payload', e); return res.status(400).json({ error: 'invalid json' }) }
}

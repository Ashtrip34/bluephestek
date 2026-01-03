import Layout from '../components/Layout'
import { useState } from 'react'

export default function Payments(){
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(1000)
  const [loading, setLoading] = useState(false)

  async function startCheckout(e){
    e.preventDefault()
    setLoading(true)
    try{
          const useServerless = (process.env.NEXT_PUBLIC_USE_SERVERLESS_API === 'true') || process.env.VERCEL === '1'
          const base = useServerless ? '' : (process.env.NEXT_PUBLIC_API_URL || '')
          const endpoint = useServerless ? '/api/paystack/initialize' : base + '/payments/initialize'
          const res = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, amount })
      })
      const data = await res.json()
      if(res.ok && data.authorization_url){
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        const ref = data.reference
        // If a public key is configured, try the inline Paystack popup
        if(publicKey && ref){
          // Ensure Paystack inline script is loaded
          if(!window.PaystackPop){
            const loader = document.createElement('script')
            loader.src = 'https://js.paystack.co/v1/inline.js'
            document.head.appendChild(loader)
            await new Promise(res => { loader.onload = res; loader.onerror = res })
          }
          if(typeof window.PaystackPop !== 'undefined'){
          window.PaystackPop.setup({
            key: publicKey,
            email,
            amount: Math.round(Number(amount) * 100),
            ref,
            onClose: function(){ console.log('Paystack popup closed') },
            callback: function(response){
              // After a successful payment, redirect to frontend with ref
              const href = (process.env.NEXT_PUBLIC_FRONTEND_URL || '') + `/?payment_ref=${encodeURIComponent(response.reference)}`
              window.location.href = href
            }
          })
          return
          }
        }
        // Otherwise redirect to Paystack hosted checkout page (or mock)
        window.location.href = data.authorization_url
        return
      }
      alert('Failed to initialize payment: ' + (data.error || JSON.stringify(data)))
    }catch(err){
      console.error(err); alert('Payment init error')
    }finally{ setLoading(false) }
  }

  return (
    <Layout>
      <section style={{padding:'2rem 0', maxWidth:640, margin:'0 auto', display:'flex', justifyContent:'center'}}>
        <div style={{width:'100%', maxWidth:420}}>
        <h2>Payments</h2>
        <form onSubmit={startCheckout}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Amount ({'NGN'})</label>
            <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} min={100} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Redirecting...' : 'Pay with Paystack'}</button>
        </form>
        </div>
      </section>
    </Layout>
  )
}

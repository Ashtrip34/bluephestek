import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [token, setToken] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/request-password-reset', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email })
      })
      const data = await res.json().catch(()=>null)
      if(res.ok){
        setStatus('ok')
        setToken(data.token)
      }else{
        setStatus(data?.error || 'error')
      }
    }catch(err){ setStatus('error') }
  }

  return (
    <Layout>
      <section style={{padding:'3rem 0', maxWidth:640}}>
        <h2>Forgot password</h2>
        <p className="muted">Enter your account email and we'll create a short-lived reset token.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <Button type="submit">Request password reset</Button>
        </form>
        {status === 'sending' && <p className="muted">Generating token...</p>}
        {status === 'ok' && (
          <div>
            <p className="muted">Token generated (development):</p>
            <pre style={{background:'#0f1724',color:'#fff',padding:8,borderRadius:6,overflowX:'auto'}}>{token}</pre>
            <p className="muted">Use this token on the <a href="/reset-password">reset password</a> page to set a new password.</p>
          </div>
        )}
        {status && status !== 'sending' && status !== 'ok' && <p className="muted">{String(status)}</p>}
      </section>
    </Layout>
  )
}

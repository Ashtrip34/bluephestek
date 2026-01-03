import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { setToken } from '../lib/api'
import { useRouter } from 'next/router'

// Animated background component
function AnimatedBg() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1,
      background: 'linear-gradient(120deg, #0f1724 0%, #00c2a8 100%)',
      overflow: 'hidden',
    }}>
      <svg style={{position:'absolute',top:0,left:0,width:'100vw',height:'100vh'}}>
        <defs>
          <radialGradient id="g2" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00c2a8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="40%" cy="40%" r="400" fill="url(#g2)">
          <animate attributeName="cy" values="40%;60%;40%" dur="9s" repeatCount="indefinite" />
        </circle>
        <circle cx="70%" cy="70%" r="300" fill="url(#g2)">
          <animate attributeName="cx" values="70%;50%;70%" dur="11s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const router = useRouter()

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/register', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password, name, verificationCode})
      })
      const data = await res.json().catch(()=>null)
      if(res.ok){ setToken(data.token); setStatus('ok'); router.push('/') }
      else { setStatus(data?.error || 'error') }
    }catch(err){ setStatus('error') }
  }

  async function handleSendCode(e){
    e && e.preventDefault()
    setStatus('sending-code')
    try{
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/send-code', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email })
      })
      const data = await res.json().catch(()=>null)
      if(res.ok){
        setStatus('code-sent')
        // development: API returns the code so show it
        setVerificationCode(data.code)
      }else{
        setStatus(data?.error || 'error')
      }
    }catch(err){ setStatus('error') }
  }

  return (
    <Layout>
      <AnimatedBg />
      <div style={{minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <section style={{width:'100%', maxWidth:980, position:'relative', zIndex:1}}>
          <div className="auth-card">
            <div className="auth-left">
              <h3>Join Bluephes</h3>
              <p>Get live trading sessions, market analysis, and recordings. Create your account to get started.</p>
              <div className="auth-cta">
                <button type="button" className="social-btn social-google" onClick={()=>{ window.location.href = (process.env.NEXT_PUBLIC_API_URL || '') + '/auth/oauth/google' }}>Continue with Google</button>
                <button type="button" className="social-btn social-apple" onClick={()=>{ window.location.href = (process.env.NEXT_PUBLIC_API_URL || '') + '/auth/oauth/apple' }}>Continue with Apple</button>
              </div>
              <p className="hint">Or use your email to create an account</p>
            </div>
            <div className="auth-right">
              <form onSubmit={handleSubmit}>
                <div className="field input-icon">
                  <label>Name</label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" fill="#94a3b8"/></svg>
                  <input value={name} onChange={e=>setName(e.target.value)} />
                </div>
                <div className="field input-icon">
                  <label>Email</label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z" fill="#94a3b8"/></svg>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                  <Button type="button" onClick={handleSendCode}>Send verification code</Button>
                  {status === 'sending-code' && <span className="muted">Sending...</span>}
                  {status === 'code-sent' && <span className="muted">Code sent</span>}
                </div>
                <div className="field input-icon">
                  <label>Verification code</label>
                  <input value={verificationCode} onChange={e=>setVerificationCode(e.target.value)} />
                </div>
                <div className="field input-icon">
                  <label>Password</label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 8V7a5 5 0 00-10 0v1H5v12h14V8h-2zm-8-1a3 3 0 016 0v1H9V7z" fill="#94a3b8"/></svg>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
                  <div className="hint">By creating an account, you agree to our <a href="#" style={{color:'var(--accent-2)'}}>Terms</a>.</div>
                  <Button type="submit">Create account</Button>
                </div>
              </form>
              {status === 'sending' && <p className="muted">Creating account...</p>}
              {status && status !== 'sending' && status !== 'ok' && <p className="muted">{String(status)}</p>}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

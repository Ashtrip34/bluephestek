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
      background: 'linear-gradient(120deg, #0f1724 0%, #7c3aed 100%)',
      overflow: 'hidden',
    }}>
      <svg style={{position:'absolute',top:0,left:0,width:'100vw',height:'100vh'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#00c2a8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60%" cy="30%" r="400" fill="url(#g1)">
          <animate attributeName="cx" values="60%;40%;60%" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="30%" cy="70%" r="300" fill="url(#g1)">
          <animate attributeName="cy" values="70%;50%;70%" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const router = useRouter()

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/login', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password})
      })
      const data = await res.json().catch(()=>null)
      if(res.ok){ setToken(data.token); setStatus('ok'); router.push('/') }
      else { setStatus(data?.error || 'error') }
    }catch(err){ setStatus('error') }
  }

  return (
    <Layout>
      <AnimatedBg />
      <div style={{minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <section style={{padding:'2rem 0', maxWidth:420, width:'100%', position:'relative', zIndex:1}}>
        <h2 style={{textAlign:'center'}}>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <Button type="submit">Sign in</Button>
          <div style={{marginTop:12, textAlign:'center'}}>
            <a href="/forgot-password" style={{color:'#7c3aed'}}>Forgot password?</a>
          </div>
        </form>
        {status === 'sending' && <p className="muted">Signing in...</p>}
        {status && status !== 'sending' && status !== 'ok' && <p className="muted">{String(status)}</p>}
      </section>
      </div>
    </Layout>
  )
}

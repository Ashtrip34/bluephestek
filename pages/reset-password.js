import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function ResetPassword(){
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/reset-password', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token, newPassword })
      })
      const data = await res.json().catch(()=>null)
      if(res.ok){ setStatus('ok') }
      else { setStatus(data?.error || 'error') }
    }catch(err){ setStatus('error') }
  }

  return (
    <Layout>
      <section style={{padding:'3rem 0', maxWidth:640}}>
        <h2>Reset password</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Token</label>
            <input value={token} onChange={e=>setToken(e.target.value)} />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          </div>
          <Button type="submit">Set new password</Button>
        </form>
        {status === 'sending' && <p className="muted">Resetting password...</p>}
        {status === 'ok' && <p className="muted">Password reset successful. You can now <a href="/login">sign in</a>.</p>}
        {status && status !== 'sending' && status !== 'ok' && <p className="muted">{String(status)}</p>}
      </section>
    </Layout>
  )
}

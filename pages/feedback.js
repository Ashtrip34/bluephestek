import {useState} from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function Feedback(){
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/feedback', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message})
      })
      if(res.ok){ setStatus('sent'); setMessage('') }
      else setStatus('error')
    }catch(err){ setStatus('error') }
  }

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <h2>Send Your Opinion</h2>
        <form onSubmit={handleSubmit} style={{maxWidth:680}}>
          <div className="field">
            <label>Your message</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6} />
          </div>
          <div style={{marginTop:'.5rem'}}>
            <Button type="submit">Send Opinion</Button>
          </div>
        </form>
        <div style={{marginTop:'.75rem'}}>
          {status === 'sending' && <p className="muted">Sending...</p>}
          {status === 'sent' && <p className="muted">Thanks — your opinion was received.</p>}
          {status === 'error' && <p className="muted">There was an error sending your opinion.</p>}
        </div>
      </section>
    </Layout>
  )
}

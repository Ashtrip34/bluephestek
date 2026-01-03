import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../lib/api'

export default function SessionPage(){
  const router = useRouter()
  const { id } = router.query
  const [session, setSession] = useState(null)

  useEffect(()=>{
    if(!id) return
    // In production fetch session by id from API
    setSession({ id, title: 'Session ' + id, start: new Date().toString() })
  },[id])

  async function join(){
    try{
      // placeholder: call API to register attendance or to return join URL
      const res = await fetchWithAuth('/sessions/join', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId: id }) })
      if(res.ok){
        const j = await res.json().catch(()=>null)
        if(j && j.url){
          // Use location.href for mobile browsers to avoid popup blocking
          window.location.href = j.url
          return
        }
        else alert('Joined (placeholder)')
      } else {
        alert('Failed to join')
      }
    }catch(err){ console.error(err); alert('Error joining session') }
  }

  if(!id) return <Layout><p className="muted">Loading...</p></Layout>

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <h2>{session?.title}</h2>
        <div className="muted">{session?.start}</div>
        <div style={{marginTop:'.75rem'}}>
          <button className="btn btn-primary" onClick={join}>Join Session</button>
          <Link href={`/sessions/${id}/reminder`} style={{marginLeft:12}} className="btn btn-ghost">Reminders</Link>
        </div>
      </section>
    </Layout>
  )
}

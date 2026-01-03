import { useEffect, useState } from 'react'
import { fetchWithAuth } from '../../lib/api'
import io from 'socket.io-client'

export default function BotEvents(){
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [sport, setSport] = useState('')
  const [startLocal, setStartLocal] = useState('')
  const [duration, setDuration] = useState('')

  async function load(){
    setLoading(true)
    const r = await fetchWithAuth('/bot/events')
    if(r.ok){ const j = await r.json(); setEvents(j.events || []) }else{ setEvents([]) }
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  useEffect(()=>{
    const token = localStorage.getItem('bp_token')
    const socket = io((process.env.NEXT_PUBLIC_API_URL || '') + '/', { query: { token } })
    socket.on('bot:event:update', (payload)=>{
      setEvents(prev => prev.map(e=> e.id === payload.id ? { ...e, data: JSON.stringify(payload.data) } : e))
    })
    socket.on('bot:event:start', (payload)=>{ load() })
    socket.on('bot:event:finish', (payload)=>{ load() })
    return ()=> socket.disconnect()
  }, [])

  async function trigger(id){
    await fetchWithAuth(`/bot/events/${id}/trigger`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ payload: { manual: true, at: new Date().toISOString() } }) })
    await load()
  }

  async function create(){
    if(!title || !startLocal) return alert('Missing title or date')
    const startISO = new Date(startLocal).toISOString()
    await fetchWithAuth('/bot/events', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ title, sport, start: startISO, duration: Number(duration) || null }) })
    await load()
    setTitle(''); setSport(''); setStartLocal(''); setDuration('')
  }

  return (
    <section className="container">
      <h2>Bot events</h2>
      <div className="card" style={{marginBottom:12}}>
        <h3>Create Event</h3>
        <div style={{display:'grid', gap:8}}>
          <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input placeholder="Sport (e.g., football)" value={sport} onChange={(e)=>setSport(e.target.value)} />
          <input type="datetime-local" value={startLocal} onChange={(e)=>setStartLocal(e.target.value)} />
          <input placeholder="Duration (minutes)" type="number" value={duration} onChange={(e)=>setDuration(e.target.value)} />
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-primary" onClick={create}>Create</button>
            <button className="btn btn-ghost" onClick={()=>{ setTitle(''); setSport(''); setStartLocal(''); setDuration('') }}>Clear</button>
          </div>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      <div style={{display:'grid', gap:12}}>
        {events.map(e=> (
          <div key={e.id} className="card">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div><strong>{e.title}</strong> <div style={{fontSize:12, color:'var(--muted)'}}>{e.sport} • {new Date(e.start).toLocaleString()}</div></div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn btn-ghost" onClick={()=> trigger(e.id)}>Trigger</button>
              </div>
            </div>
            {e.data && <pre style={{marginTop:8, background:'rgba(0,0,0,0.03)', padding:8, borderRadius:8}}>{e.data}</pre>}
          </div>
        ))}
      </div>
    </section>
  )
}

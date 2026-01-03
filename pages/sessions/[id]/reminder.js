import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import Button from '../../../components/Button'
import { useRouter } from 'next/router'
import FloatingCard from '../../../components/FloatingCard'
import ForexTicker from '../../../components/ForexTicker'

// Helper to call server API
async function apiFetch(path, opts){
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  const res = await fetch(base + path, opts)
  return res
}

// Very small utility to play a beep using the WebAudio API
function playBeep(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    o.connect(g)
    g.connect(ctx.destination)
    g.gain.value = 0.0001
    o.start(0)
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02)
    setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); o.stop(ctx.currentTime + 0.15) }, 600)
  }catch(e){ console.warn('Audio API not available', e) }
}

export default function SessionReminder(){
  const router = useRouter()
  const { id } = router.query
  const [reminders, setReminders] = useState([])
  const [task, setTask] = useState('')
  const [alarmDate, setAlarmDate] = useState('')
  const [repeat, setRepeat] = useState('none')
  const [error, setError] = useState(null)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  // Load persisted reminders for session
  useEffect(()=>{
    if(!id) return
    async function load(){
      try{
        const r = await apiFetch(`/reminders?sessionId=${encodeURIComponent(id)}`)
        if(r.ok){ const data = await r.json(); setReminders(data) }
        else console.warn('Failed to load reminders from server')
      }catch(e){ console.warn('Failed to load reminders', e) }
    }
    load()
  },[id])

  // Persist reminders
  // persisted server-side now; keep localStorage for fallback or legacy

  // Timer to check pending alarms every second if there are alarms
  useEffect(()=>{
    const interval = setInterval(()=>{
      const now = Date.now()
      reminders.forEach((r)=>{
        if(r.enabled && r.time && !r.triggered && new Date(r.time).getTime() <= now){
          // trigger
          playBeep()
          // mark as triggered
          setReminders(prev => prev.map(p => p.id === r.id ? { ...p, triggered: true } : p))
          // browser notification if available
          if('Notification' in window && Notification.permission === 'granted'){
            new Notification('Bluephes Reminder', { body: r.text })
          }
        }
      })
    }, 1000)
    return ()=> clearInterval(interval)
  },[reminders])

  // Request permission for Notification API if not set
  useEffect(()=>{
    if('Notification' in window && Notification.permission === 'default'){
      Notification.requestPermission().catch(e=>console.warn('Notification permission request failed', e))
    }
  },[])

  useEffect(()=>{
    async function checkSubscription(){
      if(!('serviceWorker' in navigator) || !('PushManager' in window)) return
      const reg = await navigator.serviceWorker.getRegistration()
      if(!reg) return setPushSubscribed(false)
      const sub = await reg.pushManager.getSubscription()
      setPushSubscribed(!!sub)
    }
    checkSubscription()
  },[])

  async function addTask(e){
    e && e.preventDefault()
    setError(null)
    if(!task) return setError('Please enter a task')
    try{
      const body = { sessionId: Number(id), text: task, time: alarmDate || null, repeat, enabled: !!alarmDate }
      const r = await apiFetch('/reminders', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
      const data = await r.json()
      if(r.ok && data.reminder) setReminders(prev => [data.reminder, ...prev])
      else setError('Failed to create reminder')
    }catch(err){ setError('Failed to create reminder') }
    setTask(''); setAlarmDate('')
  }

  async function registerPush(){
    if(!('serviceWorker' in navigator) || !('PushManager' in window)) return alert('Push not supported')
    try{
      const reg = await navigator.serviceWorker.register('/sw.js')
      let vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      if(!vapid){
        try{ const r = await apiFetch('/push/publickey'); const j = await r.json(); vapid = j.publicKey || '' }catch(e){ console.warn('No public key available', e) }
      }
      const key = vapid ? urlBase64ToUint8Array(vapid) : null
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
      const keys = { p256dh: sub.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('p256dh')))) : null, auth: sub.getKey('auth') ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('auth')))) : null }
      await apiFetch('/push/subscribe', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint, keys }) })
      setPushSubscribed(true)
      alert('Subscribed to push notifications')
    }catch(e){ console.error('registerPush failed', e); alert('Push registration failed: ' + e.message) }
  }

  async function unregisterPush(){
    try{
      const reg = await navigator.serviceWorker.getRegistration()
      if(!reg) return
      const sub = await reg.pushManager.getSubscription()
      if(sub){ await apiFetch('/push/unsubscribe', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
        await sub.unsubscribe()
      }
      setPushSubscribed(false)
      alert('Unsubscribed from push')
    }catch(e){ console.error('unsubscribe push', e); alert('Failed to unsubscribe') }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function toggleDone(remId){
    try{
      const r = await apiFetch(`/reminders/${remId}`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ completed: !reminders.find(x=>x.id===remId).completed }) })
      const json = await r.json()
      if(r.ok) setReminders(prev => prev.map(p => p.id === remId ? json.reminder : p))
    }catch(e){ console.warn('toggleDone failed', e) }
  }
  async function removeItem(remId){
    try{ await apiFetch(`/reminders/${remId}`, { method:'DELETE' }); setReminders(prev => prev.filter(p => p.id !== remId)) }catch(e){ console.warn('remove failed', e) }
  }
  async function toggleAlarm(remId){
    try{
      const rem = reminders.find(x=>x.id===remId)
      const r = await apiFetch(`/reminders/${remId}`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ enabled: !rem.enabled }) })
      const json = await r.json()
      if(r.ok) setReminders(prev => prev.map(p => p.id === remId ? json.reminder : p))
    }catch(e){ console.warn('toggleAlarm failed', e) }
  }

  if(!id) return <Layout><p className="muted">Loading reminder...</p></Layout>

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <ForexTicker />
        <FloatingCard id={`session_${id}_reminder`} defaultPosition={{ x: 20, y: 120 }}>
        <h2>Reminders for Session {id}</h2>
        <p className="muted">Use reminder to set quick alarms and to-dos for this session.</p>
        <form onSubmit={addTask} style={{display:'grid', gap:12, maxWidth:720}}>
          <div className="field">
            <label>Task</label>
            <input value={task} onChange={e=>setTask(e.target.value)} placeholder="E.g., prepare slides or read notes" />
          </div>
          <div className="field">
            <label>Alarm (optional)</label>
            <input type="datetime-local" value={alarmDate} onChange={e=>setAlarmDate(e.target.value)} />
            <small className="muted">Alarm works while your browser tab remains open. We’ll play a short beep and optionally show a notification.</small>
          </div>
          <div className="field">
            <label>Repeat</label>
            <select value={repeat} onChange={e=>setRepeat(e.target.value)}>
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div style={{display:'flex', gap:8}}>
            <Button type="submit">Add reminder</Button>
            <Button type="button" onClick={()=>{ setTask(''); setAlarmDate('') }}>Reset</Button>
            <Button type="button" onClick={()=>{ playBeep(); if('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission().catch(()=>{}) }}>Test alarm</Button>
          </div>
        </form>

        <div style={{marginTop:18, maxWidth:720}}>
          <div style={{display:'flex', gap:8, marginBottom:12}}>
            {!pushSubscribed && <button className="btn btn-primary" onClick={registerPush}>Enable Push</button>}
            {pushSubscribed && <button className="btn" onClick={unregisterPush}>Disable Push</button>}
            <button className="btn btn-ghost" onClick={()=>{ if('serviceWorker' in navigator){ navigator.serviceWorker.ready.then(r=> r.active && r.active.postMessage({type:'test'}) ) } }}>Test Push</button>
          </div>
          <h3>To do</h3>
          {reminders.length === 0 && <p className="muted">No reminders yet for this session.</p>}
          <ul style={{listStyle:'none', padding:0}}>
            {reminders.map(r => (
              <li key={r.id} className="card" style={{display:'flex', alignItems:'center', gap:12, margin:'6px 0'}}>
                <input type="checkbox" checked={r.completed} onChange={(e)=>{ e.stopPropagation(); toggleDone(r.id) }} />
                <div style={{flex:1, cursor:'pointer'}} onClick={(e)=>{ e.stopPropagation(); router.push(`/sessions/${id}`) }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontWeight:600}}>{r.text}</div>
                    <div style={{fontSize:12, color:'var(--muted)'}}>{r.time ? new Date(r.time).toLocaleString() : ''}</div>
                  </div>
                    <div style={{marginTop:6, display:'flex', gap:8}}>
                    <button className="btn btn-ghost" onClick={(e)=>{ e.stopPropagation(); toggleAlarm(r.id) }}>{r.enabled ? 'Disable alarm' : 'Enable alarm'}</button>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation(); removeItem(r.id) }}>Remove</button>
                    <div style={{display:'flex', gap:8}}>
                      <button className="btn btn-ghost" onClick={(e)=>{ e.stopPropagation(); apiFetch(`/reminders/${r.id}/snooze`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ minutes: 5 }) }); alert('Snoozed 5 min') }}>Snooze 5m</button>
                      <button className="btn btn-ghost" onClick={(e)=>{ e.stopPropagation(); apiFetch(`/reminders/${r.id}/snooze`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ minutes: 10 }) }); alert('Snoozed 10 min') }}>Snooze 10m</button>
                      <button className="btn btn-ghost" onClick={(e)=>{ e.stopPropagation(); apiFetch(`/reminders/${r.id}/snooze`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ minutes: 30 }) }); alert('Snoozed 30 min') }}>Snooze 30m</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        </FloatingCard>
      </section>
    </Layout>
  )
}

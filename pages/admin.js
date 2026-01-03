import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '../lib/api'

export default function Admin(){
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ title:'', start:'' })

  useEffect(()=>{ load() },[])

  async function load(){
    try{
      const res = await fetchWithAuth('/admin')
      const json = await res.json()
      setData(json)
    }catch(err){ console.error(err) }
  }

  async function createSession(e){
    e.preventDefault()
    try{
      const res = await fetchWithAuth('/admin/sessions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      await load()
      setForm({ title:'', start:'' })
    }catch(err){ console.error(err) }
  }

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <h2>Admin Dashboard</h2>
        <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
          <div style={{flex:1}}>
            <h3>Users</h3>
            <pre style={{maxHeight:300, overflow:'auto'}}>{JSON.stringify(data?.users || [], null, 2)}</pre>
          </div>
          <div style={{flex:1}}>
            <h3>Sessions</h3>
            <pre style={{maxHeight:300, overflow:'auto'}}>{JSON.stringify(data?.sessions || [], null, 2)}</pre>
            <form onSubmit={createSession} style={{marginTop:'.75rem'}}>
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              <input placeholder="Start ISO date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} />
              <button className="btn btn-primary" style={{marginLeft:'.5rem'}}>Create</button>
            </form>
          </div>
          <div style={{flex:1}}>
            <h3>Recordings</h3>
            <form onSubmit={async (e)=>{ e.preventDefault(); const f = e.target.file.files[0]; if(!f) return; const fd = new FormData(); fd.append('file', f); try{ const r = await fetch((process.env.NEXT_PUBLIC_API_URL||'') + '/recordings/upload',{ method:'POST', body: fd }); if(r.ok){ await load(); e.target.reset() } else { alert('Upload failed') } }catch(err){ console.error(err); alert('Upload error') } }}>
              <input type="file" name="file" accept="video/*,audio/*" />
              <button className="btn btn-primary" style={{marginLeft:'.5rem'}}>Upload</button>
            </form>
            <ul>
              {(data?.recordings || []).map(r=> (
                <li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.id}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  )
}
import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '../lib/api'

export default function Admin(){
  const [msg, setMsg] = useState('Loading...')

  useEffect(()=>{
    fetchWithAuth('/admin').then(async r=>{
      if(r.ok){ const d = await r.json(); setMsg(JSON.stringify(d)) }
      else if(r.status === 401) setMsg('Not authenticated')
      else if(r.status === 403) setMsg('Forbidden — admin only')
      else setMsg('Error fetching admin')
    }).catch(()=> setMsg('Error connecting'))
  },[])

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <h2>Admin Dashboard</h2>
        <div className="card" style={{marginTop:'1rem'}}>
          <pre style={{whiteSpace:'pre-wrap'}}>{msg}</pre>
        </div>
      </section>
    </Layout>
  )
}

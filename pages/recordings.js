import Layout from '../components/Layout'
import Card from '../components/Card'
import { useEffect, useState } from 'react'

export default function Recordings(){
  const [items, setItems] = useState([])
  useEffect(()=>{
    fetch(process.env.NEXT_PUBLIC_API_URL + '/recordings').then(r=>r.json()).then(setItems).catch(()=>setItems([]))
  },[])

  return (
    <Layout>
      <section id="recordings" style={{padding:'2rem 0'}}>
        <h2>Recorded Sessions</h2>
        <div className="grid" style={{marginTop:'1rem'}}>
          {items.length === 0 && <div className="muted">No recordings yet.</div>}
          {items.map(it => (
            <Card key={it.id}>
              <h3>{it.title}</h3>
              <div className="muted">{it.id}</div>
              <video src={process.env.NEXT_PUBLIC_API_URL + it.url} controls style={{width:'100%', marginTop:'.75rem', borderRadius:8}} />
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  )
}

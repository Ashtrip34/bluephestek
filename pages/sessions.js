import Layout from '../components/Layout'
import Card from '../components/Card'
import { useRouter } from 'next/router'

export default function Sessions(){
  const router = useRouter()
  const sessions = [
    { id:1, title: 'Intro to Forex', start: '2025-12-01 14:00 GMT' },
    { id:2, title: 'Advanced Price Action', start: '2025-12-03 16:00 GMT' }
  ]

  return (
    <Layout>
      <section style={{padding:'2rem 0'}}>
        <h2>Live Sessions</h2>
        <div className="grid" style={{marginTop:'1rem'}}>
          {sessions.map(s => (
            <Card key={s.id}>
              <h3>{s.title}</h3>
              <div className="muted">{s.start}</div>
              <div style={{marginTop:'.75rem'}}>
                <button className="btn btn-primary" onClick={() => router.push(`/sessions/${s.id}`)}>Join</button>
                <button className="btn btn-ghost" style={{marginLeft:'.5rem'}} onClick={() => router.push(`/sessions/${s.id}`)}>Details & Info</button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  )
}

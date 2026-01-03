import Link from 'next/link'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import Card from '../components/Card'
import FloatingServices from '../components/FloatingServices'
import { useState, useEffect } from 'react'

export default function Home() {
  const [showSplash, setShowSplash] = useState(false)
  useEffect(()=>{
    const seen = typeof window !== 'undefined' && localStorage.getItem('seen_splash')
    if(!seen) setShowSplash(true)
  },[])
  return (
    <Layout>
      <Hero />

      {showSplash && (
        <div style={{ position:'fixed', inset:0, background:'rgba(2,6,23,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ width:'min(720px,92%)', padding:24, borderRadius:12, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', boxShadow:'0 20px 60px rgba(2,6,23,0.7)', display:'flex', gap:20, alignItems:'center' }}>
            <div style={{flex:1}}>
              <h2 style={{margin:0}}>Welcome to Bluephes</h2>
              <p className="muted">Bluephes combines state-of-the-art trading education with enterprise-grade technology. Join live sessions, access recordings, and manage payments securely.</p>
              <div style={{display:'flex', gap:8, marginTop:12}}>
                <button className="btn btn-primary" onClick={()=>{ setShowSplash(false); localStorage.setItem('seen_splash','1') }}>Enter site</button>
                <Link href="/register" className="btn btn-ghost">Create account</Link>
              </div>
            </div>
            <div style={{width:260}}>
              <h4 style={{marginTop:0}}>Upcoming</h4>
              <ul className="muted">
                <li>Live session: Intro to Forex — Today 3:00PM</li>
                <li>Recorded: Session 42 — Strategy recap</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <section style={{padding: '2rem 0'}}>
        <h2>Our Services</h2>
        <FloatingServices items={[
          { title: 'Live Sessions', body: 'Interactive Zoom sessions where our experts trade and explain strategies live.' },
          { title: 'Recorded Content', body: 'High-quality recordings of past sessions available on-demand.' },
          { title: 'Managed Accounts', body: 'Open a live account and let our traders manage positions for you.' },
          { title: 'Consulting', body: 'Personalized technology and trading consulting for businesses and high-net-worth clients.' },
          { title: 'API Access', body: 'Programmatic access to our signals and historical session recordings.' },
        ]} />
      </section>
    </Layout>
  )
}

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { getToken, clearToken, getMe } from '../lib/api'
import { useRouter } from 'next/router'

export default function Navbar(){
  const [user, setUser] = useState(null)
  const [logoActive, setLogoActive] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    const token = getToken()
    if(token){
      getMe().then(u=>{ if(u) setUser(u) })
    }
  },[])

  function logout(){
    clearToken()
    setUser(null)
    router.push('/')
  }

  const triggerLogoPop = useCallback(()=>{
    setLogoActive(true)
    // remove the active state after the animation
    window.setTimeout(()=> setLogoActive(false), 380)
    // navigate home when logo is clicked
    try{ window.history.pushState({}, '', '/'); }catch(e){}
    // also use Next router navigation for SPA behavior
    try{ router.push('/') }catch(e){}
    // play click sound and show confetti
    try{ playLogoClickSound(); }catch(e){}
    try{ launchConfetti(); }catch(e){}
  },[])

  function playLogoClickSound(){
    try{
      // simple beep using WebAudio
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = 520
      g.gain.value = 0.06
      o.connect(g); g.connect(ctx.destination)
      o.start(); o.stop(ctx.currentTime + 0.12)
    }catch(e){ /* ignore audio errors */ }
  }

  function launchConfetti(){
    const colors = ['#00c2a8','#7c3aed','#ffb020','#ff5c7c','#4dd0e1']
    const root = document.body
    for(let i=0;i<18;i++){
      const el = document.createElement('div')
      el.className = 'confetti'
      el.style.background = colors[i % colors.length]
      el.style.left = (50 + (Math.random()-0.5)*40) + '%'
      el.style.top = (40 + (Math.random()-0.5)*10) + '%'
      el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`
      root.appendChild(el)
      setTimeout(()=> el.classList.add('confetti--fall'), 20)
      setTimeout(()=> el.remove(), 2600)
    }
  }

  function onLogoKey(e){
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault()
      triggerLogoPop()
    }
  }

  return (
    <nav className="site-nav">
      <div className="brand">
        <button
          aria-label="Bluephes logo"
          title="Bluephes"
          className={"logo" + (logoActive ? ' logo--active' : '')}
          onClick={triggerLogoPop}
          onKeyDown={onLogoKey}
        >
          B
        </button>
        <div>
          <div style={{fontSize: '1rem'}}>Bluephes</div>
          <div style={{fontSize: '.75rem', color:'var(--muted)'}}>{'Forex & Technology'}</div>
        </div>
      </div>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/sessions">Sessions</Link>
        <Link href="/recordings">Recordings</Link>
        <Link href="/feedback">Opinion</Link>
        <Link href="/payments">Payments</Link>
        {user ? (
          <>
            <span style={{color:'var(--muted)'}}>{user.email}</span>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
            {user.role === 'admin' && <Link href="/admin" className="cta">Admin</Link>}
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="cta">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}

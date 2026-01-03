import Button from './Button'

export default function Hero(){
  return (
    <section className="hero">
      <div className="hero-left">
        <h1 className="h1">Bluephes — Trade with confidence</h1>
        <p className="lead">We combine cutting-edge technology and deep forex expertise to deliver live sessions, on-demand recordings, and managed account onboarding.</p>
        <div style={{display:'flex', gap:'.75rem'}}>
          <Button>Join a Session</Button>
          <a href="#recordings" className="btn btn-ghost" style={{borderRadius:8}}>Watch Recordings</a>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div className="muted">Next Session</div>
              <h3 style={{margin:'6px 0'}}>Forex Strategies — Live Q&A</h3>
              <div className="muted">Starts: Tomorrow • 2:00 PM GMT</div>
            </div>
            <div>
              <div className="btn btn-primary" style={{padding:'.5rem .7rem'}}>Join</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

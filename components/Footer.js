export default function Footer(){
  return (
    <footer className="site-foot">
      <div className="container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
          <div>© {new Date().getFullYear()} Bluephes</div>
          <div style={{color:'var(--muted)'}}>Built for traders — privacy-first</div>
        </div>
      </div>
    </footer>
  )
}

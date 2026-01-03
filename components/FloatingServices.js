import { useRef } from 'react'
import Card from './Card'

export default function FloatingServices({ items = [] }){
  const ref = useRef()

  function handleMove(e){
    const el = ref.current
    if(!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width/2
    const cy = rect.top + rect.height/2
    const mx = (e.clientX - cx) / rect.width
    const my = (e.clientY - cy) / rect.height
    el.style.setProperty('--mx', String(mx))
    el.style.setProperty('--my', String(my))
  }

  return (
    <div ref={ref} className="services-float" onMouseMove={handleMove} onTouchMove={(e)=>{ if(e.touches && e.touches[0]) handleMove(e.touches[0]) }}>
      {items.map((it, i)=> (
        <div key={i} className="services-card" style={{['--d']: (0.03 + (i%5)*0.02)}}>
          <Card>
            <h3>{it.title}</h3>
            <p className="muted">{it.body}</p>
          </Card>
        </div>
      ))}
    </div>
  )
}

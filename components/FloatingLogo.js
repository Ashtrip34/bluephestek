import { useState, useRef, useEffect } from 'react'
import AnimatedLogo from './AnimatedLogo'

export default function FloatingLogo({ defaultPosition = { x: 20, y: 80 }, size = 64, id = 'floating-logo' }){
  const ref = useRef(null)
  const [pos, setPos] = useState(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const pointerRef = useRef(null)
  const floatRef = useRef({ enabled: true, target: null })
  const [isFloating, setIsFloating] = useState(true)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(`fc_pos_${id}`)
      if(raw) setPos(JSON.parse(raw))
    }catch(e){ /* ignore */ }
  },[id])

  useEffect(()=>{
    // compute a nicer default for larger screens: top-right corner
    if(typeof window === 'undefined') return
    if(pos && pos.x === defaultPosition.x && pos.y === defaultPosition.y){
      try{
        const rightMargin = 20
        const computedX = Math.max(12, window.innerWidth - size - rightMargin)
        setPos({ x: computedX, y: defaultPosition.y })
      }catch(e){}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    function onMove(e){
      if(!dragging) return
      const pointer = pointerRef.current
      const dx = e.clientX - pointer.x
      const dy = e.clientY - pointer.y
      const next = { x: pointer.startX + dx, y: pointer.startY + dy }
      setPos(next)
    }
    function onUp(){
      if(!dragging) return
      setDragging(false)
      try{ localStorage.setItem(`fc_pos_${id}`, JSON.stringify(pos)) }catch(e){}
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    if(dragging){
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }
    return ()=>{
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  },[dragging, pos, id])

  function onPointerDown(e){
    // stop float when dragging
    floatRef.current.enabled = false
    setIsFloating(false)
    pointerRef.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y }
    setDragging(true)
  }

  // auto-float: slowly move to random positions if enabled and not dragging
  useEffect(()=>{
    const bounds = () => ({ w: window.innerWidth, h: window.innerHeight })
    let interval = null
    function tick(){
      if(dragging || !floatRef.current.enabled) return
      // pick a target point within bounds but keep a margin
      const b = bounds()
      const margin = 36
      const tx = Math.max(margin, Math.random()*(b.w - size - margin))
      const ty = Math.max(margin, Math.random()*(b.h - size - margin))
      // animate by updating pos gradually using requestAnimationFrame
      const start = { x: pos.x, y: pos.y }
      const dx = tx - start.x
      const dy = ty - start.y
      let startTime = null
      const duration = 3000 + Math.random()*3000
      function step(ts){
        if(startTime == null) startTime = ts
        const t = Math.min(1, (ts - startTime)/duration)
        const ease = 1 - Math.pow(1 - t, 3)
        const next = { x: start.x + dx * ease, y: start.y + dy * ease }
        setPos(next)
        if(t < 1 && floatRef.current.enabled && !dragging){
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
    }
    interval = setInterval(tick, 6000)
    return ()=> clearInterval(interval)
  },[dragging, pos, size])

  const transform = { transform: `translate(${pos.x}px, ${pos.y}px)` }

  return (
    <div ref={ref} className="floating-logo" style={{ ...transform, width: size, height: size }} role="presentation">
      <div className="logo-center" tabIndex={0} aria-label="Bluephes Logo" onPointerDown={onPointerDown} onPointerUp={()=>{ setDragging(false); try{ localStorage.setItem(`fc_pos_${id}`, JSON.stringify(pos)) }catch(e){} }} onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFloating(!isFloating); floatRef.current.enabled = !floatRef.current.enabled } }}>
        <AnimatedLogo size={Math.max(40, size-6)} />
      </div>
      <button className="floating-logo-pin" title="Pin/Unpin" onClick={(e)=>{ e.stopPropagation(); const enabled = !floatRef.current.enabled; floatRef.current.enabled = enabled; setIsFloating(enabled) }}>
        {isFloating ? '🔓' : '📌'}
      </button>
    </div>
  )
}

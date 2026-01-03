import { useState, useRef, useEffect } from 'react'

export default function FloatingCard({ children, defaultPosition = { x: 20, y: 120 }, className = '', style = {}, id = 'floating-card' }){
  const ref = useRef(null)
  const [pos, setPos] = useState(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const pointerRef = useRef(null)

  useEffect(()=>{
    // load position from localStorage
    try{
      const key = `fc_pos_${id}`
      const raw = localStorage.getItem(key)
      if(raw) setPos(JSON.parse(raw))
    }catch(e){ /* ignore */ }
  },[id])

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
    pointerRef.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y }
    setDragging(true)
  }

  const transform = { transform: `translate(${pos.x}px, ${pos.y}px)` }

  return (
    <div ref={ref} className={`floating-card ${className}`} style={{ ...style, ...transform }} aria-hidden="false">
      <div className="floating-card-handle" onPointerDown={onPointerDown} style={{cursor:'grab'}}>
        <div className="floating-card-title">Reminders</div>
      </div>
      <div className="floating-card-body">{children}</div>
    </div>
  )
}

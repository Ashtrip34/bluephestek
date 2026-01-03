import { useEffect, useState } from 'react'

// Very small mock ticker with animated prices
const pairs = [ 'EUR/USD', 'USD/JPY', 'GBP/USD', 'AUD/USD', 'BTC/USD' ]

function randomDelta(){
  return (Math.random() * 0.02 - 0.01).toFixed(4)
}

export default function ForexTicker(){
  const [items, setItems] = useState(pairs.map((p, i)=>({ pair: p, price: (1 + Math.random() * 0.3).toFixed(4), dir: 0 })))

  useEffect(()=>{
    const id = setInterval(()=>{
      setItems(prev => prev.map(it => {
        const delta = parseFloat(randomDelta())
        const newPrice = (parseFloat(it.price) + delta).toFixed(4)
        return { ...it, price: newPrice, dir: delta > 0 ? 1 : (delta < 0 ? -1 : 0) }
      }))
    }, 1500)
    return ()=> clearInterval(id)
  },[])

  return (
    <div className="forex-ticker">
      {items.map((it)=> (
        <div className={`ticker-item ${it.dir === 1 ? 'up' : it.dir === -1 ? 'down' : ''}`} key={it.pair}>
          <div className="pair">{it.pair}</div>
          <div className="price">{it.price}</div>
        </div>
      ))}
    </div>
  )
}

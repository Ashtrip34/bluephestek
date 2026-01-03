import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { fetchWithAuth, getMe } from '../lib/api'
import { connectSocket, getSocket, disconnectSocket } from '../lib/socket'

function filterMessage(text) {
  // Block money requests/offers
  const forbidden = [/send\s*money/i, /request\s*money/i, /paypal|bitcoin|btc|eth|wallet|account\s*number/i, /transfer\s*funds/i, /bank\s*details/i]
  for(const re of forbidden) if(re.test(text)) return false
  return true
}

export default function Messages(){
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')

  useEffect(()=>{
    getMe().then(setUser)
    fetchWithAuth('/messages/users').then(r=>r.json()).then(setUsers)
    const sock = connectSocket()
    sock.on('new_message', msg => {
      // if conversation open with this fromId, append
      if(selected && (msg.fromId === selected.id || msg.toId === selected.id)){
        setMessages(prev => [...prev, msg])
      }
    })
    return ()=>{ try{ disconnectSocket() }catch(e){} }
  },[])

  useEffect(()=>{
    if(selected){
      fetchWithAuth('/messages/' + selected.id).then(r=>r.json()).then(setMessages)
    }
  },[selected])

  async function sendMessage(e){
    e.preventDefault()
    if(!input.trim()) return
    if(!filterMessage(input)){
      setStatus('Message blocked: cannot send or request money.')
      return
    }
    setStatus('Sending...')
    const res = await fetchWithAuth('/messages/' + selected.id, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:input})
    })
    if(res.ok){
      setInput('')
      setStatus('')
      fetchWithAuth('/messages/' + selected.id).then(r=>r.json()).then(setMessages)
    }else{
      setStatus('Failed to send')
    }
  }

  return (
    <Layout>
      <section style={{padding:'2rem 0', maxWidth:900, margin:'0 auto'}}>
        <h2>Messages</h2>
        <div style={{display:'flex',gap:'2rem'}}>
          <aside style={{minWidth:200}}>
            <h4>Users</h4>
            <ul style={{listStyle:'none',padding:0}}>
              {users.filter(u=>u.id!==user?.id).map(u=>(
                <li key={u.id}>
                  <Button className={selected?.id===u.id?'btn-primary':'btn-ghost'} onClick={()=>setSelected(u)}>{u.name||u.email}</Button>
                </li>
              ))}
            </ul>
          </aside>
          <main style={{flex:1}}>
            {selected ? (
              <div>
                <h4>Chat with {selected.name||selected.email}</h4>
                <div style={{minHeight:200,background:'var(--card)',borderRadius:8,padding:'1rem',marginBottom:'1rem',maxHeight:300,overflowY:'auto'}}>
                  {messages.map((m,i)=>(
                    <div key={i} style={{marginBottom:'.5rem',textAlign:m.fromId===user.id?'right':'left'}}>
                      <span style={{background:m.fromId===user.id?'var(--accent)':'#222',color:'#fff',padding:'.3rem .7rem',borderRadius:8}}>{m.text}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} style={{display:'flex',gap:'.5rem'}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." style={{flex:1}} />
                  <Button type="submit">Send</Button>
                </form>
                {status && <div className="muted" style={{marginTop:'.5rem'}}>{status}</div>}
              </div>
            ) : <div className="muted">Select a user to chat.</div>}
          </main>
        </div>
      </section>
    </Layout>
  )
}
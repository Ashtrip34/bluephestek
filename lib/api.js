// Client API helpers for auth and fetch
export function setToken(token){
  if(typeof window === 'undefined') return
  localStorage.setItem('bp_token', token)
}

export function getToken(){
  if(typeof window === 'undefined') return null
  return localStorage.getItem('bp_token')
}

export function clearToken(){
  if(typeof window === 'undefined') return
  localStorage.removeItem('bp_token')
}

export async function fetchWithAuth(path, opts = {}){
  const url = (process.env.NEXT_PUBLIC_API_URL || '') + path
  const headers = opts.headers || {}
  const token = getToken()
  if(token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(url, { ...opts, headers })
  if(res.status === 401){
    // token invalid — clear
    clearToken()
  }
  return res
}

export async function getMe(){
  try{
    const res = await fetchWithAuth('/auth/me')
    if(!res.ok) return null
    const data = await res.json()
    return data.user || null
  }catch(e){ return null }
}

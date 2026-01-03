import { io } from 'socket.io-client'
import { getToken } from './api'

let socket = null

export function connectSocket(){
  if(socket) return socket
  const token = getToken()
  socket = io((process.env.NEXT_PUBLIC_API_URL || '') , { query: { token } })
  return socket
}

export function getSocket(){ return socket }

export function disconnectSocket(){ if(socket){ socket.disconnect(); socket = null } }

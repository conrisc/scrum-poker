'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

interface Participant {
  id: string
  pseudonym: string
  vote?: number | '?'
}

interface VotingRoom {
  id: string
  participants: Participant[]
  revealed: boolean
}

interface RoomStore {
  room: VotingRoom | null
  userId: string | null
  error: string | null
  setRoom: (room: VotingRoom | null) => void
  setUserId: (userId: string | null) => void
  setError: (error: string | null) => void
  clearRoom: () => void
}

const roomStore = createStore<RoomStore>((set) => ({
  room: null,
  userId: null,
  error: null,
  setRoom: (room: VotingRoom | null) => set({ room }),
  setUserId: (userId: string | null) => set({ userId }),
  setError: (error: string | null) => set({ error }),
  clearRoom: () => set({ room: null, userId: null, error: null })
}))

export const useRoomStore = () => useStore(roomStore)

interface WebSocketContextValue {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  createRoom: (pseudonym: string) => void
  joinRoom: (roomId: string, pseudonym: string) => void
  submitVote: (roomId: string, vote: number | '?') => void
  revealVotes: (roomId: string) => void
  newVoting: (roomId: string) => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  createRoom: () => {},
  joinRoom: () => {},
  submitVote: () => {},
  revealVotes: () => {},
  newVoting: () => {},
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { setRoom, setUserId, setError } = useRoomStore()

  useEffect(() => {
    console.log('Initializing WebSocket connection...')
    const socketInstance = io('ws://localhost:3001', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message)
    })

    socketInstance.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('user-id', (userId: string) => {
      setUserId(userId)
    })

    socketInstance.on('room-updated', (room: VotingRoom) => {
      setRoom(room)
    })

    socketInstance.on('error', ({ code }: { code: string }) => {
      setError(code)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [setRoom, setUserId, setError])

  const connect = () => {
    socket?.connect()
  }

  const disconnect = () => {
    socket?.disconnect()
  }

  const createRoom = (pseudonym: string) => {
    console.log('Emitting create-room with pseudonym:', pseudonym)
    socket?.emit('create-room', pseudonym)
  }

  const joinRoom = (roomId: string, pseudonym: string) => {
    console.log('Emitting join-room with roomId:', roomId, 'pseudonym:', pseudonym)
    socket?.emit('join-room', roomId, pseudonym)
  }

  const submitVote = (roomId: string, vote: number | '?') => {
    socket?.emit('vote-submitted', roomId, vote)
  }

  const revealVotes = (roomId: string) => {
    socket?.emit('reveal-votes', roomId)
  }

  const newVoting = (roomId: string) => {
    socket?.emit('new-voting', roomId)
  }

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      connect,
      disconnect,
      createRoom,
      joinRoom,
      submitVote,
      revealVotes,
      newVoting
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)

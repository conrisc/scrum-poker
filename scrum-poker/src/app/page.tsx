'use client'

import { useWebSocket, useRoomStore } from './websocket-provider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScrumPoker() {
  const { createRoom, joinRoom, leaveRoom } = useWebSocket()
  const { room, error, userId, clearRoom } = useRoomStore()
  const router = useRouter()
  const [pseudonym, setPseudonym] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    if (room) {
      leaveRoom(room.id)
    }
    clearRoom()
  }, [])

  useEffect(() => {
    if (pseudonym && room && !error) {
      localStorage.setItem('scrumPokerUser', JSON.stringify({
        userId,
        pseudonym
      }))
      router.push(`/room/${room.id}`)
    }
  }, [room, error])

  const handleCreateRoom = () => {
    if (pseudonym.length >= 2) {
      createRoom(pseudonym)
      setIsCreatingRoom(true)
    }
  }

  const handleJoinRoom = () => {
    if (pseudonym.length >= 2 && roomId.length === 6) {
      joinRoom(roomId, pseudonym)
    }
  }

  if (room) {
    console.log("Room already exists", room)
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Scrum Poker</h1>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Your Name
          </label>
          <input
            type="text"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
            minLength={2}
            maxLength={18}
          />
        </div>

        {!isCreatingRoom && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Room Code
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter 6-digit code"
              minLength={6}
              maxLength={6}
            />
          </div>
        )}

        <div className="flex gap-2">
          {!isCreatingRoom && (
            <button
              onClick={handleJoinRoom}
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={!pseudonym || !roomId}
            >
              Join Room
            </button>
          )}
          <button
            onClick={handleCreateRoom}
            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            disabled={!pseudonym}
          >
            {isCreatingRoom ? 'Creating Room...' : 'Create Room'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error === 'ROOM_NOT_FOUND' && 'Room not found'}
            {error === 'DUPLICATE_PSEUDONYM' && 'Name already in use'}
          </div>
        )}
      </div>
    </div>
  )
}

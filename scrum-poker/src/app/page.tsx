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
  const [mode, setMode] = useState<'join' | 'create'>('join')

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

        <div className="tabs tabs-box mb-4 justify-center tabs-lg">
          <input type="radio" name="join_mode_tab" className="tab [--tab-bg:#00c951]" checked={mode === 'join'} aria-label="Join Room" readOnly
            onClick={() => setMode('join')}
          />
          <input type="radio" name="create_mode_tab" className="tab [--tab-bg:#2b7fff]" checked={mode === 'create'} aria-label="Create Room" readOnly
            onClick={() => setMode('create')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Your Name
          </label>
          <input
            type="text"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            className={`w-full p-2 border rounded ${mode ==='create' ? 'mb-[86px]' : ''}`}
            placeholder="Enter your name"
            minLength={2}
            maxLength={18}
          />
        </div>

        {mode === 'join' && (
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

        <button
          onClick={mode === 'join' ? handleJoinRoom : handleCreateRoom}
          className={`w-full ${
            mode === 'create' ? 'bg-blue-500' : 'bg-green-500'
          } text-white p-2 rounded hover:opacity-90`}
          disabled={
            mode === 'join' 
              ? !pseudonym || !roomId 
              : !pseudonym
          }
        >
          {mode === 'join' ? 'Join Room' : 'Create Room'}
        </button>

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

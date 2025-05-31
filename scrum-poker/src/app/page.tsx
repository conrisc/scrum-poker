'use client'

import { useWebSocket, useRoomStore } from './websocket-provider'
import { useRef, useState, useMemo } from 'react'

function calculateAverage(votes: (number | '?')[]): number | null {
  const numericVotes = votes.filter((v): v is number => typeof v === 'number')
  if (numericVotes.length === 0) return null
  const sum = numericVotes.reduce((acc, val) => acc + val, 0)
  const avg = sum / numericVotes.length
  return Math.round(avg * 10) / 10
}

function calculateMedian(votes: (number | '?')[]): number | null {
  const numericVotes = votes.filter((v): v is number => typeof v === 'number')
  if (numericVotes.length === 0) return null
  
  numericVotes.sort((a, b) => a - b)
  const mid = Math.floor(numericVotes.length / 2)
  
  return numericVotes.length % 2 !== 0 
    ? numericVotes[mid]
    : Math.round((numericVotes[mid - 1] + numericVotes[mid]) / 2 * 10) / 10
}

const FIBONACCI_VALUES: (number | '?')[] = [0.5, 1, 2, 3, 5, 8, 13, 21, '?']

export default function ScrumPoker() {
  const { createRoom, joinRoom, submitVote, revealVotes, newVoting } = useWebSocket()
  const { room, userId, error } = useRoomStore()
  const [pseudonym, setPseudonym] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const confirmDialog = useRef<HTMLDialogElement>(null)

  const stats = useMemo(() => {
    if (!room || !room.revealed) return null
    
    const votes = room.participants
      .map(p => p.vote)
      .filter(v => v !== undefined) as (number | '?')[]
      
    return {
      average: calculateAverage(votes),
      median: calculateMedian(votes)
    }
  }, [room])

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

  const handleVote = (vote: number | '?') => {
    if (room && userId) {
      submitVote(room.id, vote)
    }
  }

  const handleReveal = () => {
    if (room) {
      revealVotes(room.id)
    }
  }

  const handleNewVoting = () => {
    confirmDialog.current?.showModal()
  }

  const confirmNewVoting = () => {
    if (room) {
      newVoting(room.id)
      confirmDialog.current?.close()
    }
  }

  const cancelNewVoting = () => {
    confirmDialog.current?.close()
  }

  if (!room) {
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

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room: {room.id}</h1>
        <div className="text-sm">
          {room.participants.length} participant{room.participants.length !== 1 && 's'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Vote</h2>
          <div className="grid grid-cols-3 gap-3">
            {FIBONACCI_VALUES.map((value) => (
              <button
                key={String(value)}
                onClick={() => handleVote(value)}
                className={`p-4 rounded-lg border-2 text-center font-medium ${
                  room.participants.find(p => p.id === userId)?.vote === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleReveal}
              disabled={room.revealed}
              className={`w-full p-3 rounded-lg ${
                room.revealed ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {room.revealed ? 'Votes Revealed' : 'Reveal Votes'}
            </button>
            <button
              onClick={handleNewVoting}
              className="w-full p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white"
            >
              New Voting
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Participants</h2>
          
          {stats && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
              <div className="flex justify-between text-blue-900">
                <span className="font-medium">Average:</span>
                <span className="font-bold">{stats.average ?? '-'}</span>
              </div>
              <div className="flex justify-between text-blue-900 mt-2">
                <span className="font-medium">Median:</span>
                <span className="font-bold">{stats.median ?? '-'}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {room.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <span>{participant.pseudonym}</span>
                <span className="text-sm">
                  {room.revealed && participant.vote !== undefined
                    ? participant.vote
                    : participant.vote !== undefined
                    ? '✓'
                    : '...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Voting Confirmation Modal */}
      <dialog ref={confirmDialog} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Start New Voting Session?</h3>
          <p className="py-4">This will reset and hide all estimates.</p>
          <div className="modal-action">
            <label 
              htmlFor="new-voting-modal" 
              className="btn"
              onClick={cancelNewVoting}
            >
              Cancel
            </label>
            <label 
              htmlFor="new-voting-modal" 
              className="btn btn-primary"
              onClick={confirmNewVoting}
            >
              Confirm
            </label>
          </div>
        </div>
      </dialog>
    </div>
  )
}

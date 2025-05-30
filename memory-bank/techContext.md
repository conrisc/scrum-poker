# Technical Context

## Stack Components
1. **Frontend**
   - Next.js (App Router)
   - TypeScript
   - Tailwind CSS
   - DaisyUI
   - Zustand (state management)
   - Socket.IO Client

2. **Backend**
   - Node.js
   - Socket.IO Server
   - In-memory session storage

## Key Implementation Details
- **Authentication**: 
  - UUIDv4 generated server-side
  - Stored on backend and localstorage
  - Sent via WebSocket connection

- **Data Model**:
```typescript
interface Participant {
  id: string;
  pseudonym: string;
  vote?: number | '?';
}

interface VotingRoom {
  id: string;
  participants: Participant[];
  revealed: boolean;
}
```

- **Real-time Events**:
  - Client → Server:
    - `create-room` (pseudonym: string)
    - `join-room` (roomId: string, pseudonym: string)
    - `vote-submitted` (roomId: string, vote: number | '?')
    - `reveal-votes` (roomId: string)
    - `new-voting` (roomId: string)
  
  - Server → Client:
    - `user-id` (userId: string)
    - `room-updated` (roomState: VotingRoom)
    - `error` ({ code: string })

- **Error Codes**:
  - `ROOM_NOT_FOUND`: Invalid room ID
  - `DUPLICATE_PSEUDONYM`: Pseudonym already in use
  - `INVALID_LENGTH`: Pseudonym must be 2-18 chars
  - `INVALID_CHARACTERS`: Pseudonym must be alphanumeric

## Development Setup
1. Node.js v22+
2. pnpm workspace
3. Concurrent dev servers:
   - Next.js (port 3000)
   - Socket.IO server (port 3001)

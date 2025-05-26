# Technical Context

## Stack Components
1. **Frontend**
   - Next.js (App Router)
   - TypeScript
   - Tailwind CSS
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
  - `vote-submitted` (client → server)
  - `participants-updated` (server → client)
  - `reveal-votes` (client → server)
  - `votes-revealed` (server → client)

## Development Setup
1. Node.js v22+
2. pnpm workspace
3. Concurrent dev servers:
   - Next.js (port 3000)
   - Socket.IO server (port 3001)

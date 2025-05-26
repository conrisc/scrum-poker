# System Patterns

## Architecture Overview
```mermaid
graph TD
    A[Client] -->|WebSocket| B[Node.js Server]
    B --> C[In-Memory Store]
    C --> D[(Rooms Map)]
    
    subgraph Client
        A1[Next.js App]
        A2[Zustand Store]
        A3[Socket.IO Client]
    end

    subgraph Server
        B1[Socket.IO Server]
        B2[Room Manager]
    end
```

## Key Data Flows

1. **Room Creation**
```mermaid
sequenceDiagram
    Client->>Server: POST /create-room
    Server->>Client: { roomId, userId }
    Client->>LocalStorage: Save userId
    Client->>Server: set-pseudonym (pseudonym)
    Server->>Client: room-created (roomDetails)
```

2. **Room Joining** 
```mermaid
sequenceDiagram
    Client->>Server: POST /join-room (roomId)
    Server->>Client: { userId }
    Client->>LocalStorage: Save userId
    Client->>Server: set-pseudonym (pseudonym)
    Server->>All Clients: participant-joined (updatedParticipants)
```

3. **Voting Process**
```mermaid
sequenceDiagram
    Client->>Server: vote-submitted (vote)
    Server->>All Clients: participants-updated (participants)
```

4. **Results Reveal**
```mermaid
sequenceDiagram
    Client->>Server: reveal-votes
    Server->>All Clients: votes-revealed (participantsWithVotes)
```

## Room Management
- 6-character alphanumeric room codes
- Auto-cleanup after 24h inactivity
- Max 25 participants per room (configurable)

## Error Handling
- Room not found → 404 + redirect
- Duplicate pseudonym → 409 + prompt
- WebSocket disconnect → auto-reconnect

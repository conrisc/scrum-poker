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
    Client->>Server: WebSocket connect
    Client->>Server: create-room (pseudonym)
    Server->>Client: user-id (userId)
    Server->>Client: room-updated (roomDetails)
    Client->>LocalStorage: Save userId
```

2. **Room Joining** 
```mermaid
sequenceDiagram
    Client->>Server: WebSocket connect
    Client->>Server: join-room (roomId, pseudonym)
    Server->>Client: user-id (userId)
    Server->>All Clients: room-updated (updatedRoomState)
    Client->>LocalStorage: Save userId
```

3. **Voting Process**
```mermaid
sequenceDiagram
    Client->>Server: vote-submitted (vote)
    Server->>All Clients: room-updated (fullRoomState)
```

4. **Results Reveal**
```mermaid
sequenceDiagram
    Client->>Server: reveal-votes
    Server->>All Clients: room-updated (fullRoomState)
```

5. **New Voting Session**
```mermaid
sequenceDiagram
    Client->>Server: new-voting
    Server->>All Clients: room-updated (reset votes, hidden state)
```

6. **State Synchronization**
- Single 'room-updated' event pattern
- Contains complete room state (participants, votes, revealed status)
- Reduces client-side state management complexity

## Room Management
- 6-character alphanumeric room codes
- Auto-cleanup after 24h inactivity
- Max 25 participants per room (configurable)

## Error Handling
- Room not found → 404 + redirect
- Duplicate pseudonym → 409 + prompt
- WebSocket disconnect → auto-reconnect

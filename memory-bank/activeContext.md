# Active Context

## Current Focus
Initializing the project structure and implementing core WebSocket functionality.

## Next Implementation Steps
1. **Project Setup**
   - Initialize Next.js app with TypeScript
   - Configure pnpm workspace
   - Set up Socket.IO server

2. **Core Features**
   - Room creation/joining endpoints
   - WebSocket connection handling
   - Basic voting UI components

3. **Immediate Tasks**
```mermaid
gantt
    title Initial Development Timeline
    dateFormat  YYYY-MM-DD
    section Setup
    Initialize project       :done, 2025-05-24, 1d
    Configure tooling       :active, 2025-05-25, 1d
    
    section Core
    WebSocket server        :2025-05-26, 2d
    Room management         :2025-05-28, 2d
    Basic voting UI         :2025-05-30, 2d
```

## Key Decisions
1. Using pnpm for faster dependencies
2. Separate ports for Next.js (3000) and Socket.IO (3001)
3. UUID generation on server for better consistency

## Open Questions
- Should we implement server-side validation for vote values?
- Need to decide on reconnect policy for WebSocket

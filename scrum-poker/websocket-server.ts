import { Server } from 'socket.io';
import { createServer } from 'http';
import { randomUUID } from 'crypto';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

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

const rooms = new Map<string, VotingRoom>();

io.on('connection', (socket) => {
  const participantId = randomUUID();

  socket.on('join-room', (roomId: string, pseudonym: string) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        participants: [],
        revealed: false
      });
    }

    const room = rooms.get(roomId)!;
    room.participants.push({
      id: participantId,
      pseudonym,
      vote: undefined
    });

    socket.join(roomId);
    socket.emit('participant-id', participantId);
    io.to(roomId).emit('room-updated', room);
  });

  socket.on('vote-submitted', (roomId: string, vote: number | '?') => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === participantId);
    if (participant) {
      participant.vote = vote;
      io.to(roomId).emit('room-updated', room);
    }
  });

  socket.on('reveal-votes', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.revealed = true;
    io.to(roomId).emit('room-updated', room);
  });

  socket.on('disconnect', () => {
    rooms.forEach(room => {
      room.participants = room.participants.filter(p => p.id !== participantId);
      io.to(room.id).emit('room-updated', room);
    });
  });
});

httpServer.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});

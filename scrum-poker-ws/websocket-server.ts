import { Server } from 'socket.io';
import { createServer } from 'http';
import { randomUUID } from 'crypto';

function validatePseudonym(pseudonym: string): { valid: boolean, error?: string } {
  if (!pseudonym || pseudonym.trim().length < 2 || pseudonym.trim().length > 18) {
    return { valid: false, error: 'INVALID_LENGTH' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(pseudonym)) {
    return { valid: false, error: 'INVALID_CHARACTERS' };
  }
  return { valid: true };
}

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
  createdAt: Date;
}

const rooms = new Map<string, VotingRoom>();

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  const userId = randomUUID();

  socket.on('create-room', (pseudonym: string) => {
    const roomId = generateRoomId();

    const validation = validatePseudonym(pseudonym);
    if (!validation.valid) {
      socket.emit('error', { code: validation.error });
      return;
    }

    const newRoom: VotingRoom = {
      id: roomId,
      participants: [{
        id: userId,
        pseudonym,
        vote: undefined
      }],
      revealed: false,
      createdAt: new Date()
    };

    rooms.set(roomId, newRoom);
    socket.join(roomId);
    socket.emit('user-id', userId);
    io.to(roomId).emit('room-updated', newRoom);
  });

  socket.on('join-room', (roomId: string, pseudonym: string) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND' });
      return;
    }

    const room = rooms.get(roomId)!;
    
    const validation = validatePseudonym(pseudonym);
    if (!validation.valid) {
      socket.emit('error', { code: validation.error });
      return;
    }

    if (room.participants.some(p => p.pseudonym === pseudonym)) {
      socket.emit('error', { code: 'DUPLICATE_PSEUDONYM' });
      return;
    }

    room.participants.push({
      id: userId,
      pseudonym,
      vote: undefined
    });

    socket.join(roomId);
    socket.emit('user-id', userId);
    io.to(roomId).emit('room-updated', room);
  });

  socket.on('vote-submitted', (roomId: string, vote: number | '?') => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === userId);
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

  socket.on('new-voting', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND' });
      return;
    }

    room.participants.forEach(p => p.vote = undefined);
    room.revealed = false;
    io.to(roomId).emit('room-updated', room);
  });

  socket.on('disconnect', () => {
    rooms.forEach(room => {
      room.participants = room.participants.filter(p => p.id !== userId);
      io.to(room.id).emit('room-updated', room);
    });
  });
});

httpServer.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});

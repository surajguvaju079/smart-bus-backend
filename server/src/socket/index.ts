import { redis, redisSub } from '@/shared/redis/redis';
import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import { Server } from 'socket.io';
import { registerLocationEvents } from './events/location.event';

let io: Server;
export const initSocket = async (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.adapter(createAdapter(redis, redisSub));

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    registerLocationEvents(socket);

    socket.on('join-trip', (tripId: number) => {
      console.log('joining trip:', tripId);
      socket.join(`trip:${tripId}`);
      console.log(`socket ${socket.id} joined room trip:${tripId}`);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

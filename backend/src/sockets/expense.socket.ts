import { Server, Socket } from 'socket.io';

export const setupExpenseSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Join private room based on userId for targeted notifications
    socket.on('join_war_room', (userId: string) => {
      if (!userId) return;
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      // Handle cleanup if necessary
      console.log('Client disconnected:', socket.id);
    });
  });
};

export default {
  setupExpenseSocket,
};

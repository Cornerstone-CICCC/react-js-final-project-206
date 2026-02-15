"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupExpenseSocket = void 0;
const setupExpenseSocket = (io) => {
    io.on('connection', (socket) => {
        // Join private room based on userId for targeted notifications
        socket.on('join_war_room', (userId) => {
            if (!userId)
                return;
            socket.join(userId);
        });
        socket.on('disconnect', () => {
            // Handle cleanup if necessary
            console.log('Client disconnected:', socket.id);
        });
    });
};
exports.setupExpenseSocket = setupExpenseSocket;
exports.default = {
    setupExpenseSocket: exports.setupExpenseSocket,
};

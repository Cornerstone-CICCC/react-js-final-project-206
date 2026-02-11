import { Server, Socket } from 'socket.io';
import expenseService from '../services/expense.service';

// Handle real-time expense updates
export const setupExpenseSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // User joins a room named after their own ID to receive private notifications
    socket.on('join_war_room', (userId: string) => {
      if (!userId) return;
      socket.join(userId);
      console.log(`User ${userId} joined their private War Room socket`);
    });

    // Handle real-time expense creation from the frontend
    socket.on('sendExpense', async (data) => {
      if (!data) {
        console.warn('sendExpense received null or undefined data');
        return;
      }

      const { title, amount, category, paidBy, sharedWith, date, note, sharedWithEmail } = data;

      // Basic validation check
      if (!title || !amount || !category || !paidBy) {
        socket.emit('expense_error', { message: 'Missing required fields' });
        return;
      }

      try {
        // Save to Database
        const newExpense = await expenseService.add({
          title,
          amount,
          category,
          paidBy,
          sharedWith,
          date: date || new Date(),
          note,
          sharedWithEmail,
        });

        if (newExpense) {
          // Notify the Payer (Self)
          socket.emit('expense_saved', newExpense);

          // Notify the Recipient (The "Notification")
          if (newExpense.sharedWith && newExpense.status === 'Pending') {
            const recipientId = newExpense.sharedWith.toString();

            // This triggers the "New Notification" alert on the friend's frontend
            io.to(recipientId).emit('expense_update_received', {
              message: `New expense shared with you: ${title}`,
              data: newExpense,
            });

            console.log(`Real-time notification sent to user ${recipientId}`);
          }
        }
      } catch (err: any) {
        console.error('Socket Error:', err.message);
        socket.emit('expense_error', { message: err.message || 'Failed to save expense' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export default {
  setupExpenseSocket,
};

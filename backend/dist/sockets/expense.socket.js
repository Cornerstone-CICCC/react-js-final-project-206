"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupExpenseSocket = void 0;
const expense_service_1 = __importDefault(require("../services/expense.service"));
// Handle real-time expense updates
const setupExpenseSocket = (io) => {
    io.on('connection', (socket) => {
        // User joins a room named after their own ID to receive private notifications
        socket.on('join_war_room', (userId) => {
            if (!userId)
                return;
            socket.join(userId);
            console.log(`User ${userId} joined their private War Room socket`);
        });
        // Handle real-time expense creation from the frontend
        socket.on('sendExpense', (data) => __awaiter(void 0, void 0, void 0, function* () {
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
                const newExpense = yield expense_service_1.default.add({
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
            }
            catch (err) {
                console.error('Socket Error:', err.message);
                socket.emit('expense_error', { message: err.message || 'Failed to save expense' });
            }
        }));
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
exports.setupExpenseSocket = setupExpenseSocket;
exports.default = {
    setupExpenseSocket: exports.setupExpenseSocket,
};

// Server code
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieSession from 'cookie-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setupExpenseSocket } from './sockets/expense.socket';

// Import route
import userRouter from './routes/user.route';
import expenseRouter from './routes/expense.route';

dotenv.config();

// Create server
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
  throw new Error('Missing cookie keys!');
}

app.use(express.json());

app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_PRIMARY_KEY || process.env.COOKIE_SECONDARY_KEY],
    maxAge: 3 * 30 * 24 * 60 * 60 * 1000, // 3 months
  }),
);

// Routes
app.use('/users', userRouter);
app.use('/expenses', expenseRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server is running!');
});

// Create HTTP server and attach Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

(global as any).io = io;

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI!;
mongoose
  .connect(MONGO_URI, { dbName: 'budget_war_room' })
  .then(() => {
    console.log('Connected to MongoDB database');

    // Start Socket.IO
    setupExpenseSocket(io);

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

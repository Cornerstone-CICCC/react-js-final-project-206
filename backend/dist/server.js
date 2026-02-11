"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server code
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const expense_socket_1 = require("./sockets/expense.socket");
// Import route
const user_route_1 = __importDefault(require("./routes/user.route"));
const expense_route_1 = __importDefault(require("./routes/expense.route"));
dotenv_1.default.config();
// Create server
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
    throw new Error('Missing cookie keys!');
}
app.use(express_1.default.json());
app.use((0, cookie_session_1.default)({
    name: 'session',
    keys: [process.env.COOKIE_PRIMARY_KEY || process.env.COOKIE_SECONDARY_KEY],
    maxAge: 3 * 30 * 24 * 60 * 60 * 1000, // 3 months
}));
// Routes
app.use('/users', user_route_1.default);
app.use('/expenses', expense_route_1.default);
app.get('/', (req, res) => {
    res.status(200).send('Server is running!');
});
// Create HTTP server and attach Socket.IO
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI;
mongoose_1.default
    .connect(MONGO_URI, { dbName: 'budget_war_room' })
    .then(() => {
    console.log('Connected to MongoDB database');
    // Start Socket.IO
    (0, expense_socket_1.setupExpenseSocket)(io);
    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

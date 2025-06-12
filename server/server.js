import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js';
import userRouter from './Routes/userRoutes.js';
import messageRouter from './Routes/messageRoutes.js';
import { Server } from 'socket.io';


// create express app using http

const app = express();
const server = http.createServer(app);

// initialize Socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})

// store online users
export const userSocketMap = {}   //{userId: socketId}

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected")
})


// middleware setup 
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// routes-setup

app.use('/api/status', (req, res) => res.send('Server is running'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// connect to mongoDB

await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`))
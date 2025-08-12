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
    console.log("user connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));


    // to block user

    socket.on('block-user', ({ blockerUserId, blockedUserId }) => {
        console.log(`User ${blockerUserId} blocked ${blockedUserId}`);

        // Blocked user ko notification send karo
        const blockedUserSocketId = userSocketMap[blockedUserId];
        if (blockedUserSocketId) {
            io.to(blockedUserSocketId).emit('user-blocked-you', {
                blockerUserId: blockerUserId,
                message: 'You have been blocked'
            });
        }

        // ✅ NEW: Blocker ko bhi confirmation send karo
        const blockerUserSocketId = userSocketMap[blockerUserId];
        if (blockerUserSocketId) {
            io.to(blockerUserSocketId).emit('user-blocked-by-you', {
                blockedUserId: blockedUserId,
                message: 'User blocked successfully'
            });
        }
    });


    // to unblock user

    socket.on('unblock-user', ({ unblockerUserId, unblockedUserId }) => {
        console.log(`User ${unblockerUserId} unblocked ${unblockedUserId}`);

        // Unblocked user ko notification send karo
        const unblockedUserSocketId = userSocketMap[unblockedUserId];
        if (unblockedUserSocketId) {
            io.to(unblockedUserSocketId).emit('user-unblocked-you', {
                unblockerUserId: unblockerUserId,
                message: 'You have been unblocked'
            });
        }

        // ✅ NEW: Unblocker ko bhi confirmation send karo
        const unblockerUserSocketId = userSocketMap[unblockerUserId];
        if (unblockerUserSocketId) {
            io.to(unblockerUserSocketId).emit('user-unblocked-by-you', {
                unblockedUserId: unblockedUserId,
                message: 'User unblocked successfully'
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

})

const corsOptions = {
    origin: '*',
    credentials: true,
}


// middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

export const ioo = new Server(server, {
    cors: corsOptions
})


// routes-setup

app.use('/api/status', (req, res) => res.send('Server is running'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
app.use("/api/user", userRouter);

// connect to mongoDB

await connectDB();

const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`))

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

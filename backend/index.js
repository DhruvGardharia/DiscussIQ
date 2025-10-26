import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cloudinary from 'cloudinary';
import http from 'http';
import { Server } from 'socket.io';

// import routes
import userRoutes from './routes/userRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// import socket handler
import { setupSocket } from './socket/socket.js';

dotenv.config();
const port = process.env.PORT || 5000;

// Cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.Cloud_Api,
    api_secret: process.env.Cloud_Secret,
});

// Initialize Express app
const app = express();

// Middleware
// Allow CORS from the frontend dev server and allow credentials (cookies)
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/messages', messageRoutes);

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: { origin: "*" },
});
setupSocket(io);

// Connect to Database and Start Server
connectDb().then(() => {
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error("DB connection failed:", err.message);
});

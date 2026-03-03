const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Uploads Folder Statically
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Learnify API is running...');
});

// Socket.io Setup for WebRTC Signaling & Chat
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific class room
  socket.on('join-room', (roomId, userData) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userData, socket.id);

    // Handle WebRTC signaling
    socket.on('offer', (offer, toId, callerUserData) => {
      io.to(toId).emit('offer', offer, socket.id, callerUserData);
    });

    socket.on('answer', (answer, toId) => {
      io.to(toId).emit('answer', answer, socket.id);
    });

    socket.on('ice-candidate', (candidate, toId) => {
      io.to(toId).emit('ice-candidate', candidate, socket.id);
    });

    // Handle chat messages
    socket.on('send-message', (message) => {
      io.to(roomId).emit('receive-message', {
        userData, // Stores full object with _id, name, and role
        message,
        timestamp: new Date()
      });
    });

    // Handle raise hand
    socket.on('raise-hand', (isRaised) => {
      io.to(roomId).emit('hand-raised', userData, isRaised);
    });

    // Handle floating reactions
    socket.on('send-reaction', (reactionData) => {
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(roomId).emit('receive-reaction', reactionData);
    });

    socket.on('allow-student-share', (roomId, allowed) => {
      socket.to(roomId).emit('screen-share-permission', allowed);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      socket.to(roomId).emit('user-disconnected', userData, socket.id);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

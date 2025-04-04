const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Initialize Express and HTTP server
const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Match your React app's URL
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Must match frontend URL
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 30000, // Recover connections for 30s
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`✅ User Connected: ${socket.id}`); // WILL appear in terminal

  // Join room event
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`🚪 User ${socket.id} joined room: ${room}`);
  });

  // Message event
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data); // Broadcast to room
    console.log(`📩 ${socket.id} sent message to room ${data.room}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});

// Error handling
io.on("connection_error", (err) => {
  console.error("Socket.IO error:", err);
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server failed to start:", err);
});
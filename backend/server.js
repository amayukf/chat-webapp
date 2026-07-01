const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    
    // Set 'abis' as admin
    const adminUser = await User.findOne({ username: 'abis' });
    if (adminUser && !adminUser.isAdmin) {
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('👑 abis is now an admin!');
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  Running without MongoDB persistence');
  });

// Models
const User = require('./models/User');
const Message = require('./models/Message');

// ------------------------------
// Authentication Endpoints
// ------------------------------

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already taken' 
      });
    }

    const user = new User({ username, password });
    await user.save();

    // Return user without password
    res.status(201).json({ 
      user: { 
        _id: user._id, 
        username: user.username, 
        online: user.online,
        isAdmin: user.isAdmin
      } 
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Something went wrong' 
    });
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    const user = await User.findOne({ 
      username: username.toLowerCase() 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid username or password' 
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Return user without password
    res.json({ 
      user: { 
        _id: user._id, 
        username: user.username, 
        online: user.online,
        isAdmin: user.isAdmin
      } 
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Something went wrong' 
    });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { adminId } = req.body;
    
    // Verify admin
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's messages
    await Message.deleteMany({
      $or: [
        { sender: req.params.id },
        { recipient: req.params.id }
      ]
    });

    // Notify all clients
    const allUsers = await User.find();
    io.emit('userList', allUsers);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ------------------------------
// Socket.IO
// ------------------------------

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const userSocketMap = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('👤 New client connected:', socket.id);

  // Send current user list to new client
  User.find().then((allUsers) => {
    console.log('📤 Sending user list to client:', allUsers);
    socket.emit('userList', allUsers);
  }).catch((err) => console.error('❌ Error sending user list:', err));

  socket.on('register', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.online = true;
        await user.save();

        userSocketMap.set(user._id.toString(), socket.id);
        socket.userId = user._id.toString();

        const allUsers = await User.find();
        io.emit('userList', allUsers);
        console.log(`✅ ${user.username} is now online!`);
      }
    } catch (error) {
      console.error('❌ Error registering user:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, recipientId, content } = data;

      const message = new Message({ sender: senderId, recipient: recipientId, content });
      const savedMessage = await message.save();

      await savedMessage.populate('sender', 'username');
      await savedMessage.populate('recipient', 'username');

      const recipientSocketId = userSocketMap.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receiveMessage', savedMessage);
      }

      socket.emit('messageSent', savedMessage);
      console.log(`💬 Message sent`);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  socket.on('markSeen', async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && !message.seen) {
        message.seen = true;
        await message.save();

        const userMessages = await Message.find({
          $or: [{ sender: userId }, { recipient: userId }]
        });
        socket.emit('messagesUpdated', userMessages);

        const senderSocketId = userSocketMap.get(message.sender.toString());
        if (senderSocketId) {
          const senderMessages = await Message.find({
            $or: [{ sender: message.sender.toString() }, { recipient: message.sender.toString() }]
          });
          io.to(senderSocketId).emit('messagesUpdated', senderMessages);
        }
      }
    } catch (error) {
      console.error('❌ Error marking message as seen:', error);
    }
  });

  socket.on('getMessages', async (userId) => {
    try {
      const messages = await Message.find({
        $or: [{ sender: userId }, { recipient: userId }]
      }).sort({ createdAt: 1 });
      socket.emit('messagesLoaded', messages);
    } catch (error) {
      console.error('❌ Error getting messages:', error);
    }
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      try {
        const user = await User.findById(socket.userId);
        if (user) {
          user.online = false;
          await user.save();

          const allUsers = await User.find();
          io.emit('userList', allUsers);

          console.log(`👋 ${user.username} disconnected`);
        }
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
      userSocketMap.delete(socket.userId);
    }
    console.log('❌ Client disconnected');
  });
});

// Serve frontend
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});

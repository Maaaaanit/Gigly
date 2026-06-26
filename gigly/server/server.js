require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io — real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) onlineUsers.set(userId, socket.id);

  socket.on('join_contract', (contractId) => {
    socket.join(`contract_${contractId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`contract_${data.contractId}`).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(`contract_${data.contractId}`).emit('typing', { userId: data.userId });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`contract_${data.contractId}`).emit('stop_typing', { userId: data.userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
  });
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ["http://localhost:5173", process.env.CLIENT_URL],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/freelancers', require('./routes/freelancerRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/milestones', require('./routes/milestoneRoutes'));
app.use('/api/timesheets', require('./routes/timesheetRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Gigly API running', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Gigly server running on port ${PORT}`));

module.exports = { app, io };

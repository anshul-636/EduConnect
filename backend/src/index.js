require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./utils/passport');
const { setupWebSocket } = require('./utils/websocket');

const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');
const eventRoutes = require('./routes/event.routes');
const resourceRoutes = require('./routes/resource.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const certificateRoutes = require('./routes/certificate.routes');
const forumRoutes = require('./routes/forum.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
app.use(passport.initialize());

app.use(passport.session());

const API = '/api/v1';
app.use(API + '/auth', authRoutes);
app.use(API + '/schools', schoolRoutes);
app.use(API + '/events', eventRoutes);
app.use(API + '/resources', resourceRoutes);
app.use(API + '/leaderboard', leaderboardRoutes);
app.use(API + '/certificates', certificateRoutes);
app.use(API + '/forum', forumRoutes);
app.use(API + '/ai', aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'EduConnect', version: '1.0.0' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log('✅ EduConnect backend running on http://localhost:' + PORT);
  console.log('🔌 WebSocket ready at ws://localhost:' + PORT + '/ws/leaderboard');
  console.log('🤖 AI Service proxied from ' + (process.env.AI_SERVICE_URL || 'http://localhost:8001'));
});

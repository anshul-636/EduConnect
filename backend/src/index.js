require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const passport = require('./utils/passport');
const { setupWebSocket } = require('./utils/websocket');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const schoolRoutes       = require('./routes/school.routes');
const eventRoutes        = require('./routes/event.routes');
const resourceRoutes     = require('./routes/resource.routes');
const leaderboardRoutes  = require('./routes/leaderboard.routes');
const certificateRoutes  = require('./routes/certificate.routes');
const forumRoutes        = require('./routes/forum.routes');
const aiRoutes           = require('./routes/ai.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const internalRoutes     = require('./routes/internal.routes');
const classRoutes        = require('./routes/class.routes');
const assignmentRoutes   = require('./routes/assignment.routes');
const attendanceRoutes   = require('./routes/attendance.routes');
const announcementRoutes = require('./routes/announcement.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
app.use(passport.initialize());
app.use(passport.session());

const API = '/api/v1';
app.use(API + '/auth',          authRoutes);
app.use(API + '/schools',       schoolRoutes);
app.use(API + '/events',        eventRoutes);
app.use(API + '/resources',     resourceRoutes);
app.use(API + '/leaderboard',   leaderboardRoutes);
app.use(API + '/certificates',  certificateRoutes);
app.use(API + '/forum',         forumRoutes);
app.use(API + '/ai',            aiRoutes);
app.use(API + '/dashboard',     dashboardRoutes);
app.use(API + '/notifications', notificationRoutes);
app.use(API + '/classes',       classRoutes);
app.use(API + '/assignments',   assignmentRoutes);
app.use(API + '/attendance',    attendanceRoutes);
app.use(API + '/announcements', announcementRoutes);
app.use('/internal',            internalRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', version: '2.0.0' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => {
  if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Record not found.' });
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

const server = http.createServer(app);
setupWebSocket(server);
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log(`  ║  EduConnect v2  →  http://localhost:${PORT}  ║`);
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
});

// Start cron AFTER server is listening
require('./utils/cron');

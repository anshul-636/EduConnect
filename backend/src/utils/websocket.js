const WebSocket = require('ws');
const leaderboardService = require('../services/leaderboard.service');

// Map of eventId -> Set of connected clients
const rooms = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/leaderboard' });

  wss.on('connection', (ws, req) => {
    // Extract eventId from URL: /ws/leaderboard?eventId=xxx
    const url = new URL(req.url, 'http://localhost');
    const eventId = url.searchParams.get('eventId');

    if (!eventId) { ws.close(); return; }

    // Join room
    if (!rooms.has(eventId)) rooms.set(eventId, new Set());
    rooms.get(eventId).add(ws);
    console.log('WS client joined event:', eventId, '| clients:', rooms.get(eventId).size);

    // Send current leaderboard on connect
    leaderboardService.getByEvent(eventId).then(data => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'LEADERBOARD_UPDATE', data }));
      }
    }).catch(console.error);

    ws.on('close', () => {
      if (rooms.has(eventId)) {
        rooms.get(eventId).delete(ws);
        if (rooms.get(eventId).size === 0) rooms.delete(eventId);
      }
    });

    ws.on('error', console.error);
  });

  return wss;
}

// Broadcast updated leaderboard to all clients in a room
async function broadcastLeaderboard(eventId) {
  if (!rooms.has(eventId)) return;
  try {
    const data = await leaderboardService.getByEvent(eventId);
    const msg = JSON.stringify({ type: 'LEADERBOARD_UPDATE', data });
    rooms.get(eventId).forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  } catch (err) { console.error('Broadcast error:', err); }
}

module.exports = { setupWebSocket, broadcastLeaderboard };

/**
 * websocket.js — Updated with per-user broadcast support.
 *
 * ADDED: broadcastToUser(userId, payload) — sends a message to all
 *        WebSocket connections belonging to a specific user.
 *        Used by notificationService for instant in-app notifications.
 *
 * EXISTING: leaderboard broadcast unchanged.
 */

const WebSocket = require('ws');

let wss = null;

// Map: userId → Set of WebSocket connections
const userConnections = new Map();

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Client must send { type: 'auth', userId: '...' } as first message
    ws.userId = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);

        if (msg.type === 'auth' && msg.userId) {
          ws.userId = msg.userId;

          if (!userConnections.has(msg.userId)) {
            userConnections.set(msg.userId, new Set());
          }
          userConnections.get(msg.userId).add(ws);

          ws.send(JSON.stringify({ type: 'auth_ok', userId: msg.userId }));
        }

        // Leaderboard subscription (existing)
        if (msg.type === 'subscribe_leaderboard') {
          ws.subscribedLeaderboard = true;
        }
      } catch (_) {}
    });

    ws.on('close', () => {
      if (ws.userId && userConnections.has(ws.userId)) {
        userConnections.get(ws.userId).delete(ws);
        if (userConnections.get(ws.userId).size === 0) {
          userConnections.delete(ws.userId);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WS error]', err.message);
    });
  });

  console.log('🔌 WebSocket server ready at /ws');
}

/** Broadcast leaderboard update to all subscribed clients (existing behaviour). */
function broadcastLeaderboardUpdate(data) {
  if (!wss) return;
  const msg = JSON.stringify({ type: 'leaderboard_update', data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.subscribedLeaderboard) {
      client.send(msg);
    }
  });
}

/**
 * NEW: Send a message to all WebSocket connections owned by a specific user.
 * Used by notificationService for real-time notification delivery.
 *
 * @param {string} userId
 * @param {{ event: string, payload: any }} message
 */
function broadcastToUser(userId, message) {
  const connections = userConnections.get(userId);
  if (!connections || connections.size === 0) return; // User not connected

  const msg = JSON.stringify(message);
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

module.exports = { setupWebSocket, broadcastLeaderboardUpdate, broadcastToUser };

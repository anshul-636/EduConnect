import { useEffect, useRef, useState } from 'react';

const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:3000') + '/ws';

const useWebSocket = (eventId) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    // Connect to the correct /ws path (no sub-path)
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setConnected(true);
      // Subscribe to leaderboard updates for this event
      ws.current.send(JSON.stringify({ type: 'subscribe_leaderboard', eventId }));
    };

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // Backend broadcasts 'leaderboard_update' (lowercase)
        if (msg.type === 'leaderboard_update' && msg.data) {
          setLeaderboard(msg.data);
        }
      } catch (err) { console.error('WS parse error:', err); }
    };

    ws.current.onclose = () => setConnected(false);
    ws.current.onerror = (err) => console.error('WS error:', err);

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [eventId]);

  return { leaderboard, connected };
};

export default useWebSocket;
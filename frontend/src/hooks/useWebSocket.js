import { useEffect, useRef, useState } from 'react';

const useWebSocket = (eventId) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    const url = 'ws://localhost:3000/ws/leaderboard?eventId=' + eventId;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected for event:', eventId);
    };

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'LEADERBOARD_UPDATE') setLeaderboard(msg.data);
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

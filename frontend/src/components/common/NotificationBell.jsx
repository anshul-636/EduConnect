
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationsService';
import useAuthStore from '../../store/authStore';

const TYPE_ICONS = {
  EVENT_REGISTERED:  '📅',
  EVENT_REMINDER:    '⏰',
  EVENT_RESULT:      '🏆',
  CERTIFICATE_READY: '🏅',
  ASSIGNMENT_CREATED:'📝',
  ASSIGNMENT_GRADED: '✅',
  ANNOUNCEMENT:      '📢',
  FORUM_REPLY:       '💬',
};

const typeLink = (n) => {
  const d = n.data || {};
  if (d.eventId)      return `/events/${d.eventId}`;
  if (d.certId)       return `/certificates`;
  if (d.assignmentId) return `/assignments/${d.assignmentId}`;
  if (d.postId)       return `/forum/${d.postId}`;
  return null;
};

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);

  // ── HTTP fetch ──────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll({ limit: 15 });
      setItems(res.data.items || []);
      setUnread(res.data.unreadCount || 0);
    } catch (_) {
      // Non-critical — silently swallow
    } finally {
      setLoading(false);
    }
  }, []);

  // ── WebSocket for instant push ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Authenticate the connection so the backend knows which user this is
        ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          // The backend sends { event: 'notification', payload: { notification } }
          if (msg.event === 'notification' && msg.payload?.notification) {
            const notif = msg.payload.notification;
            setItems(prev => [notif, ...prev].slice(0, 15));
            setUnread(u => u + 1);
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        // Reconnect after 5s if still mounted
        setTimeout(() => {
          if (wsRef.current === ws) connect();
        }, 5000);
      };
    };

    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  // ── Initial load + fallback 60s poll (WS covers live updates) ──────────
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Close on outside click ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (_) {}
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-brand-600 text-white rounded-full px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
            <span className="font-semibold text-dark-100 text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center py-10 text-dark-500 text-sm">
                <div className="text-2xl mb-2">🔔</div>
                You're all caught up!
              </div>
            )}
            {items.map((n) => {
              const link = typeLink(n);
              const Wrapper = link ? Link : 'div';
              return (
                <Wrapper
                  key={n.id}
                  to={link || undefined}
                  onClick={() => !n.isRead && handleMarkRead({ preventDefault: ()=>{}, stopPropagation: ()=>{} }, n.id)}
                  className={`flex gap-3 px-4 py-3 border-b border-dark-700/50 hover:bg-dark-700/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-brand-950/20' : ''}`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.isRead ? 'text-dark-300' : 'text-dark-100 font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-dark-600 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={(e) => handleMarkRead(e, n.id)}
                      className="flex-shrink-0 w-2 h-2 mt-2 bg-brand-500 rounded-full hover:bg-brand-400"
                      aria-label="Mark as read"/>
                  )}
                </Wrapper>
              );
            })}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-dark-700 text-center">
              <Link to="/notifications" onClick={() => setOpen(false)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

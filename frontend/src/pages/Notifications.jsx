import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import notificationService from '../services/notificationsService';

const TYPE_ICONS = {
  EVENT_REGISTERED: '📅',
  EVENT_REMINDER: '⏰',
  EVENT_RESULT: '🏆',
  CERTIFICATE_READY: '🏅',
  ASSIGNMENT_CREATED: '📝',
  ASSIGNMENT_GRADED: '✅',
  ANNOUNCEMENT: '📢',
  FORUM_REPLY: '💬',
};

const TYPE_COLORS = {
  EVENT_REGISTERED: 'border-l-blue-500',
  EVENT_REMINDER: 'border-l-amber-500',
  EVENT_RESULT: 'border-l-yellow-500',
  CERTIFICATE_READY: 'border-l-emerald-500',
  ASSIGNMENT_CREATED: 'border-l-violet-500',
  ASSIGNMENT_GRADED: 'border-l-green-500',
  ANNOUNCEMENT: 'border-l-orange-500',
  FORUM_REPLY: 'border-l-cyan-500',
};

function typeLink(n) {
  const d = n.data || {};
  if (d.eventId) return `/events/${d.eventId}`;
  if (d.certId) return `/certificates`;
  if (d.assignmentId) return `/assignments/${d.assignmentId}`;
  if (d.postId) return `/forum/${d.postId}`;
  return null;
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async (p = 1, uo = unreadOnly) => {
    setLoading(true);
    try {
      const r = await notificationService.getAll({ page: p, limit: 20, unreadOnly: uo });
      const d = r.data;
      if (p === 1) setItems(d.items || []);
      else setItems(prev => [...prev, ...(d.items || [])]);
      setUnread(d.unreadCount || 0);
      setHasMore((d.pagination?.page || 1) < (d.pagination?.totalPages || 1));
      setPage(p);
    } catch (_) { }
    setLoading(false);
  };

  useEffect(() => { load(1, unreadOnly); }, [unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch (_) { }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (_) { }
    setMarkingAll(false);
  };

  const handleDelete = async (id, isRead) => {
    try {
      await notificationService.delete(id);
      setItems(prev => prev.filter(n => n.id !== id));
      if (!isRead) setUnread(u => Math.max(0, u - 1));
    } catch (_) { }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <Bell className="text-brand-400" size={24} />
              Notifications
            </h1>
            <p className="text-dark-400 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnreadOnly(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${unreadOnly ? 'bg-brand-600/20 text-brand-300 border-brand-500/40' : 'text-dark-400 border-dark-700 hover:bg-dark-800'}`}
            >
              <Filter size={13} /> {unreadOnly ? 'Showing Unread' : 'All'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:text-dark-100 text-sm font-medium transition-all disabled:opacity-50"
              >
                <CheckCheck size={13} />
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-dark-500" />
            </div>
            <p className="text-dark-300 font-semibold text-lg">
              {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-dark-500 text-sm mt-1">
              {unreadOnly ? 'Switch to "All" to see past notifications.' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(n => {
              const link = typeLink(n);
              const Wrapper = link ? Link : 'div';
              const borderColor = TYPE_COLORS[n.type] || 'border-l-dark-600';
              return (
                <div key={n.id} className={`group relative flex items-start gap-4 p-4 rounded-2xl border border-l-4 transition-all ${borderColor} ${n.isRead ? 'bg-dark-800/60 border-dark-700/60' : 'bg-dark-800 border-dark-700'}`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${n.isRead ? 'bg-dark-700' : 'bg-dark-700/80'}`}>
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>

                  {/* Content — wrapped in Link if navigable */}
                  <Wrapper
                    to={link || undefined}
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                  >
                    <p className={`text-sm font-semibold leading-snug ${n.isRead ? 'text-dark-300' : 'text-dark-100'}`}>
                      {n.title}
                    </p>
                    <p className="text-dark-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-dark-600 text-xs mt-1">{timeAgo(n.createdAt)}</p>
                  </Wrapper>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-emerald-400 hover:bg-emerald-900/20 transition-all"
                        title="Mark as read"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id, n.isRead)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-dark-600 hover:text-red-400 hover:bg-red-900/20 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 ml-1" />
                    )}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={() => load(page + 1)}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-dark-700 text-dark-400 hover:bg-dark-800 hover:text-dark-200 text-sm font-medium transition-all disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

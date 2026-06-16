import { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Trash2, Building2, User, GraduationCap } from 'lucide-react';
import Layout from '../components/common/Layout';
import announcementService from '../services/announcementService';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';

const ROLE_ICONS = { SCHOOL: Building2, TEACHER: User, ADMIN: GraduationCap, STUDENT: User };
const ROLE_COLORS = {
  SCHOOL:  'text-purple-300 bg-purple-900/30 border-purple-700/40',
  TEACHER: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40',
  ADMIN:   'text-red-300 bg-red-900/30 border-red-700/40',
  STUDENT: 'text-blue-300 bg-blue-900/30 border-blue-700/40',
};
const TARGET_COLORS = {
  ALL:     'text-dark-300 bg-dark-700 border-dark-600',
  STUDENT: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/40',
  TEACHER: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40',
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Announcements() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title:'', content:'', targetRole:'ALL', classId:'' });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const canCreate = ['SCHOOL','TEACHER','ADMIN'].includes(user?.role);

  useEffect(() => { load(1); }, []);
  useEffect(() => { if (canCreate) classService.getAll({}).then(r => setClasses(r.data.data||[])).catch(()=>{}); }, []);

  const load = async (p) => {
    setLoading(true);
    try {
      const r = await announcementService.getAll({ page: p, limit: 15 });
      const data = r.data;
      if (p === 1) setItems(data.items || []);
      else setItems(prev => [...prev, ...(data.items || [])]);
      setHasMore((data.pagination?.page || 1) < (data.pagination?.totalPages || 1));
      setPage(p);
    } catch (_) {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setCreating(true);
    try {
      await announcementService.create({ ...form, classId: form.classId || undefined });
      setCreateOpen(false);
      setForm({ title:'', content:'', targetRole:'ALL', classId:'' });
      load(1);
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    setDeleting(id);
    try {
      await announcementService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (_) {}
    setDeleting(null);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <Megaphone className="text-amber-400" size={24}/> Announcements
            </h1>
            <p className="text-dark-400 text-sm mt-1">School-wide updates and notices</p>
          </div>
          {canCreate && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition-opacity">
              <Plus size={16}/> Post Announcement
            </button>
          )}
        </div>

        {/* Feed */}
        {loading && items.length === 0 ? (
          <div className="space-y-4">
            {[...Array(4)].map((_,i) => <div key={i} className="h-32 bg-dark-800 rounded-2xl animate-pulse"/>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Megaphone size={28} className="text-dark-500"/>
            </div>
            <p className="text-dark-300 font-semibold text-lg">No announcements yet</p>
            <p className="text-dark-500 text-sm mt-1">
              {canCreate ? 'Post your first announcement.' : 'Nothing posted yet — check back soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => {
              const RoleIcon = ROLE_ICONS[item.author?.role] || User;
              const isOwn = item.authorId === user?.id;
              return (
                <div key={item.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 group hover:border-amber-500/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Megaphone size={18} className="text-white"/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${ROLE_COLORS[item.author?.role]||'text-dark-400 bg-dark-700 border-dark-600'}`}>
                            <RoleIcon size={9} className="inline mr-1"/>
                            {item.author?.role}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TARGET_COLORS[item.targetRole]||TARGET_COLORS.ALL}`}>
                            → {item.targetRole === 'ALL' ? 'Everyone' : item.targetRole}
                          </span>
                          {item.class && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-400 border border-dark-600">
                              {item.class.name}
                            </span>
                          )}
                        </div>
                        <p className="text-dark-500 text-xs mt-0.5">{item.author?.name} · {timeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                    {isOwn && (
                      <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-900/20 transition-all flex-shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-dark-100 text-lg mb-2">{item.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
                </div>
              );
            })}

            {hasMore && (
              <button onClick={() => load(page + 1)} disabled={loading}
                className="w-full py-3 rounded-xl border border-dark-700 text-dark-400 hover:bg-dark-800 hover:text-dark-200 text-sm font-medium transition-all disabled:opacity-50">
                {loading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
              <h3 className="font-display font-semibold text-dark-100">Post Announcement</h3>
              <button onClick={() => setCreateOpen(false)} className="text-dark-500 hover:text-dark-200"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                  placeholder="Announcement title"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-amber-500"/>
              </div>
              <div>
                <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Message *</label>
                <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}
                  placeholder="Write your announcement…" rows={4}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-amber-500 resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Audience</label>
                  <select value={form.targetRole} onChange={e=>setForm(p=>({...p,targetRole:e.target.value}))}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-amber-500">
                    <option value="ALL">Everyone</option>
                    <option value="STUDENT">Students only</option>
                    <option value="TEACHER">Teachers only</option>
                  </select>
                </div>
                {classes.length > 0 && (
                  <div>
                    <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Class (optional)</label>
                    <select value={form.classId} onChange={e=>setForm(p=>({...p,classId:e.target.value}))}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-amber-500">
                      <option value="">School-wide</option>
                      {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button onClick={handleCreate} disabled={creating||!form.title||!form.content}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition-opacity disabled:opacity-50">
                {creating ? 'Posting…' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

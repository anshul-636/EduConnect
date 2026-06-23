import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Clock, CheckCircle2, AlertCircle, XCircle, X, Calendar } from 'lucide-react';
import Layout from '../components/common/Layout';
import assignmentService from '../services/assignmentService';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';

const STATUS_STYLE = {
  PENDING: { label: 'Pending', icon: Clock, cls: 'text-amber-300  bg-amber-900/30  border-amber-700/50' },
  OVERDUE: { label: 'Overdue', icon: AlertCircle, cls: 'text-red-300    bg-red-900/30    border-red-700/50' },
  SUBMITTED: { label: 'Submitted', icon: CheckCircle2, cls: 'text-blue-300   bg-blue-900/30   border-blue-700/50' },
  RESUBMITTED: { label: 'Resubmit.', icon: CheckCircle2, cls: 'text-cyan-300   bg-cyan-900/30   border-cyan-700/50' },
  GRADED: { label: 'Graded', icon: CheckCircle2, cls: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50' },
  LATE: { label: 'Late', icon: XCircle, cls: 'text-orange-300 bg-orange-900/30 border-orange-700/50' },
};

const Badge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
      <Icon size={11} />{s.label}
    </span>
  );
};

const daysLeft = (dueDate) => {
  const diff = Math.ceil((new Date(dueDate) - Date.now()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-400' };
  if (diff === 0) return { label: 'Due today', cls: 'text-amber-400' };
  if (diff <= 3) return { label: `${diff}d left`, cls: 'text-amber-400' };
  return { label: `${diff}d left`, cls: 'text-dark-400' };
};

export default function Assignments() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100, classId: '', allowLate: false });
  const [creating, setCreating] = useState(false);
  useScrollReveal();

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SCHOOL';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [assignRes, classRes] = await Promise.all([
        assignmentService.getMine(),
        classService.getAll({}),
      ]);
      setItems(assignRes.data.data || []);
      const cls = classRes.data.data || [];
      setClasses(cls);
      if (cls.length) setForm(p => ({ ...p, classId: cls[0].id }));
    } catch (_) { }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.dueDate || !form.classId) return;
    setCreating(true);
    try {
      await assignmentService.create(form);
      setCreateOpen(false);
      setForm(p => ({ ...p, title: '', description: '', dueDate: '', maxScore: 100, allowLate: false }));
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setCreating(false);
  };

  const filtered = filter === 'ALL' ? items : items.filter(a => {
    const s = a.studentStatus || (a.mySubmission?.status) || 'PENDING';
    return s === filter;
  });

  const FILTERS = isTeacher
    ? ['ALL']
    : ['ALL', 'PENDING', 'OVERDUE', 'SUBMITTED', 'GRADED'];

  const stats = isTeacher ? null : {
    total: items.length,
    pending: items.filter(a => (a.studentStatus || 'PENDING') === 'PENDING').length,
    graded: items.filter(a => (a.studentStatus || '') === 'GRADED').length,
    overdue: items.filter(a => (a.studentStatus || 'PENDING') === 'OVERDUE').length,
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 reveal">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <ClipboardList className="text-violet-400" size={24} /> Assignments
            </h1>
            <p className="text-dark-400 text-sm mt-1">{items.length} total assignments</p>
          </div>
          {isTeacher && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition-opacity shadow-glow">
              <Plus size={16} /> Create Assignment
            </button>
          )}
        </div>

        {/* Student stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', val: stats.total, cls: 'text-white' },
              { label: 'Pending', val: stats.pending, cls: 'text-amber-400' },
              { label: 'Graded', val: stats.graded, cls: 'text-emerald-400' },
              { label: 'Overdue', val: stats.overdue, cls: 'text-red-400' },
            ].map(({ label, val, cls }, i) => (
              <div key={label} className={`glass rounded-2xl p-5 border border-white/5 reveal delay-${i + 1}`}>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                <p className={`font-display font-black text-3xl tracking-tight leading-none ${cls}`}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {FILTERS.length > 1 && (
          <div className="flex gap-2.5 mb-6 flex-wrap reveal delay-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-300 shadow-sm ${filter === f ? 'bg-violet-500 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}>
                {f === 'ALL' ? 'All Assignments' : STATUS_STYLE[f]?.label || f}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 reveal">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-dark-500" />
            </div>
            <p className="text-dark-300 font-semibold text-lg">No assignments here</p>
            <p className="text-dark-500 text-sm mt-1">
              {isTeacher ? 'Create your first assignment to get started.' : 'Check back soon for new work.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const status = a.studentStatus || 'PENDING';
              const myScore = a.mySubmission?.score;
              const dl = daysLeft(a.dueDate);
              const subCount = a._count?.submissions ?? 0;
              return (
                <Link key={a.id} to={`/assignments/${a.id}`}
                  className={`group card-hover relative overflow-hidden flex items-center gap-5 p-5 reveal-left delay-${Math.min((i % 8) + 1, 8)}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-[30px] transition-all duration-300 group-hover:scale-125 group-hover:opacity-20 bg-gradient-to-r from-violet-500 to-fuchsia-600" />
                  
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-800/40 border border-violet-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                    <ClipboardList size={22} className="text-violet-400 group-hover:text-violet-300 transition-colors" />
                  </div>
                  
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="text-white font-display font-bold text-lg group-hover:text-violet-300 transition-colors truncate tracking-tight">{a.title}</h3>
                      {!isTeacher && <Badge status={status} />}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-slate-400 text-xs font-medium">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded border border-white/5"><Calendar size={12} className="text-brand-400" /> Due {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {a.class?.name}</span>
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {a.teacher?.name}</span>
                      {isTeacher && <span className="text-violet-400 font-bold ml-auto px-2 py-1 bg-violet-500/10 rounded-full">{subCount} submission{subCount !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  
                  <div className="relative z-10 pl-4 border-l border-white/5 text-right flex-shrink-0">
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${dl.cls}`}>{dl.label}</p>
                    {myScore != null && (
                      <p className="text-emerald-400 font-display font-black text-xl tracking-tight mt-1">{myScore}<span className="text-slate-500 text-sm font-medium">/{a.maxScore}</span></p>
                    )}
                    <p className="text-slate-500 font-medium text-[10px] mt-1 uppercase tracking-wider">Max Score: {a.maxScore}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
              <h3 className="font-display font-semibold text-dark-100">Create Assignment</h3>
              <button onClick={() => setCreateOpen(false)} className="text-dark-500 hover:text-dark-200"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-sm">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Assignment title"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-violet-500 mt-1" />
              </div>
              <div>
                <label className="label-sm">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What students need to do…" rows={3}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-violet-500 resize-none mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-sm">Class *</label>
                  <select value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-violet-500 mt-1">
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-sm">Max Score</label>
                  <input type="number" value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-violet-500 mt-1" />
                </div>
              </div>
              <div>
                <label className="label-sm">Due Date *</label>
                <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-violet-500 mt-1" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allowLate} onChange={e => setForm(p => ({ ...p, allowLate: e.target.checked }))}
                  className="w-4 h-4 rounded accent-violet-500" />
                <span className="text-dark-300 text-sm">Allow late submissions</span>
              </label>
              <button onClick={handleCreate} disabled={creating || !form.title || !form.dueDate}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

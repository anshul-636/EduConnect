import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, X, GraduationCap, UserPlus, BookOpen, UserCheck } from 'lucide-react';
import Layout from '../components/common/Layout';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';

const GRADES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D','E','F'];

const GRAD_COLORS = [
  'from-violet-600 to-purple-700', 'from-cyan-600 to-blue-700',
  'from-emerald-600 to-teal-700',  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',     'from-indigo-600 to-blue-700',
];
const getGrad = (name) => GRAD_COLORS[(name?.charCodeAt(0)||0) % GRAD_COLORS.length];

export default function Classes() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name:'', grade:'10', section:'A', year: new Date().getFullYear() });
  const [creating, setCreating] = useState(false);

  const canCreate = user?.role === 'SCHOOL' || user?.role === 'ADMIN';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await classService.getAll({});
      setClasses(r.data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name) {
      setForm(p => ({ ...p, name: `Grade ${form.grade}-${form.section}` }));
    }
    setCreating(true);
    try {
      await classService.create({
        name: form.name || `Grade ${form.grade}-${form.section}`,
        grade: form.grade,
        section: form.section,
        year: parseInt(form.year),
      });
      setCreateOpen(false);
      setForm({ name:'', grade:'10', section:'A', year: new Date().getFullYear() });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create class'); }
    setCreating(false);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <GraduationCap className="text-cyan-400" size={24}/> Classes
            </h1>
            <p className="text-dark-400 text-sm mt-1">{classes.length} class{classes.length!==1?'es':''} total</p>
          </div>
          {canCreate && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity shadow-glow">
              <Plus size={16}/> New Class
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_,i) => <div key={i} className="h-44 bg-dark-800 rounded-2xl animate-pulse"/>)}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-dark-500"/>
            </div>
            <p className="text-dark-300 font-semibold text-lg">No classes yet</p>
            <p className="text-dark-500 text-sm mt-1">
              {canCreate ? 'Create your first class to get started.' : 'No classes have been set up yet.'}
            </p>
            {canCreate && (
              <button onClick={() => setCreateOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity">
                <Plus size={16}/> Create First Class
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Link key={cls.id} to={`/classes/${cls.id}`}
                className="group bg-dark-800 border border-dark-700 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-cyan-900/20">
                {/* Gradient top */}
                <div className={`h-2 bg-gradient-to-r ${getGrad(cls.name)}`}/>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-display font-bold text-lg ${getGrad(cls.name)}`}>
                      {cls.grade}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-dark-700 text-dark-400 rounded-lg border border-dark-600 uppercase tracking-wide">
                      {cls.year}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-dark-100 group-hover:text-cyan-300 transition-colors text-lg">{cls.name}</h3>
                  <p className="text-dark-500 text-xs mt-0.5">Grade {cls.grade} · Section {cls.section}</p>

                  {cls.teacher && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-dark-900 rounded-xl border border-dark-700">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {cls.teacher.name?.charAt(0)}
                      </div>
                      <span className="text-dark-300 text-xs truncate">{cls.teacher.name}</span>
                      <span className="text-dark-600 text-[10px] ml-auto">Class Teacher</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-4 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><Users size={11} className="text-cyan-500"/>{cls._count?.enrollments ?? 0} students</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} className="text-violet-500"/>{cls._count?.assignments ?? 0} assignments</span>
                    <span className="flex items-center gap-1"><UserCheck size={11} className="text-emerald-500"/>{cls._count?.attendances ?? 0} records</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
              <h3 className="font-display font-semibold text-dark-100 flex items-center gap-2">
                <Plus size={16} className="text-cyan-400"/> New Class
              </h3>
              <button onClick={() => setCreateOpen(false)} className="text-dark-500 hover:text-dark-200"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Grade</label>
                  <select value={form.grade} onChange={e => { setForm(p=>({...p,grade:e.target.value,name:`Grade ${e.target.value}-${p.section}`})); }}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-cyan-500">
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Section</label>
                  <select value={form.section} onChange={e => setForm(p=>({...p,section:e.target.value,name:`Grade ${p.grade}-${e.target.value}`}))}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-cyan-500">
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Class Name</label>
                <input value={form.name || `Grade ${form.grade}-${form.section}`}
                  onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  placeholder="e.g. Grade 10-A"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-cyan-500"/>
              </div>
              <div>
                <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">Academic Year</label>
                <input type="number" value={form.year} onChange={e => setForm(p=>({...p,year:e.target.value}))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-cyan-500"/>
              </div>
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

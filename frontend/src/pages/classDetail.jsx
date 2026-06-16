import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, UserPlus, Trash2, X, Search } from 'lucide-react';
import Layout from '../components/common/Layout';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export default function ClassDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState('students');

  const canManage = user?.role === 'SCHOOL' || user?.role === 'ADMIN';

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try { const r = await classService.getById(id); setCls(r.data.data); }
    catch (_) {}
    setLoading(false);
  };

  const searchStudents = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const r = await api.get(`/schools/members?role=STUDENT&search=${q}`);
      setSearchResults(r.data.data || []);
    } catch (_) { setSearchResults([]); }
    setSearching(false);
  };

  const handleEnroll = async (studentId) => {
    try {
      await classService.enroll(id, studentId);
      load();
      setEnrollOpen(false);
      setSearch(''); setSearchResults([]);
    } catch (e) { alert(e.response?.data?.message || 'Enroll failed'); }
  };

  const handleUnenroll = async (studentId, name) => {
    if (!confirm(`Remove ${name} from this class?`)) return;
    try { await classService.unenroll(id, studentId); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Layout><div className="max-w-4xl mx-auto space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse"/>)}</div></Layout>;
  if (!cls) return <Layout><div className="text-center py-20 text-dark-400">Class not found.</div></Layout>;

  const enrolledIds = new Set((cls.enrollments||[]).map(e => e.user?.id));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link to="/classes" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 text-sm mb-5 transition-colors">
          <ArrowLeft size={14}/> Back to Classes
        </Link>

        {/* Header */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-2xl text-dark-50">{cls.name}</h1>
              <p className="text-dark-400 text-sm mt-1">Grade {cls.grade} · Section {cls.section} · {cls.year}</p>
              {cls.school && <p className="text-dark-500 text-xs mt-0.5">{cls.school.name}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-dark-900 rounded-xl border border-dark-700">
                <p className="font-bold text-xl text-dark-100">{cls.enrollments?.length || 0}</p>
                <p className="text-dark-500 text-xs">Students</p>
              </div>
              <div className="text-center px-4 py-2 bg-dark-900 rounded-xl border border-dark-700">
                <p className="font-bold text-xl text-dark-100">{cls._count?.assignments || 0}</p>
                <p className="text-dark-500 text-xs">Assignments</p>
              </div>
            </div>
          </div>
          {cls.teacher && (
            <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-dark-900 rounded-xl border border-dark-700 w-fit">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {cls.teacher.name?.charAt(0)}
              </div>
              <span className="text-dark-200 text-sm">{cls.teacher.name}</span>
              <span className="text-dark-600 text-xs">Class Teacher</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['students','Students'], ['timetable','Timetable']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${tab===key ? 'bg-brand-600/20 text-brand-300 border-brand-500/40' : 'text-dark-400 border-dark-700 hover:bg-dark-800'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-dark-400 text-sm">{cls.enrollments?.length || 0} enrolled</p>
              {canManage && (
                <button onClick={() => setEnrollOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-brand-600 to-purple-600 hover:opacity-90 transition-opacity">
                  <UserPlus size={14}/> Enroll Student
                </button>
              )}
            </div>

            {cls.enrollments?.length === 0 ? (
              <div className="text-center py-16">
                <Users size={28} className="text-dark-500 mx-auto mb-3"/>
                <p className="text-dark-400">No students enrolled yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cls.enrollments.map((e, idx) => (
                  <div key={e.user?.id} className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-xl group">
                    <span className="text-dark-600 text-xs font-mono w-5 text-center">{idx+1}</span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {e.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-100 font-medium text-sm">{e.user?.name}</p>
                      <p className="text-dark-500 text-xs">{e.user?.email}</p>
                    </div>
                    <p className="text-dark-600 text-xs hidden sm:block">Since {new Date(e.enrolledAt).toLocaleDateString()}</p>
                    {canManage && (
                      <button onClick={() => handleUnenroll(e.user?.id, e.user?.name)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-900/20 transition-all">
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'timetable' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-dark-400 text-sm">{cls.timetableSlots?.length || 0} scheduled slots</p>
              <Link to="/timetable" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                Manage Timetable →
              </Link>
            </div>
            {cls.timetableSlots?.length === 0 ? (
              <p className="text-dark-500 text-sm">No timetable slots set up yet.</p>
            ) : (
              <div className="space-y-2">
                {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(day => {
                  const daySlots = cls.timetableSlots?.filter(s => s.day === day) || [];
                  if (!daySlots.length) return null;
                  return (
                    <div key={day}>
                      <p className="text-dark-500 text-xs font-semibold uppercase tracking-wide mb-1.5">{day}</p>
                      <div className="space-y-1.5 mb-3">
                        {daySlots.sort((a,b)=>a.startTime.localeCompare(b.startTime)).map(slot => (
                          <div key={slot.id} className="flex items-center gap-3 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl">
                            <span className="text-dark-400 text-xs font-mono w-24 flex-shrink-0">{slot.startTime}–{slot.endTime}</span>
                            <span className="text-dark-100 font-semibold text-sm">{slot.subject}</span>
                            {slot.teacher && <span className="text-dark-500 text-xs ml-auto">{slot.teacher.name}</span>}
                            {slot.roomNo && <span className="text-dark-600 text-xs">Room {slot.roomNo}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll modal */}
      {enrollOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
              <h3 className="font-semibold text-dark-100">Enroll Student</h3>
              <button onClick={() => { setEnrollOpen(false); setSearch(''); setSearchResults([]); }} className="text-dark-500 hover:text-dark-200"><X size={16}/></button>
            </div>
            <div className="p-5">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"/>
                <input value={search} onChange={e => { setSearch(e.target.value); searchStudents(e.target.value); }}
                  placeholder="Search by name or email…"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-500"/>
              </div>
              {searching && <p className="text-dark-500 text-xs text-center py-2">Searching…</p>}
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {searchResults.filter(s => !enrolledIds.has(s.id)).map(s => (
                  <button key={s.id} onClick={() => handleEnroll(s.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-dark-100 text-sm font-medium">{s.name}</p>
                      <p className="text-dark-500 text-xs">{s.email}</p>
                    </div>
                    <UserPlus size={13} className="ml-auto text-brand-400"/>
                  </button>
                ))}
                {!searching && search && searchResults.filter(s => !enrolledIds.has(s.id)).length === 0 && (
                  <p className="text-dark-500 text-xs text-center py-4">No students found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

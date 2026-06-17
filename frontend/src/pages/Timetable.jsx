import { useState, useEffect } from 'react';
import { Plus, X, Clock, BookOpen, Trash2 } from 'lucide-react';
import Layout from '../components/common/Layout';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const SUBJECT_COLORS = [
  { bg: 'bg-violet-900/60 border-violet-600/50', text: 'text-violet-200', dot: 'bg-violet-400' },
  { bg: 'bg-cyan-900/60 border-cyan-600/50', text: 'text-cyan-200', dot: 'bg-cyan-400' },
  { bg: 'bg-emerald-900/60 border-emerald-600/50', text: 'text-emerald-200', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-900/60 border-amber-600/50', text: 'text-amber-200', dot: 'bg-amber-400' },
  { bg: 'bg-rose-900/60 border-rose-600/50', text: 'text-rose-200', dot: 'bg-rose-400' },
  { bg: 'bg-blue-900/60 border-blue-600/50', text: 'text-blue-200', dot: 'bg-blue-400' },
  { bg: 'bg-pink-900/60 border-pink-600/50', text: 'text-pink-200', dot: 'bg-pink-400' },
  { bg: 'bg-indigo-900/60 border-indigo-600/50', text: 'text-indigo-200', dot: 'bg-indigo-400' },
];

function getSubjectColor(subject) {
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = (h * 31 + subject.charCodeAt(i)) & 0xffffffff;
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
}

function timeToRow(time) {
  const [h, m] = time.split(':').map(Number);
  return (h - 8) * 2 + Math.floor(m / 30);
}

function SlotCard({ slot, onDelete, canEdit }) {
  const color = getSubjectColor(slot.subject);
  return (
    <div className={`relative rounded-xl border px-3 py-2 ${color.bg} group cursor-default`}>
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className={`font-semibold text-xs leading-tight ${color.text}`}>{slot.subject}</p>
          <p className="text-dark-400 text-[10px] mt-0.5 truncate">{slot.teacher?.name}</p>
          {slot.roomNo && <p className="text-dark-500 text-[10px]">Room {slot.roomNo}</p>}
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${color.dot}`} />
      </div>
      <p className="text-dark-500 text-[10px] mt-1 flex items-center gap-1">
        <Clock size={9} /> {slot.startTime}–{slot.endTime}
      </p>
      {canEdit && (
        <button
          onClick={() => onDelete(slot.id)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md bg-red-900/60 text-red-400 hover:bg-red-800/80 transition-all"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
}

export default function Timetable() {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ day: 'MONDAY', startTime: '09:00', endTime: '10:00', subject: '', roomNo: '', teacherId: user?.id });

  const canEdit = user?.role === 'TEACHER' || user?.role === 'SCHOOL';

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      loadTeacherTimetable();
      loadTeacherClasses();
    } else if (user?.role === 'SCHOOL' || user?.role === 'STUDENT') {
      loadClasses();
    }
  }, []);

  const loadTeacherTimetable = async () => {
    setLoading(true);
    try {
      const r = await classService.getMyTimetable();
      setSlots(r.data.data || []);
    } catch (_) { }
    setLoading(false);
  };

  // Teachers can only add/manage slots for classes where they're the assigned
  // class (homeroom) teacher, so we scope the picker to just those classes
  // rather than the whole school's class list.
  const loadTeacherClasses = async () => {
    try {
      const r = await classService.getAll({});
      const list = (r.data.data || []).filter(c => c.teacher?.id === user.id);
      setClasses(list);
      if (list.length > 0) setSelectedClass(list[0].id);
    } catch (_) { }
  };

  const loadClasses = async () => {
    try {
      const r = await classService.getAll({});
      const list = r.data.data || [];
      setClasses(list);
      if (list.length > 0) {
        setSelectedClass(list[0].id);
        loadClassTimetable(list[0].id);
      }
    } catch (_) { }
  };

  const loadClassTimetable = async (classId) => {
    setLoading(true);
    try {
      const r = await classService.getById(classId);
      setSlots(r.data.data?.timetableSlots || []);
    } catch (_) { }
    setLoading(false);
  };

  const handleClassChange = (id) => {
    setSelectedClass(id);
    loadClassTimetable(id);
  };

  const handleAddSlot = async () => {
    if (!form.subject || !selectedClass) return;
    try {
      const r = await classService.addSlot(selectedClass, form);
      setSlots(prev => [...prev, r.data.data]);
      setModalOpen(false);
      setForm({ day: 'MONDAY', startTime: '09:00', endTime: '10:00', subject: '', roomNo: '', teacherId: user?.id });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Remove this slot?')) return;
    try {
      await classService.deleteSlot(selectedClass || '', slotId);
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch (_) { }
  };

  // Group slots by day
  const slotsByDay = {};
  DAYS.forEach(d => { slotsByDay[d] = []; });
  slots.forEach(s => {
    if (slotsByDay[s.day]) slotsByDay[s.day].push(s);
  });

  // Count unique subjects
  const subjects = [...new Set(slots.map(s => s.subject))];

  return (
    <Layout>
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <Clock className="text-brand-400" size={24} /> Weekly Timetable
            </h1>
            <p className="text-dark-400 text-sm mt-1">{slots.length} classes • {subjects.length} subjects</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {classes.length > 0 && (
              <select
                value={selectedClass}
                onChange={e => handleClassChange(e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — Grade {c.grade}-{c.section}</option>
                ))}
              </select>
            )}
            {canEdit && selectedClass && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-brand-600 to-purple-600 hover:opacity-90 transition-opacity shadow-glow"
              >
                <Plus size={16} /> Add Class
              </button>
            )}
          </div>
        </div>

        {/* Subject legend */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {subjects.map(sub => {
              const c = getSubjectColor(sub);
              return (
                <div key={sub} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${c.bg} ${c.text}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {sub}
                </div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-6 gap-3">
            {DAYS.map(d => (
              <div key={d} className="space-y-2">
                <div className="h-8 bg-dark-800 rounded-xl animate-pulse" />
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse" />)}
              </div>
            ))}
          </div>
        ) : (
          /* Timetable grid */
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
                <div />
                {DAYS.map((day, i) => {
                  const count = slotsByDay[day].length;
                  return (
                    <div key={day} className="text-center">
                      <div className="bg-dark-800 rounded-xl px-3 py-2 border border-dark-700">
                        <p className="text-dark-100 font-semibold text-sm">{DAY_LABELS[i]}</p>
                        <p className="text-dark-500 text-[10px]">{count} class{count !== 1 ? 'es' : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid gap-2 mb-1.5" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
                  {/* Time label */}
                  <div className="flex items-center justify-end pr-2">
                    <span className="text-dark-600 text-[10px] font-mono">{hour}</span>
                  </div>
                  {/* Day cells */}
                  {DAYS.map(day => {
                    const daySlots = slotsByDay[day].filter(s => s.startTime === hour);
                    return (
                      <div key={day} className="min-h-[52px]">
                        {daySlots.length > 0 ? (
                          <div className="space-y-1">
                            {daySlots.map(slot => (
                              <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} canEdit={canEdit} />
                            ))}
                          </div>
                        ) : (
                          <div className="h-full min-h-[52px] rounded-xl border border-dark-800/50 border-dashed opacity-30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && slots.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-dark-500" />
            </div>
            <p className="text-dark-300 font-semibold text-lg">No classes scheduled</p>
            <p className="text-dark-500 text-sm mt-1">
              {canEdit && selectedClass
                ? 'Click "Add Class" to build your timetable.'
                : user?.role === 'TEACHER'
                  ? "You're not assigned as the class teacher for any class yet, so there's nothing to manage here."
                  : 'No timetable has been set up yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Add slot modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
              <h3 className="font-display font-semibold text-dark-100 flex items-center gap-2">
                <Plus size={16} className="text-brand-400" /> Add Timetable Slot
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-dark-500 hover:text-dark-200 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Day', type: 'select', key: 'day', options: DAYS.map(d => ({ value: d, label: d })) },
                { label: 'Subject', type: 'text', key: 'subject', placeholder: 'e.g. Mathematics' },
                { label: 'Start Time', type: 'select', key: 'startTime', options: HOURS.map(h => ({ value: h, label: h })) },
                { label: 'End Time', type: 'select', key: 'endTime', options: HOURS.map(h => ({ value: h, label: h })) },
                { label: 'Room No.', type: 'text', key: 'roomNo', placeholder: 'e.g. A-101 (optional)' },
              ].map(({ label, type, key, options, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block mb-1">{label}</label>
                  {type === 'select' ? (
                    <select
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
                    >
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-500"
                    />
                  )}
                </div>
              ))}
              <button
                onClick={handleAddSlot}
                disabled={!form.subject}
                className="w-full py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-brand-600 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Add to Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

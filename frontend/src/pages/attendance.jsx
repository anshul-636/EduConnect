import { useState, useEffect } from 'react';
import { UserCheck, ChevronLeft, ChevronRight, Save, BarChart2 } from 'lucide-react';
import Layout from '../components/common/Layout';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  PRESENT:    { label: 'Present',  bg: 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300', dot: 'bg-emerald-400' },
  ABSENT:     { label: 'Absent',   bg: 'bg-red-900/60 border-red-500/60 text-red-300',             dot: 'bg-red-400' },
  LATE:       { label: 'Late',     bg: 'bg-amber-900/60 border-amber-500/60 text-amber-300',       dot: 'bg-amber-400' },
  NOT_MARKED: { label: 'Not Marked', bg: 'bg-dark-800 border-dark-600 text-dark-400',              dot: 'bg-dark-600' },
};

function percent(val, total) {
  return total > 0 ? Math.round((val / total) * 100) : 0;
}

export default function Attendance() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);   // [{student, attendance, status}]
  const [marked, setMarked] = useState({});     // studentId → status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState('mark');     // 'mark' | 'monthly'
  const [monthlyData, setMonthlyData] = useState(null);

  const canMark = user?.role === 'TEACHER' || user?.role === 'SCHOOL';

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const r = await classService.getAll({});
      const list = r.data.data || [];
      setClasses(list);
      if (list.length) { setSelectedClass(list[0].id); loadAttendance(list[0].id, date); }
    } catch (_) {}
  };

  const loadAttendance = async (classId, d) => {
    setLoading(true);
    try {
      const r = await attendanceService.getByDate(classId, d);
      const data = r.data.data || [];
      setRecords(data);
      const init = {};
      data.forEach(({ student, status }) => { init[student.id] = status; });
      setMarked(init);
      setSaved(false);
    } catch (_) {}
    setLoading(false);
  };

  const handleClassChange = (id) => { setSelectedClass(id); loadAttendance(id, date); };
  const handleDateChange = (d) => { setDate(d); loadAttendance(selectedClass, d); };

  const shiftDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setDate(newDate);
    loadAttendance(selectedClass, newDate);
  };

  const cycleStatus = (studentId) => {
    if (!canMark) return;
    const order = ['PRESENT', 'ABSENT', 'LATE'];
    const cur = marked[studentId] || 'NOT_MARKED';
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];
    setMarked(p => ({ ...p, [studentId]: next }));
    setSaved(false);
  };

  const markAll = (status) => {
    const upd = {};
    records.forEach(({ student }) => { upd[student.id] = status; });
    setMarked(upd);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const recList = Object.entries(marked).map(([studentId, status]) => ({ studentId, status }));
      await attendanceService.markBulk(selectedClass, date, recList);
      setSaved(true);
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const loadMonthly = async () => {
    if (!selectedClass) return;
    const [y, m] = date.split('-').map(Number);
    try {
      const r = await attendanceService.getMonthly(selectedClass, y, m);
      setMonthlyData(r.data.data);
      setView('monthly');
    } catch (_) {}
  };

  // Summary
  const total = records.length;
  const present = Object.values(marked).filter(s => s === 'PRESENT').length;
  const absent  = Object.values(marked).filter(s => s === 'ABSENT').length;
  const late    = Object.values(marked).filter(s => s === 'LATE').length;

  const selectedCls = classes.find(c => c.id === selectedClass);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50 flex items-center gap-2">
              <UserCheck className="text-emerald-400" size={24} /> Attendance
            </h1>
            <p className="text-dark-400 text-sm mt-1">
              {selectedCls ? `${selectedCls.name} — Grade ${selectedCls.grade}-${selectedCls.section}` : 'Select a class'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {classes.length > 1 && (
              <select
                value={selectedClass}
                onChange={e => handleClassChange(e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <button onClick={() => view === 'mark' ? loadMonthly() : setView('mark')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800 text-sm transition-all">
              <BarChart2 size={14} />
              {view === 'mark' ? 'Monthly Report' : 'Mark Today'}
            </button>
          </div>
        </div>

        {view === 'mark' ? (
          <>
            {/* Date navigation */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => shiftDate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:bg-dark-700 transition-all">
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                value={date}
                onChange={e => handleDateChange(e.target.value)}
                className="flex-1 max-w-[180px] bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
              />
              <button onClick={() => shiftDate(1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:bg-dark-700 transition-all">
                <ChevronRight size={16} />
              </button>
              <span className="text-dark-400 text-sm">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total',   val: total,   color: 'text-dark-200',   bg: 'bg-dark-800' },
                { label: 'Present', val: present, color: 'text-emerald-300', bg: 'bg-emerald-900/30 border border-emerald-900/50' },
                { label: 'Absent',  val: absent,  color: 'text-red-300',     bg: 'bg-red-900/30 border border-red-900/50' },
                { label: 'Late',    val: late,    color: 'text-amber-300',   bg: 'bg-amber-900/30 border border-amber-900/50' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`rounded-2xl p-4 ${bg}`}>
                  <p className="text-dark-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                  <p className={`font-display font-bold text-2xl mt-1 ${color}`}>{val}</p>
                  {label !== 'Total' && total > 0 && (
                    <div className="mt-2 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${label === 'Present' ? 'bg-emerald-500' : label === 'Absent' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${percent(val, total)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick actions */}
            {canMark && total > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-dark-500 text-xs font-medium">Mark all:</span>
                {['PRESENT','ABSENT','LATE'].map(s => (
                  <button key={s} onClick={() => markAll(s)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${STATUS_CONFIG[s].bg} hover:opacity-90`}>
                    All {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Student list */}
            {loading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                  <UserCheck size={24} className="text-dark-500" />
                </div>
                <p className="text-dark-300 font-semibold">No students enrolled</p>
                <p className="text-dark-500 text-sm mt-1">Enroll students in this class first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map(({ student }, idx) => {
                  const status = marked[student.id] || 'NOT_MARKED';
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={student.id}
                      onClick={() => cycleStatus(student.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${canMark ? 'cursor-pointer hover:scale-[1.005]' : ''} ${cfg.bg}`}>
                      <span className="text-dark-500 text-xs font-mono w-5 text-center">{idx + 1}</span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-brand-600 to-purple-600 flex-shrink-0`}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-dark-100 font-semibold text-sm truncate">{student.name}</p>
                        <p className="text-dark-500 text-xs truncate">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-xs font-semibold">{cfg.label}</span>
                        {canMark && <span className="text-dark-600 text-[10px]">click to cycle</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save button */}
            {canMark && records.length > 0 && (
              <div className="sticky bottom-4 mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving || saved}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all ${saved ? 'bg-emerald-700 cursor-default' : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:opacity-90 shadow-glow'}`}>
                  <Save size={16} />
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Attendance'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Monthly report */
          <div>
            <h2 className="font-semibold text-dark-200 mb-4">Monthly Summary — {new Date(date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            {monthlyData?.summary?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-800">
                      <th className="text-left py-3 px-4 text-dark-400 font-medium">Student</th>
                      <th className="text-center py-3 px-3 text-emerald-400 font-medium">Present</th>
                      <th className="text-center py-3 px-3 text-red-400 font-medium">Absent</th>
                      <th className="text-center py-3 px-3 text-amber-400 font-medium">Late</th>
                      <th className="text-center py-3 px-3 text-dark-400 font-medium">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.summary.map(s => (
                      <tr key={s.student.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {s.student.name?.charAt(0)}
                            </div>
                            <span className="text-dark-100 font-medium">{s.student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-300 font-semibold">{s.PRESENT || 0}</td>
                        <td className="py-3 px-3 text-center text-red-300 font-semibold">{s.ABSENT || 0}</td>
                        <td className="py-3 px-3 text-center text-amber-300 font-semibold">{s.LATE || 0}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.percentage >= 75 ? 'bg-emerald-500' : s.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${s.percentage}%` }} />
                            </div>
                            <span className={`text-xs font-bold w-9 text-right ${s.percentage >= 75 ? 'text-emerald-300' : s.percentage >= 50 ? 'text-amber-300' : 'text-red-300'}`}>
                              {s.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-dark-400 text-sm">No attendance records for this month.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import eventService from '../../services/eventService';
import aiService from '../../services/aiService';
import useAuthStore from '../../store/authStore';

const plannerConfig = {
  STUDENT: { title: '📅 AI Study Planner', desc: 'Get a personalized study plan for any upcoming event', placeholder: 'Choose an open event...', btnLabel: '✨ Generate Plan', loadingMsg: 'AI is analyzing your profile and creating a personalized plan...', daysSuffix: 'days study plan' },
  TEACHER: { title: '📅 Lesson Planner', desc: 'Generate class curriculum maps and lesson schedules for school events', placeholder: 'Choose a class event or exam...', btnLabel: '✨ Create Lesson Schedule', loadingMsg: 'AI is structuring your syllabus curriculum schedule...', daysSuffix: 'days teaching syllabus outline' },
  SCHOOL: { title: '🗓️ Academic Planner', desc: 'Draft operational schedules, principal timetables, and calendar maps', placeholder: 'Choose a school term event...', btnLabel: '✨ Map Term Calendar', loadingMsg: 'AI is generating institutional timeline structures...', daysSuffix: 'days administrative planning roadmap' },
  ADMIN: { title: '⚙️ Platform Planner', desc: 'Prepare platform maintenance intervals and system safety rollouts', placeholder: 'Choose a system milestone...', btnLabel: '✨ Plan Platform Action', loadingMsg: 'AI is computing server maintenance dependencies...', daysSuffix: 'days systems deployment playbook' },
};

const StudyPlanner = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(() => {
    if (!user) return '';
    return localStorage.getItem(`educonnect_planner_event_${user.id}`) || '';
  });
  const [plan, setPlan] = useState(() => {
    if (!user) return null;
    const saved = localStorage.getItem(`educonnect_planner_plan_${user.id}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`educonnect_planner_event_${user.id}`, selectedEvent);
    }
  }, [selectedEvent, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`educonnect_planner_plan_${user.id}`, JSON.stringify(plan));
    }
  }, [plan, user?.id]);

  useEffect(() => {
    eventService.getAll({ status: 'OPEN' })
      .then(res => {
        const raw = res.data || [];
        const role = user?.role || 'STUDENT';
        let filtered = [];
        
        if (role === 'TEACHER') {
          filtered = raw.filter(e => 
            /syllabus|lesson|class|curriculum|exam|term|midterm|teacher/i.test(e.title + ' ' + (e.category || ''))
          );
          if (filtered.length === 0) {
            filtered = [
              { id: 'mock-et1', title: 'Grade 10 Mathematics Term Exam Coverage', category: 'Exam Milestone' },
              { id: 'mock-et2', title: 'Annual Physics Syllabus Completion Deadline', category: 'Syllabus Milestone' }
            ];
          }
        } else if (role === 'SCHOOL') {
          filtered = raw.filter(e => 
            /audit|inspection|sports|anniversary|board|parent|meeting|school/i.test(e.title + ' ' + (e.category || ''))
          );
          if (filtered.length === 0) {
            filtered = [
              { id: 'mock-es1', title: 'Q2 Principal-Teacher General Inspection', category: 'Administrative Operations' },
              { id: 'mock-es2', title: 'School Annual Sports Week & Logistics Plan', category: 'Institutional Milestone' }
            ];
          }
        } else if (role === 'ADMIN') {
          filtered = raw.filter(e => 
            /upgrade|migration|backup|maintenance|audit|release|admin/i.test(e.title + ' ' + (e.category || ''))
          );
          if (filtered.length === 0) {
            filtered = [
              { id: 'mock-ea1', title: 'EduConnect Platform Security Safety Audit', category: 'Systems & Policies' },
              { id: 'mock-ea2', title: 'Q3 Database Server Maintenance & Data Purge', category: 'Infrastructure Release' }
            ];
          }
        } else { // STUDENT
          filtered = raw.filter(e => 
            !/audit|inspection|maintenance|server/i.test(e.title + ' ' + (e.category || ''))
          );
          if (filtered.length === 0) {
            filtered = [
              { id: 'mock-est1', title: 'National Mathematics Science Olympiad 2026', category: 'Competitive Exam' },
              { id: 'mock-est2', title: 'Inter-School Creative Writing Competition', category: 'Co-Curricular Event' }
            ];
          }
        }
        setEvents(filtered);
      })
      .catch(err => {
        console.error(err);
        const role = user?.role || 'STUDENT';
        if (role === 'TEACHER') {
          setEvents([
            { id: 'mock-et1', title: 'Grade 10 Mathematics Term Exam Coverage', category: 'Exam Milestone' },
            { id: 'mock-et2', title: 'Annual Physics Syllabus Completion Deadline', category: 'Syllabus Milestone' }
          ]);
        } else if (role === 'SCHOOL') {
          setEvents([
            { id: 'mock-es1', title: 'Q2 Principal-Teacher General Inspection', category: 'Administrative Operations' },
            { id: 'mock-es2', title: 'School Annual Sports Week & Logistics Plan', category: 'Institutional Milestone' }
          ]);
        } else if (role === 'ADMIN') {
          setEvents([
            { id: 'mock-ea1', title: 'EduConnect Platform Security Safety Audit', category: 'Systems & Policies' },
            { id: 'mock-ea2', title: 'Q3 Database Server Maintenance & Data Purge', category: 'Infrastructure Release' }
          ]);
        } else {
          setEvents([
            { id: 'mock-est1', title: 'National Mathematics Science Olympiad 2026', category: 'Competitive Exam' },
            { id: 'mock-est2', title: 'Inter-School Creative Writing Competition', category: 'Co-Curricular Event' }
          ]);
        }
      });
  }, [user?.role]);

  const handleGenerate = async () => {
    if (!selectedEvent) { setError('Please select an event.'); return; }
    setError(''); setLoading(true); setPlan(null);
    try {
      const res = await aiService.generatePlan(user.id, user.name, selectedEvent, user?.role);
      if (res.success) setPlan(res);
      else setError(res.error || 'Failed to generate plan.');
    } catch (err) {
      setError('Error connecting to AI service.');
    } finally { setLoading(false); }
  };

  const cfg = plannerConfig[user?.role] || plannerConfig.STUDENT;

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='font-display font-bold text-2xl text-dark-50'>{cfg.title}</h1>
          <p className='text-dark-400 text-sm mt-1'>{cfg.desc}</p>
        </div>

        <div className='card mb-6'>
          <h2 className='font-semibold text-dark-100 mb-4'>Select an Event / Objective</h2>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          <div className='flex gap-3'>
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className='input flex-1'>
              <option value=''>{cfg.placeholder}</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title} — {new Date(e.eventDate).toLocaleDateString()}</option>
              ))}
            </select>
            <button onClick={handleGenerate} disabled={loading || !selectedEvent}
              className='px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-glow whitespace-nowrap'>
              {loading ? 'Generating...' : cfg.btnLabel}
            </button>
          </div>
          {loading && (
            <div className='mt-4 flex items-center gap-3 text-dark-400 text-sm'>
              <div className='w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin' />
              {cfg.loadingMsg}
            </div>
          )}
        </div>

        {plan && (
          <div className='space-y-4 animate-fade-in'>
            <div className='card bg-gradient-to-br from-brand-900/30 to-purple-900/30 border-brand-500/20'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h2 className='font-display font-bold text-xl text-dark-50'>{plan.event}</h2>
                  <p className='text-dark-400 text-sm mt-1'>{plan.days} {cfg.daysSuffix} generated by AI</p>
                </div>
                <span className='text-2xl'>🎯</span>
              </div>
              <div className='bg-dark-900/50 rounded-xl p-4'>
                <pre className='text-dark-200 text-sm whitespace-pre-wrap leading-relaxed font-sans'>{plan.plan}</pre>
              </div>
            </div>

            {plan.resources && plan.resources.length > 0 && (
              <div className='card'>
                <h3 className='font-semibold text-dark-100 mb-3'>📚 Recommended Resources</h3>
                <div className='space-y-2'>
                  {plan.resources.map((r, i) => (
                    <div key={i} className='bg-dark-800 rounded-xl p-3'>
                      <p className='text-sm font-medium text-brand-400'>{r.title}</p>
                      <p className='text-xs text-dark-500 mt-1'>{r.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default StudyPlanner;

import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import eventService from '../../services/eventService';
import aiService from '../../services/aiService';
import useAuthStore from '../../store/authStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Calendar,
  Target,
  FileText,
  Printer,
  Sparkles,
  CheckCircle,
  Layout as LayoutIcon,
  Clock,
  ChevronRight
} from 'lucide-react';

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
  const [isCustom, setIsCustom] = useState(false);
  const [customObjective, setCustomObjective] = useState('');

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
      const objective = isCustom ? customObjective : selectedEvent;
      const res = await aiService.generatePlan(user.id, user.name, objective, user?.role);
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

        <div className='card mb-8 border-brand-500/10 bg-dark-900/50 backdrop-blur-sm'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400'>
              <LayoutIcon size={20} />
            </div>
            <h2 className='font-display font-bold text-lg text-dark-100'>Plan Configuration</h2>
          </div>

          {error && <div className='mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2'>
            <span className='text-lg'>⚠️</span> {error}
          </div>}

          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              {isCustom ? (
                <input
                  type='text'
                  value={customObjective}
                  onChange={e => setCustomObjective(e.target.value)}
                  placeholder="Type your custom objective (e.g. 'Class Graduation Plan', 'System Security Audit'...)"
                  className='input w-full pr-10'
                  autoFocus
                />
              ) : (
                <select
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  className='input w-full appearance-none pr-10'
                >
                  <option value=''>{cfg.placeholder}</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} {e.eventDate ? `— ${new Date(e.eventDate).toLocaleDateString()}` : ''}
                    </option>
                  ))}
                </select>
              )}
              <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400'>
                <ChevronRight size={16} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || (isCustom ? !customObjective : !selectedEvent)}
              className='px-8 py-3 bg-gradient-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-glow flex items-center justify-center gap-2 transition-all group'
            >
              {loading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} className='group-hover:rotate-12 transition-transform' />
                  {cfg.btnLabel}
                </>
              )}
            </button>
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <button
              onClick={() => setIsCustom(!isCustom)}
              className='text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1'
            >
              <Sparkles size={14} />
              {isCustom ? "Back to Preset Events" : "Switch to Custom Objective"}
            </button>

            {loading && (
              <div className='flex items-center gap-2 text-brand-100 text-xs italic animate-pulse'>
                <Clock className='text-brand-400 animate-spin-slow' size={14} />
                {cfg.loadingMsg}
              </div>
            )}
          </div>
        </div>

        {plan && (
          <div className='space-y-6 animate-fade-in pb-12'>
            <div className='card p-0 border border-brand-500/20 bg-dark-900/80 overflow-hidden shadow-2xl'>
              {/* Plan Header */}
              <div className='p-6 border-b border-white/5 bg-gradient-to-r from-brand-500/10 to-purple-500/10 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-brand-500 rounded-2xl shadow-lg shadow-brand-500/20'>
                    <Target className='text-white' size={24} />
                  </div>
                  <div>
                    <h2 className='font-display font-bold text-xl text-white'>{plan.event}</h2>
                    <div className='flex items-center gap-2 text-dark-400 text-xs mt-1 uppercase tracking-widest font-semibold'>
                      <Calendar size={14} />
                      {plan.days} {cfg.daysSuffix}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className='p-3 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold'
                >
                  <Printer size={18} />
                  <span className='hidden sm:inline'>Export PDF</span>
                </button>
              </div>

              {/* Plan Content */}
              <div className='p-8 print:p-0 markdown-content'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ node, ...props }) => <h3 className='text-brand-400 font-bold text-lg mt-8 mb-4 border-l-4 border-brand-500 pl-4 uppercase tracking-tight' {...props} />,
                    table: ({ node, ...props }) => (
                      <div className='overflow-x-auto my-6 rounded-xl border border-white/5'>
                        <table className='w-full text-left text-sm' {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className='bg-dark-800 text-dark-100 uppercase text-[10px] tracking-widest' {...props} />,
                    th: ({ node, ...props }) => <th className='px-4 py-3 font-bold' {...props} />,
                    td: ({ node, ...props }) => <td className='px-4 py-4 border-t border-white/5 text-dark-200 leading-relaxed' {...props} />,
                    strong: ({ node, ...props }) => <strong className='text-brand-300 font-bold' {...props} />,
                    ul: ({ node, ...props }) => <ul className='space-y-3 my-4' {...props} />,
                    li: ({ node, ...props }) => (
                      <li className='flex items-start gap-2 text-dark-300'>
                        <div className='mt-2.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0' />
                        <span {...props} />
                      </li>
                    )
                  }}
                >
                  {plan.plan}
                </ReactMarkdown>
              </div>
            </div>

            {plan.resources && plan.resources.length > 0 && (
              <div className='card border-white/5 bg-dark-900/40'>
                <div className='flex items-center gap-2 mb-6'>
                  <FileText className='text-brand-400' size={20} />
                  <h3 className='font-display font-bold text-lg text-dark-100'>Strategic Resources</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {plan.resources.map((r, i) => (
                    <div key={i} className='p-4 bg-dark-800/50 hover:bg-dark-800 border border-white/5 rounded-2xl transition-all cursor-default group'>
                      <div className='flex items-center justify-between mb-2'>
                        <p className='text-sm font-bold text-brand-400 group-hover:text-brand-300 transition-colors'>{r.title}</p>
                        <CheckCircle size={14} className='text-dark-600' />
                      </div>
                      <p className='text-xs text-dark-400 leading-relaxed line-clamp-2'>{r.preview}</p>
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

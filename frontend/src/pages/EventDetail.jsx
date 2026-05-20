import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import eventService from '../services/eventService';
import useAuthStore from '../store/authStore';

const MEDAL = ['🥇', '🥈', '🥉'];
const statusColor = {
  DRAFT: 'bg-dark-700 text-dark-400',
  PUBLISHED: 'bg-blue-500/20 text-blue-400',
  OPEN: 'bg-green-500/20 text-green-400',
  ONGOING: 'bg-yellow-500/20 text-yellow-400',
  COMPLETED: 'bg-purple-500/20 text-purple-400',
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (event && event.teamSize > 1 && teamMembers.length === 0) {
      setTeamMembers(Array.from({ length: event.teamSize - 1 }, () => ({ name: '', email: '', className: '' })));
    }
  }, [event]);

  useEffect(() => {
    const load = async () => {
      try {
        const [evtRes, lbRes] = await Promise.all([
          eventService.getById(id),
          eventService.getLeaderboard(id),
        ]);
        setEvent(evtRes.data);
        setLeaderboard(lbRes.data);
      } catch { navigate('/events'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleRegister = async () => {
    if (event.teamSize > 1) {
      if (!teamName.trim()) {
        setMsg({ text: 'Please enter a valid Team Name.', ok: false });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (!member.name.trim()) {
          setMsg({ text: `Please fill out the Full Name for Member ${i + 2}.`, ok: false });
          return;
        }
        if (!member.email.trim() || !emailRegex.test(member.email.trim())) {
          setMsg({ text: `Please fill out a valid Email address for Member ${i + 2}.`, ok: false });
          return;
        }
        if (!member.className.trim()) {
          setMsg({ text: `Please fill out the Class / Grade for Member ${i + 2}.`, ok: false });
          return;
        }
      }
    }

    setRegistering(true); setMsg({ text: '', ok: false });
    try {
      await eventService.register(id, teamName, teamMembers);
      setMsg({ text: 'Successfully registered!', ok: true });
      const res = await eventService.getById(id);
      setEvent(res.data);
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed.', ok: false }); }
    finally { setRegistering(false); }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!event) return null;

  const isOpen = event.status === 'OPEN';
  const deadlinePassed = event.regDeadline && new Date() > new Date(event.regDeadline);

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <button onClick={() => navigate('/events')} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Events</button>
        <div className='card'>
          <div className='flex items-start justify-between mb-4'>
            <span className='text-xs font-medium px-2 py-1 rounded-full bg-brand-500/20 text-brand-400'>{event.category}</span>
            <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (statusColor[event.status] || '')}>{event.status}</span>
          </div>
          <h1 className='font-display font-bold text-2xl text-dark-50 mb-2'>{event.title}</h1>
          <p className='text-dark-400 text-sm mb-6'>{event.description || 'No description provided.'}</p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {[{label:'Category',value:event.category},{label:'Target Class',value:event.targetClass||'N/A'},{label:'Location',value:event.location||'N/A'},{label:'Date & Time',value:`${new Date(event.eventDate).toLocaleDateString()} at ${event.eventTime||'TBA'}`}].map(s => (
              <div key={s.label} className='bg-dark-800 rounded-xl p-4 border border-dark-700'>
                <p className='text-xs text-dark-500 mb-1'>{s.label}</p>
                <p className='font-semibold text-dark-100 text-sm'>{s.value}</p>
              </div>
            ))}
          </div>

          <div className='mb-6 p-5 bg-dark-800/60 border border-dark-700/60 rounded-2xl'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-3'>Host & Event Coordinator</h3>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold text-dark-100'>{event.school?.name}</p>
                <p className='text-xs text-dark-400 mt-1'>{event.school?.location || 'Location not set'}</p>
              </div>
              {event.school?.admin && (
                <div className='border-t sm:border-t-0 sm:border-l border-dark-700 pt-3 sm:pt-0 sm:pl-5 text-sm space-y-1.5'>
                  <p className='text-xs text-dark-500 font-bold uppercase tracking-wider mb-1'>Contact Coordinator</p>
                  <p className='text-dark-200 font-semibold text-xs flex items-center gap-1.5'>
                    <span>👤</span> {event.school.admin.name}
                  </p>
                  <p className='text-brand-400 font-semibold text-xs flex items-center gap-1.5'>
                    <span>✉️</span> <a href={`mailto:${event.school.admin.email}`} className='hover:underline hover:text-brand-300 transition-colors'>{event.school.admin.email}</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='mb-6 p-5 bg-brand-500/10 border border-brand-500/20 rounded-2xl'>
            <h3 className='font-semibold text-brand-400 mb-4'>Prize Pool: {event.prizePool || 'None'}</h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-dark-900 rounded-xl p-4 border border-dark-700/50 text-center'>
                <p className='text-2xl mb-1'>🥇</p>
                <p className='text-xs text-dark-400 mb-1'>1st Prize</p>
                <p className='font-bold text-yellow-400'>{event.firstPrize || 'N/A'}</p>
              </div>
              <div className='bg-dark-900 rounded-xl p-4 border border-dark-700/50 text-center'>
                <p className='text-2xl mb-1'>🥈</p>
                <p className='text-xs text-dark-400 mb-1'>2nd Prize</p>
                <p className='font-bold text-gray-400'>{event.secondPrize || 'N/A'}</p>
              </div>
              <div className='bg-dark-900 rounded-xl p-4 border border-dark-700/50 text-center'>
                <p className='text-2xl mb-1'>🥉</p>
                <p className='text-xs text-dark-400 mb-1'>3rd Prize</p>
                <p className='font-bold text-orange-400'>{event.thirdPrize || 'N/A'}</p>
              </div>
            </div>
          </div>
          {event.regDeadline && (
            <p className='text-sm text-dark-400 mb-4'>
              Registration deadline: <span className='font-medium text-dark-200'>{new Date(event.regDeadline).toLocaleDateString()}</span>
              {deadlinePassed && <span className='ml-2 text-red-400 text-xs'>(Passed)</span>}
            </p>
          )}
          {msg.text && (
            <div className={'mb-4 px-4 py-3 rounded-xl text-sm ' + (msg.ok ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400')}>
              {msg.text}
            </div>
          )}
          {user?.role === 'STUDENT' && isOpen && !deadlinePassed && (
            <div className='space-y-4'>
              {event.teamSize > 1 && (
                <div className='bg-dark-800 p-5 rounded-2xl border border-dark-700 space-y-4'>
                  <h3 className='font-semibold text-dark-100'>Team Details (Max {event.teamSize} members)</h3>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder='Team Name' className='input w-full' />
                  
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className='pt-2 border-t border-dark-700'>
                      <p className='text-xs text-dark-400 mb-2'>Member {idx + 2}</p>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        <input placeholder='Full Name' className='input' value={member.name} onChange={e => {
                          const newArr = [...teamMembers]; newArr[idx].name = e.target.value; setTeamMembers(newArr);
                        }} />
                        <input placeholder='Email' type='email' className='input' value={member.email} onChange={e => {
                          const newArr = [...teamMembers]; newArr[idx].email = e.target.value; setTeamMembers(newArr);
                        }} />
                        <input placeholder='Class / Grade' className='input' value={member.className} onChange={e => {
                          const newArr = [...teamMembers]; newArr[idx].className = e.target.value; setTeamMembers(newArr);
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={handleRegister} disabled={registering}
                className='px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-glow'>
                {registering ? 'Registering...' : 'Register for this Event'}
              </button>
            </div>
          )}
          {/* Organizer Manage Results button */}
          {user?.role === 'SCHOOL' && (
            <div className='mt-4'>
              <button onClick={() => navigate(`/events/${id}/results`)}
                className='px-5 py-2.5 bg-dark-700 border border-dark-600 text-sm font-semibold rounded-xl hover:bg-dark-600 text-dark-100'>
                ⚙️ Manage Results & Answer Key
              </button>
            </div>
          )}
        </div>

        {/* Public Leaderboard */}
        {leaderboard.length > 0 && (
          <div className='card mt-6'>
            <h2 className='font-display font-bold text-xl text-dark-50 mb-6'>🏆 Leaderboard</h2>
            <div className='space-y-3'>
              {leaderboard.map((entry, idx) => (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl border ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : idx === 1 ? 'bg-gray-500/10 border-gray-500/30' : idx === 2 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-800 border-dark-700'}`}>
                  <span className='text-2xl w-10 text-center'>{MEDAL[idx] || `#${entry.rank}`}</span>
                  <div className='flex-1'>
                    <p className='font-bold text-dark-50'>{entry.student?.name}</p>
                    <p className='text-xs text-dark-400'>{entry.teamName || ''}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-brand-400 text-xl'>{entry.score}</p>
                    <p className='text-xs text-dark-500'>points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Key */}
        {event.answerKey && event.answerKey.length > 0 && (
          <div className='card mt-6'>
            <h2 className='font-display font-bold text-xl text-dark-50 mb-2'>📋 Answer Key & Solutions</h2>
            <p className='text-dark-400 text-sm mb-6'>Review the correct answers and explanations to learn from your mistakes.</p>
            <div className='space-y-4'>
              {event.answerKey.map((q, i) => (
                <div key={i} className='p-4 bg-dark-800 rounded-xl border border-dark-700'>
                  <p className='text-xs text-dark-500 mb-1'>Question {i + 1}</p>
                  <p className='font-medium text-dark-100 mb-3'>{q.question}</p>
                  <div className='flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-2'>
                    <span className='text-green-400 font-bold text-sm shrink-0'>✅ Correct Answer:</span>
                    <span className='text-green-300 text-sm'>{q.answer}</span>
                  </div>
                  {q.explanation && (
                    <div className='flex items-start gap-2 bg-brand-500/10 border border-brand-500/20 rounded-lg p-3'>
                      <span className='text-brand-400 font-bold text-sm shrink-0'>💡 Explanation:</span>
                      <span className='text-dark-300 text-sm'>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default EventDetail;

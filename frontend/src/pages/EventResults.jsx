import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import eventService from '../services/eventService';

const MEDAL = ['🥇', '🥈', '🥉'];

const EventResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [scores, setScores] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [answerKey, setAnswerKey] = useState([{ question: '', answer: '', explanation: '' }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingAK, setSavingAK] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [tab, setTab] = useState('scores'); // 'scores' | 'leaderboard' | 'answerkey'

  useEffect(() => {
    const load = async () => {
      try {
        const [evtRes, regsRes, lbRes] = await Promise.all([
          eventService.getById(id),
          eventService.getRegistrations(id),
          eventService.getLeaderboard(id),
        ]);
        setEvent(evtRes.data);
        setRegistrations(regsRes.data);
        setLeaderboard(lbRes.data);
        // Pre-fill scores from existing data
        const existingScores = {};
        regsRes.data.forEach(r => { existingScores[r.id] = r.score ?? ''; });
        setScores(existingScores);
        // Pre-fill answer key if it exists
        if (evtRes.data.answerKey && evtRes.data.answerKey.length > 0) {
          setAnswerKey(evtRes.data.answerKey);
        }
      } catch { navigate('/events'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleScoreChange = (regId, value) => {
    setScores(p => ({ ...p, [regId]: value }));
  };

  const handleSubmitResults = async () => {
    setSubmitting(true); setMsg({ text: '', ok: false });
    try {
      const results = registrations.map(r => ({ registrationId: r.id, score: parseFloat(scores[r.id]) || 0 }));
      const data = await eventService.submitResults(id, results);
      setLeaderboard(data.data);
      setMsg({ text: 'Results submitted! Leaderboard is now live.', ok: true });
      setTab('leaderboard');
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed.', ok: false }); }
    finally { setSubmitting(false); }
  };

  const addQuestion = () => setAnswerKey(p => [...p, { question: '', answer: '', explanation: '' }]);
  const removeQuestion = (i) => setAnswerKey(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => {
    setAnswerKey(p => { const n = [...p]; n[i][field] = val; return n; });
  };

  const [sendingEmails, setSendingEmails] = useState(false);

  const handleSaveAnswerKey = async () => {
    setSavingAK(true); setMsg({ text: '', ok: false });
    try {
      await eventService.updateAnswerKey(id, answerKey);
      setMsg({ text: 'Answer key published successfully!', ok: true });
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed.', ok: false }); }
    finally { setSavingAK(false); }
  };

  const handleDispatchCertificates = async () => {
    setSendingEmails(true);
    setMsg({ text: '', ok: false });
    try {
      const certificateService = (await import('../services/certificateService')).default;
      await certificateService.sendEmail(id);
      setMsg({ text: '🎉 Certificates successfully generated, customized for ranks/prizes, and dispatched to all participants!', ok: true });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to dispatch certificates.', ok: false });
    } finally {
      setSendingEmails(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <button onClick={() => navigate(`/events/${id}`)} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Event</button>
        <h1 className='font-display font-bold text-2xl text-dark-50 mb-1'>Results Panel</h1>
        <p className='text-dark-400 text-sm mb-6'>{event?.title}</p>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 bg-dark-800 p-1 rounded-xl border border-dark-700 w-fit'>
          {[['scores', '✏️ Enter Scores'], ['leaderboard', '🏆 Leaderboard'], ['answerkey', '📋 Answer Key']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-gradient-brand text-white shadow-glow' : 'text-dark-400 hover:text-dark-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {msg.text && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.ok ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {msg.text}
          </div>
        )}

        {/* Enter Scores Tab */}
        {tab === 'scores' && (
          <div className='card space-y-4'>
            <h2 className='font-semibold text-dark-100'>Enter Scores for All Participants</h2>
            <p className='text-xs text-dark-500'>Enter the score for each team/participant. Ranks will be automatically calculated.</p>
            {registrations.length === 0 && <p className='text-dark-400 text-sm'>No registrations yet.</p>}
            {registrations.map((reg, idx) => (
              <div key={reg.id} className='flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700'>
                <div className='flex-1'>
                  <p className='font-medium text-dark-100 text-sm'>{reg.student?.name}</p>
                  <p className='text-xs text-dark-500'>{reg.teamName || reg.student?.email}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <label className='text-xs text-dark-400'>Score</label>
                  <input type='number' min='0' max='10000' step='0.5'
                    className='input w-28 text-center'
                    value={scores[reg.id] ?? ''}
                    onChange={e => handleScoreChange(reg.id, e.target.value)}
                    placeholder='0'
                  />
                </div>
              </div>
            ))}
            {registrations.length > 0 && (
              <button onClick={handleSubmitResults} disabled={submitting}
                className='btn-primary w-full mt-2'>
                {submitting ? 'Submitting...' : '🚀 Submit Results & Publish Leaderboard'}
              </button>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === 'leaderboard' && (
          <div className='space-y-6'>
            {leaderboard.length > 0 && (
              <div className='card flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-brand-500/5 border border-brand-500/20'>
                <div>
                  <h2 className='font-semibold text-brand-400'>🎓 Automated Certificates & Prize Dispatches</h2>
                  <p className='text-xs text-dark-400 mt-1.5 max-w-xl'>Generate digital PDF certificates for all winners and participants, customize them based on ranks and prize pool awards, and instantly dispatch them to everyone's registered email IDs!</p>
                </div>
                <button
                  onClick={handleDispatchCertificates}
                  disabled={sendingEmails}
                  className='btn btn-brand self-start md:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 tracking-wide shadow-glow'
                >
                  {sendingEmails ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Sending Emails...
                    </>
                  ) : (
                    '✉️ Dispatch PDF Certificates'
                  )}
                </button>
              </div>
            )}

            <div className='card'>
              <h2 className='font-semibold text-dark-100 mb-6'>Live Leaderboard</h2>
              {leaderboard.length === 0 ? (
                <p className='text-dark-400 text-sm'>No results yet. Submit scores from the Enter Scores tab.</p>
              ) : (
                <div className='space-y-3'>
                  {leaderboard.map((entry, idx) => (
                    <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl border ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : idx === 1 ? 'bg-gray-500/10 border-gray-500/30' : idx === 2 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-800 border-dark-700'}`}>
                      <span className='text-2xl w-10 text-center'>{MEDAL[idx] || `#${entry.rank}`}</span>
                      <div className='flex-1'>
                        <p className='font-bold text-dark-50'>{entry.student?.name}</p>
                        <p className='text-xs text-dark-400'>{entry.teamName || entry.student?.email}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-brand-400 text-lg'>{entry.score}</p>
                        <p className='text-xs text-dark-500'>points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Answer Key Tab */}
        {tab === 'answerkey' && (
          <div className='card space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='font-semibold text-dark-100'>Answer Key</h2>
                <p className='text-xs text-dark-500 mt-1'>Add all questions with correct answers so students can learn from their mistakes.</p>
              </div>
              <button onClick={addQuestion} className='px-3 py-1.5 bg-dark-700 border border-dark-600 text-sm rounded-xl text-dark-200 hover:bg-dark-600'>+ Add Question</button>
            </div>
            {answerKey.map((q, i) => (
              <div key={i} className='p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-brand-400'>Question {i + 1}</span>
                  {answerKey.length > 1 && (
                    <button onClick={() => removeQuestion(i)} className='text-xs text-red-400 hover:text-red-300'>Remove</button>
                  )}
                </div>
                <textarea className='input w-full resize-none' rows={2} placeholder='Enter question...'
                  value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} />
                <input className='input w-full' placeholder='✅ Correct answer'
                  value={q.answer} onChange={e => updateQuestion(i, 'answer', e.target.value)} />
                <input className='input w-full' placeholder='💡 Explanation (optional)'
                  value={q.explanation} onChange={e => updateQuestion(i, 'explanation', e.target.value)} />
              </div>
            ))}
            <button onClick={handleSaveAnswerKey} disabled={savingAK} className='btn-primary w-full'>
              {savingAK ? 'Publishing...' : '📋 Publish Answer Key'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default EventResults;

import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import useWebSocket from '../hooks/useWebSocket';

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EventLeaderboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { leaderboard, connected } = useWebSocket(eventId);

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <button onClick={() => navigate('/events/' + eventId)} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Event</button>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Live Leaderboard</h1>
            <p className='text-dark-400 text-sm mt-1'>Updates in real-time</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className={'w-2 h-2 rounded-full ' + (connected ? 'bg-green-500 animate-pulse' : 'bg-red-400')} />
            <span className='text-xs text-dark-400'>{connected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
        {leaderboard.length === 0 ? (
          <div className='text-center py-20 text-dark-500'>No scores yet.</div>
        ) : (
          <div className='card overflow-hidden p-0'>
            <table className='w-full'>
              <thead className='bg-dark-800 border-b border-dark-700'>
                <tr>
                  {['Rank', 'Student', 'School', 'Score'].map(h => (
                    <th key={h} className={'px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wide ' + (h === 'Score' ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(e => (
                  <tr key={e.id} className='border-b border-dark-800 hover:bg-dark-800/50 transition-colors'>
                    <td className='px-6 py-4 text-sm font-bold'>{medal[e.rank] || '#' + e.rank}</td>
                    <td className='px-6 py-4'><p className='text-sm font-semibold text-dark-100'>{e.student?.name}</p><p className='text-xs text-dark-500'>{e.student?.email}</p></td>
                    <td className='px-6 py-4 text-sm text-dark-400'>{e.school?.name}</td>
                    <td className='px-6 py-4 text-right'><span className='font-display font-bold text-brand-400'>{e.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default EventLeaderboard;

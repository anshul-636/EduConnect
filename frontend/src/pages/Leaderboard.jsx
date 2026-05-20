import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import leaderboardService from '../services/leaderboardService';

const medal = { 1:'🥇', 2:'🥈', 3:'🥉' };
const CATEGORIES = ['','DEBATE','QUIZ','SCIENCE','SPORTS','ARTS','OTHER'];

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    leaderboardService.getAll(category ? { category } : {})
      .then(res => setEntries(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [category]);

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Leaderboard</h1>
            <p className='text-dark-400 text-sm mt-1'>Top performers across all events</p>
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className='input max-w-[180px]'>
            {CATEGORIES.map(c => <option key={c} value={c}>{c||'All Categories'}</option>)}
          </select>
        </div>
        {loading ? <Loader /> : entries.length === 0 ? (
          <div className='text-center py-20 text-dark-500'>No scores recorded yet.</div>
        ) : (
          <div className='card overflow-hidden p-0'>
            <table className='w-full'>
              <thead className='bg-dark-800 border-b border-dark-700'>
                <tr>
                  {['Rank','Student','School','Event','Score'].map(h => (
                    <th key={h} className={'px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wide ' + (h==='Score'?'text-right':'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e,i) => (
                  <tr key={e.id} className='border-b border-dark-800 hover:bg-dark-800/50 transition-colors'>
                    <td className='px-6 py-4 text-sm font-bold text-dark-100'>{medal[e.rank]||'#'+e.rank}</td>
                    <td className='px-6 py-4'><p className='text-sm font-semibold text-dark-100'>{e.student?.name}</p><p className='text-xs text-dark-500'>{e.student?.email}</p></td>
                    <td className='px-6 py-4 text-sm text-dark-400'>{e.school?.name}</td>
                    <td className='px-6 py-4 text-sm text-dark-400'>{e.event?.title}</td>
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
export default Leaderboard;

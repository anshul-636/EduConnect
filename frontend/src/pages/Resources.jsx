import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import resourceService from '../services/resourceService';
import useAuthStore from '../store/authStore';

const TYPES = ['ALL','PDF','VIDEO','LINK','NOTES'];
const DIFFICULTIES = ['ALL','BEGINNER','INTERMEDIATE','ADVANCED'];
const typeIcon = { PDF:'📄', VIDEO:'🎥', LINK:'🔗', NOTES:'📝' };
const diffColor = { BEGINNER:'bg-green-500/20 text-green-400', INTERMEDIATE:'bg-yellow-500/20 text-yellow-400', ADVANCED:'bg-red-500/20 text-red-400' };

const Resources = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');

  const fetchResources = () => {
    setLoading(true);
    const params = {};
    if (type !== 'ALL') params.type = type;
    if (difficulty !== 'ALL') params.difficulty = difficulty;
    if (search) params.search = search;
    resourceService.getAll(params).then(res => setResources(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, [type, difficulty]);

  return (
    <Layout>
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Resources</h1>
            <p className='text-dark-400 text-sm mt-1'>{resources.length} resources available</p>
          </div>
          {['SCHOOL','TEACHER'].includes(user?.role) && (
            <Link to='/resources/upload' className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-glow'>+ Upload</Link>
          )}
        </div>
        <div className='flex flex-wrap gap-3 mb-6'>
          <input type='text' placeholder='Search resources...' value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter'&&fetchResources()} className='input max-w-xs' />
          <select value={type} onChange={e => setType(e.target.value)} className='input max-w-[140px]'>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className='input max-w-[160px]'>{DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}</select>
        </div>
        {loading ? <Loader /> : resources.length === 0 ? (
          <div className='text-center py-20 text-dark-500'>No resources found.</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {resources.map(r => (
              <Link key={r.id} to={'/resources/' + r.id} className='card-hover group'>
                <div className='flex items-start justify-between mb-3'>
                  <span className='text-2xl'>{typeIcon[r.type]||'📄'}</span>
                  <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (diffColor[r.difficulty]||'')}>{r.difficulty}</span>
                </div>
                <h3 className='font-semibold text-dark-100 group-hover:text-brand-400 transition-colors'>{r.title}</h3>
                <p className='text-xs text-dark-500 mt-1'>{r.subject||'No subject'} {r.topic?'— '+r.topic:''}</p>
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-dark-800 text-xs text-dark-500'>
                  <span>👁 {r.viewCount} views</span>
                  <span>👍 {r.upvotes} upvotes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Resources;

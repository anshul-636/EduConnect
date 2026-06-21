import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import schoolService from '../services/schoolService';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useScrollReveal();

  useEffect(() => {
    schoolService.getAll()
      .then(res => setSchools(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-6 reveal'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Schools</h1>
            <p className='text-dark-400 text-sm mt-1'>{schools.length} schools on EduConnect</p>
          </div>
          <input type='text' placeholder='Search schools...' value={search}
            onChange={e => setSearch(e.target.value)} className='input max-w-xs' />
        </div>
        {loading ? <Loader /> : filtered.length === 0 ? (
          <div className='text-center py-20 text-dark-500 reveal'>No schools found.</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filtered.map((school, i) => (
              <Link key={school.id} to={'/schools/' + school.id} className={`card-hover group reveal delay-${Math.min((i % 8) + 1, 8)}`}>
                <div className='flex items-start justify-between mb-3'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-lg'>
                    {school.name.charAt(0)}
                  </div>
                  <span className='text-xs bg-dark-800 text-dark-400 px-2 py-1 rounded-full'>{school.affiliation || 'N/A'}</span>
                </div>
                <h3 className='font-semibold text-dark-100 group-hover:text-brand-400 transition-colors'>{school.name}</h3>
                <p className='text-sm text-dark-500 mt-1'>{school.location || 'Location not set'}</p>
                {school.admin && (
                  <div className='mt-3 space-y-1 text-xs text-dark-400 border-l border-dark-800 pl-2.5'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[10px] opacity-75'>👤</span>
                      <span className='truncate font-medium'>{school.admin.name}</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[10px] opacity-75'>✉️</span>
                      <span className='truncate text-dark-500 hover:text-brand-400 transition-colors'>{school.admin.email}</span>
                    </div>
                  </div>
                )}
                <div className='flex gap-4 mt-4 pt-4 border-t border-dark-800 text-xs text-dark-500'>
                  <span>{school._count?.members || 0} members</span>
                  <span>{school._count?.events || 0} events</span>
                  <span>{school._count?.resources || 0} resources</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Schools;

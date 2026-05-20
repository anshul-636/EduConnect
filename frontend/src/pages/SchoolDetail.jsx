import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import schoolService from '../services/schoolService';

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schoolService.getById(id)
      .then(res => setSchool(res.data))
      .catch(() => navigate('/schools'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><Loader /></Layout>;
  if (!school) return null;

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <button onClick={() => navigate('/schools')} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Schools</button>
        <div className='card'>
          <div className='flex items-start gap-5 mb-6'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-2xl'>
              {school.name.charAt(0)}
            </div>
            <div>
              <h1 className='font-display font-bold text-2xl text-dark-50'>{school.name}</h1>
              <p className='text-dark-400 text-sm mt-1'>{school.location || 'Location not set'}</p>
              <span className='inline-block mt-2 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full'>
                {school.affiliation || 'Affiliation not set'}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-4 mb-6'>
            {[{label:'Members',value:school._count?.members||0},{label:'Events',value:school._count?.events||0},{label:'Resources',value:school._count?.resources||0}].map(s => (
              <div key={s.label} className='bg-dark-800 rounded-xl p-4 text-center'>
                <p className='font-display font-bold text-2xl text-brand-400'>{s.value}</p>
                <p className='text-xs text-dark-500 mt-1'>{s.label}</p>
              </div>
            ))}
          </div>
          <div className='border-t border-dark-800 pt-5 space-y-2'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-3'>Contact Information</h3>
            <p className='text-sm text-dark-400'>School Coordinator: <span className='font-semibold text-dark-200'>{school.admin?.name || 'N/A'}</span></p>
            <p className='text-sm text-dark-400'>Contact Email: <a href={`mailto:${school.admin?.email}`} className='font-semibold text-brand-400 hover:text-brand-300 hover:underline'>{school.admin?.email || 'N/A'}</a></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default SchoolDetail;

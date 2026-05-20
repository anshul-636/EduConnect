import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import resourceService from '../services/resourceService';
import useAuthStore from '../store/authStore';

const typeIcon = { PDF:'📄', VIDEO:'🎥', LINK:'🔗', NOTES:'📝' };

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    resourceService.getById(id).then(res => setResource(res.data)).catch(() => navigate('/resources')).finally(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    setUpvoting(true);
    try { const res = await resourceService.upvote(id); setResource(res.data); setMsg('Upvoted!'); setTimeout(()=>setMsg(''),2000); }
    catch (err) { setMsg(err.response?.data?.message||'Failed.'); }
    finally { setUpvoting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this resource?')) return;
    try { await resourceService.delete(id); navigate('/resources'); }
    catch (err) { alert(err.response?.data?.message||'Failed.'); }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!resource) return null;

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <button onClick={() => navigate('/resources')} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Resources</button>
        <div className='card'>
          <div className='flex items-start justify-between mb-4'>
            <span className='text-3xl'>{typeIcon[resource.type]||'📄'}</span>
            <span className='text-xs bg-dark-800 text-dark-400 px-2 py-1 rounded-full'>{resource.difficulty}</span>
          </div>
          <h1 className='font-display font-bold text-2xl text-dark-50 mb-2'>{resource.title}</h1>
          <p className='text-dark-400 text-sm mb-6'>{resource.description||'No description.'}</p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {[{label:'Type',value:resource.type},{label:'Subject',value:resource.subject||'N/A'},{label:'Topic',value:resource.topic||'N/A'},{label:'Uploaded by',value:resource.uploader?.name}].map(s=>(
              <div key={s.label} className='bg-dark-800 rounded-xl p-4'>
                <p className='text-xs text-dark-500 mb-1'>{s.label}</p>
                <p className='font-semibold text-dark-100 text-sm'>{s.value}</p>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-3 flex-wrap'>
            {resource.fileUrl && (
              <a href={resource.fileUrl} target='_blank' rel='noreferrer'
                className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-glow'>
                Open / Download ↗
              </a>
            )}
            {user?.role==='STUDENT' && (
              <button onClick={handleUpvote} disabled={upvoting}
                className='px-4 py-2 bg-dark-800 border border-dark-700 text-sm font-medium rounded-xl hover:bg-dark-700 text-dark-200'>
                👍 Upvote ({resource.upvotes})
              </button>
            )}
            {(user?.id===resource.uploadedBy||user?.role==='ADMIN') && (
              <button onClick={handleDelete} className='px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20'>Delete</button>
            )}
          </div>
          {msg && <p className='mt-3 text-sm text-green-400'>{msg}</p>}
        </div>
      </div>
    </Layout>
  );
};
export default ResourceDetail;

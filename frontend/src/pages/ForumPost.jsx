import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import forumService from '../services/forumService';
import useAuthStore from '../store/authStore';

const roleColor = {
  ADMIN: 'bg-red-500/20 text-red-400',
  SCHOOL: 'bg-purple-500/20 text-purple-400',
  TEACHER: 'bg-green-500/20 text-green-400',
  STUDENT: 'bg-brand-500/20 text-brand-400',
};

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchPost = () => {
    forumService.getById(id)
      .then(res => setPost(res.data))
      .catch(() => navigate('/forum'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleReply = async e => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplying(true);
    try { await forumService.reply(id, reply); setReply(''); fetchPost(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setReplying(false); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete?')) return;
    try { await forumService.delete(postId); navigate('/forum'); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!post) return null;

  return (
    <Layout>
      <div className='max-w-3xl mx-auto'>
        <button onClick={() => navigate('/forum')} className='text-dark-400 hover:text-dark-100 text-sm mb-6 flex items-center gap-1'>
          ← Back to Forum
        </button>

        <div className='card mb-4'>
          {post.title && <h1 className='font-display font-bold text-xl text-dark-50 mb-3'>{post.title}</h1>}
          <p className='text-dark-300 leading-relaxed'>{post.content}</p>
          <div className='flex items-center gap-2 mt-4 pt-4 border-t border-dark-800'>
            <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (roleColor[post.author?.role] || '')}>{post.author?.role}</span>
            <span className='text-xs text-dark-400'>{post.author?.name}</span>
            <span className='text-xs text-dark-700'>•</span>
            <span className='text-xs text-dark-500'>{new Date(post.createdAt).toLocaleDateString()}</span>
            {(user?.id === post.authorId || user?.role === 'ADMIN') && (
              <button onClick={() => handleDelete(post.id)} className='ml-auto text-xs text-red-500 hover:text-red-400'>Delete</button>
            )}
          </div>
        </div>

        <div className='space-y-3 mb-6'>
          {post.replies?.map(r => (
            <div key={r.id} className='card'>
              <p className='text-dark-300 text-sm'>{r.content}</p>
              <div className='flex items-center gap-2 mt-3'>
                <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (roleColor[r.author?.role] || '')}>{r.author?.role}</span>
                <span className='text-xs text-dark-400'>{r.author?.name}</span>
                <span className='text-xs text-dark-700'>•</span>
                <span className='text-xs text-dark-500'>{new Date(r.createdAt).toLocaleDateString()}</span>
                {(user?.id === r.authorId || user?.role === 'ADMIN') && (
                  <button onClick={() => handleDelete(r.id)} className='ml-auto text-xs text-red-500 hover:text-red-400'>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='card'>
          <h3 className='font-semibold text-dark-100 mb-3 text-sm'>Write a reply</h3>
          <form onSubmit={handleReply} className='space-y-3'>
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              className='input min-h-[80px] resize-none' placeholder='Your reply...' required />
            <button type='submit' disabled={replying}
              className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50'>
              {replying ? 'Posting...' : 'Reply'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default ForumPost;

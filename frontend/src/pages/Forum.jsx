import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const Forum = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '' });
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = () => {
    forumService.getAll()
      .then(res => {
        // Backend returns { success, items, pagination }
        const payload = res?.items ?? res?.data ?? [];
        setPosts(Array.isArray(payload) ? payload : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setPosting(true);
    try {
      await forumService.create(form);
      setForm({ title: '', content: '' });
      setShowForm(false);
      fetchPosts();
    } catch (err) { alert(err.response?.data?.message || 'Failed to post.'); }
    finally { setPosting(false); }
  };

  return (
    <Layout>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Forum</h1>
            <p className='text-dark-400 text-sm mt-1'>Discuss events, resources and ideas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-glow'>
            + New Post
          </button>
        </div>

        {showForm && (
          <div className='card mb-6'>
            <form onSubmit={handleSubmit} className='space-y-3'>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className='input' placeholder='Post title (optional)' />
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className='input min-h-[100px] resize-none' placeholder='Write your post...' required />
              <div className='flex gap-2'>
                <button type='submit' disabled={posting}
                  className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50'>
                  {posting ? 'Posting...' : 'Post'}
                </button>
                <button type='button' onClick={() => setShowForm(false)}
                  className='px-4 py-2 bg-dark-800 text-dark-300 text-sm rounded-xl hover:bg-dark-700'>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? <Loader /> : posts.length === 0 ? (
          <div className='text-center py-20 text-dark-500'>
            <p className='text-4xl mb-3'>💬</p>
            <p>No posts yet. Start a discussion!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {posts.map(post => (
              <Link key={post.id} to={'/forum/' + post.id} className='card-hover block'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    {post.title && <h3 className='font-semibold text-dark-100 mb-1'>{post.title}</h3>}
                    <p className='text-sm text-dark-400 line-clamp-2'>{post.content}</p>
                  </div>
                  <span className='ml-4 text-xs text-dark-500 whitespace-nowrap'>{post._count?.replies || 0} replies</span>
                </div>
                <div className='flex items-center gap-2 mt-3'>
                  <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (roleColor[post.author?.role] || '')}>
                    {post.author?.role}
                  </span>
                  <span className='text-xs text-dark-400'>{post.author?.name}</span>
                  <span className='text-xs text-dark-700'>•</span>
                  <span className='text-xs text-dark-500'>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.event && (
                    <span className='text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded-full ml-auto'>{post.event.title}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Forum;

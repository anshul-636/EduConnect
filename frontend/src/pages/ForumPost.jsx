
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import forumService from '../services/forumService';
import useAuthStore from '../store/authStore';

const roleColor = {
  ADMIN:   'bg-red-500/20 text-red-400',
  SCHOOL:  'bg-purple-500/20 text-purple-400',
  TEACHER: 'bg-green-500/20 text-green-400',
  STUDENT: 'bg-brand-500/20 text-brand-400',
};

const PostCard = ({ item, user, onDelete, onEdit, isReply = false }) => {
  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState(item.content);
  const [saving,  setSaving]    = useState(false);
  const canAct = user?.id === item.authorId || user?.role === 'ADMIN';

  const handleSave = async () => {
    if (!draft.trim() || draft === item.content) { setEditing(false); return; }
    setSaving(true);
    try {
      await forumService.edit(item.id, isReply ? { content: draft } : { title: item.title, content: draft });
      onEdit();
      setEditing(false);
    } catch (err) { alert(err.response?.data?.message || 'Edit failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card mb-4">
      {!isReply && item.title && !editing && (
        <h1 className="font-display font-bold text-xl text-dark-50 mb-3">{item.title}</h1>
      )}

      {editing ? (
        <div className="space-y-3">
          {!isReply && item.title && (
            <input
              className="input text-base font-semibold"
              defaultValue={item.title}
              readOnly
            />
          )}
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="input min-h-[100px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
              <Check size={14}/>{saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setDraft(item.content); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-dark-700 text-dark-300 text-sm rounded-xl hover:bg-dark-800">
              <X size={14}/>Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-dark-300 leading-relaxed">{item.content}</p>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dark-800">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[item.author?.role] || ''}`}>
          {item.author?.role}
        </span>
        <span className="text-xs text-dark-400">{item.author?.name}</span>
        <span className="text-xs text-dark-700">•</span>
        <span className="text-xs text-dark-500">{new Date(item.createdAt).toLocaleDateString()}</span>
        {canAct && !editing && (
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-dark-400 hover:text-dark-100 transition-colors">
              <Pencil size={12}/>Edit
            </button>
            <button onClick={() => onDelete(item.id)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors">
              <Trash2 size={12}/>Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post,     setPost]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [reply,    setReply]    = useState('');
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

  const handleDelete = async postId => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await forumService.delete(postId);
      if (postId === id) navigate('/forum');
      else fetchPost();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!post)   return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/forum')}
          className="text-dark-400 hover:text-dark-100 text-sm mb-6 flex items-center gap-1">
          ← Back to Forum
        </button>

        <PostCard item={post} user={user} onDelete={handleDelete} onEdit={fetchPost} isReply={false}/>

        {post.replies?.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-2">
              {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
            </p>
            {post.replies.map(r => (
              <PostCard key={r.id} item={r} user={user} onDelete={handleDelete} onEdit={fetchPost} isReply/>
            ))}
          </div>
        )}

        <div className="card">
          <h3 className="font-semibold text-dark-100 mb-3 text-sm">Write a reply</h3>
          <form onSubmit={handleReply} className="space-y-3">
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              className="input min-h-[80px] resize-none" placeholder="Your reply…" required />
            <button type="submit" disabled={replying}
              className="px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
              {replying ? 'Posting…' : 'Post Reply'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default ForumPost;
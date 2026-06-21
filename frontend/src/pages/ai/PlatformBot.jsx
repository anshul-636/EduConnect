import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../../components/common/Layout';
import ChatWindow from '../../components/ai/ChatWindow';
import aiService from '../../services/aiService';
import resourceService from '../../services/resourceService';

const SUGGESTIONS = [
  'Which events are open for registration?',
  'Show me top resources for Physics',
  'Who is leading the leaderboard?',
  'What debate events are coming up?',
  'Recommend me study resources',
];

const PlatformBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am your EduConnect assistant 👋\n\nI can help you find events, resources, leaderboard rankings, and anything about the platform. You can even upload a PDF here and I will help you analyze it! What would you like to know?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());

  const handleSend = async (message) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const res = await aiService.platformChat(message, sessionId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.reply || 'Sorry, I could not process that.'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to AI service.'
      }]);
    } finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace('.pdf', ''));
    formData.append('type', 'PDF');
    formData.append('subject', 'General');
    formData.append('difficulty', 'BEGINNER');

    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: `📂 *Uploading and indexing "${file.name}"...*` }]);

    try {
      await resourceService.upload(formData);
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: `✅ **Successfully added "${file.name}" to the platform.** I've indexed the content and can now answer any questions about it!`
        };
        return next;
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ *Failed to upload "${file.name}". Please try again.*` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className='max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>🤖 Platform Assistant</h1>
            <p className='text-dark-400 text-sm mt-1'>Ask me anything about EduConnect</p>
          </div>
          <div className='flex gap-2 flex-wrap justify-end'>
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button key={s} onClick={() => handleSend(s)}
                className='text-xs px-3 py-1.5 bg-dark-800 border border-dark-700 text-dark-300 rounded-full hover:border-brand-500/50 hover:text-brand-400 transition-all'>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className='flex-1 card overflow-hidden flex flex-col p-0'>
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            onUpload={handleUpload}
            loading={loading}
            placeholder='Ask about events, resources, leaderboard...'
          />
        </div>
      </div>
    </Layout>
  );
};
export default PlatformBot;

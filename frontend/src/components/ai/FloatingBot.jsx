import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './ChatWindow';
import aiService from '../../services/aiService';
import useAuthStore from '../../store/authStore';

const FloatingBot = () => {
  const { user } = useAuthStore();
  
  const [open, setOpen] = useState(() => {
    if (!user) return false;
    const saved = localStorage.getItem(`educonnect_chat_open_${user.id}`);
    return saved === 'true';
  });

  const [messages, setMessages] = useState(() => {
    if (!user) return [{ role: 'assistant', content: 'Hi! Ask me anything about EduConnect 👋' }];
    const saved = localStorage.getItem(`educonnect_chat_history_${user.id}`);
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Hi! Ask me anything about EduConnect 👋' }
    ];
  });

  const [loading, setLoading] = useState(false);

  const [sessionId] = useState(() => {
    if (!user) return uuidv4();
    const saved = localStorage.getItem(`educonnect_chat_session_${user.id}`);
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem(`educonnect_chat_session_${user.id}`, newId);
    return newId;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`educonnect_chat_open_${user.id}`, open);
    }
  }, [open, user]);

  if (!user) return null;

  const handleSend = async (message) => {
    const userMsg = { role: 'user', content: message };
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    localStorage.setItem(`educonnect_chat_history_${user.id}`, JSON.stringify(updatedWithUser));
    
    setLoading(true);
    try {
      const res = await aiService.platformChat(message, sessionId);
      const assistantMsg = { role: 'assistant', content: res.reply || 'Sorry, could not process that.' };
      const updatedWithAssistant = [...updatedWithUser, assistantMsg];
      setMessages(updatedWithAssistant);
      localStorage.setItem(`educonnect_chat_history_${user.id}`, JSON.stringify(updatedWithAssistant));
    } catch {
      const errorMsg = { role: 'assistant', content: 'AI service unavailable.' };
      const updatedWithError = [...updatedWithUser, errorMsg];
      setMessages(updatedWithError);
      localStorage.setItem(`educonnect_chat_history_${user.id}`, JSON.stringify(updatedWithError));
    } finally { setLoading(false); }
  };

  const handleClearHistory = () => {
    const initialMsg = [{ role: 'assistant', content: 'Hi! Ask me anything about EduConnect 👋' }];
    setMessages(initialMsg);
    localStorage.setItem(`educonnect_chat_history_${user.id}`, JSON.stringify(initialMsg));
    const newId = uuidv4();
    localStorage.setItem(`educonnect_chat_session_${user.id}`, newId);
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {open && (
        <div className='mb-4 w-80 h-96 bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in'>
          <div className='px-4 py-3 bg-gradient-brand flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span>🤖</span>
              <span className='text-white font-semibold text-sm'>EduConnect AI</span>
            </div>
            <div className='flex items-center gap-2'>
              <button onClick={handleClearHistory} title="Clear Chat" className='text-white/60 hover:text-white text-xs transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg font-medium'>
                🧹 Clear
              </button>
              <button onClick={() => setOpen(false)} className='text-white/70 hover:text-white text-lg'>×</button>
            </div>
          </div>
          <div className='flex-1 overflow-hidden'>
            <ChatWindow messages={messages} onSend={handleSend} loading={loading} placeholder='Ask me anything...' />
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className='w-14 h-14 bg-gradient-brand rounded-full shadow-glow flex items-center justify-center text-2xl hover:scale-110 transition-transform'>
        {open ? '×' : '🤖'}
      </button>
    </div>
  );
};
export default FloatingBot;

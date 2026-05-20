import { useState, useRef, useEffect } from 'react';

const ChatWindow = ({ onSend, loading, messages, placeholder = 'Ask anything...', welcomeScreen = null }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Messages */}
      <div className='flex-1 overflow-y-auto space-y-4 p-4'>
        {messages.length === 0 && (
          welcomeScreen ? welcomeScreen : (
            <div className='text-center py-12 text-dark-500'>
              <p className='text-4xl mb-3'>🤖</p>
              <p className='text-sm'>Start a conversation...</p>
            </div>
          )
        )}
        {messages.map((msg, i) => (
          <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={'max-w-[80%] rounded-2xl px-4 py-3 text-sm ' +
              (msg.role === 'user'
                ? 'bg-gradient-brand text-white rounded-br-sm'
                : 'bg-dark-800 text-dark-100 rounded-bl-sm border border-dark-700')}>
              <p className='whitespace-pre-wrap leading-relaxed'>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className='mt-3 pt-3 border-t border-dark-700 space-y-1'>
                  <p className='text-xs text-dark-400 font-medium'>Sources:</p>
                  {msg.sources.map((s, j) => (
                    <div key={j} className='text-xs text-dark-400 bg-dark-900 rounded-lg p-2'>
                      <p className='font-medium text-brand-400'>{s.title}</p>
                      <p className='text-dark-500 mt-0.5'>{s.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className='flex justify-start'>
            <div className='bg-dark-800 border border-dark-700 rounded-2xl rounded-bl-sm px-4 py-3'>
              <div className='flex gap-1'>
                {[0,1,2].map(i => (
                  <div key={i} className='w-2 h-2 bg-brand-400 rounded-full animate-bounce'
                    style={{ animationDelay: i * 0.15 + 's' }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className='p-4 border-t border-dark-800'>
        <div className='flex gap-3'>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className='input flex-1'
            disabled={loading}
          />
          <button type='submit' disabled={loading || !input.trim()}
            className='px-4 py-2.5 bg-gradient-brand text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-glow transition-all'>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

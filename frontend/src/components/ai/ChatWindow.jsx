import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Edit2, Send, Paperclip, Terminal, FileText, Trash2 } from 'lucide-react';

const ChatWindow = ({ onSend, onUpload, loading, messages, placeholder = 'Ask anything...', welcomeScreen = null }) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (editingIndex !== null) {
      // Handle edit (this would require onSend to support resubmitting or just update UI)
      // For now, we'll just send it as a new message to keep it simple and stable
      onSend(input.trim());
      setEditingIndex(null);
    } else {
      onSend(input.trim());
    }
    setInput('');
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (content, index) => {
    setInput(content);
    setEditingIndex(index);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className='flex flex-col h-full bg-dark-900/50 backdrop-blur-sm'>
      {/* Messages */}
      <div className='flex-1 overflow-y-auto space-y-6 p-6 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent'>
        {messages.length === 0 && (
          welcomeScreen ? welcomeScreen : (
            <div className='flex flex-col items-center justify-center h-full text-center py-12 text-dark-500 opacity-60'>
              <div className='w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mb-6 border border-dark-700 shadow-inner'>
                <Terminal size={40} className='text-brand-400' />
              </div>
              <h3 className='text-xl font-display font-bold text-dark-200 mb-2'>AI Workspace Ready</h3>
              <p className='text-sm max-w-xs mx-auto'>Ask a question or upload a PDF to start analyzing your materials.</p>
            </div>
          )
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex group animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[85%] rounded-3xl px-5 py-4 text-sm transition-all duration-200 ${msg.role === 'user'
                ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-br-sm shadow-glow-sm'
                : 'bg-dark-800/80 text-dark-100 rounded-bl-sm border border-dark-700 ring-1 ring-white/5'
              }`}>

              {/* Actions Overlay */}
              <div className={`absolute top-2 ${msg.role === 'user' ? '-left-10' : '-right-10'} flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                {msg.role === 'assistant' ? (
                  <button
                    onClick={() => handleCopy(msg.content, i)}
                    className='p-2 bg-dark-800 border border-dark-700 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-brand-400 transition-colors shadow-lg'
                    title="Copy Answer"
                  >
                    {copiedId === i ? <Check size={14} className='text-green-400' /> : <Copy size={14} />}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(msg.content, i)}
                    className='p-2 bg-dark-800 border border-dark-700 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-brand-400 transition-colors shadow-lg'
                    title="Edit Prompt"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              {/* Message Content */}
              <div className='prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-dark-950 prose-pre:border prose-pre:border-dark-800 prose-pre:rounded-xl'>
                {msg.role === 'user' ? (
                  <p className='whitespace-pre-wrap'>{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* Sources Section */}
              {msg.sources && msg.sources.length > 0 && (
                <div className='mt-4 pt-4 border-t border-dark-700/50 space-y-2'>
                  <div className='flex items-center gap-2 text-[10px] text-dark-500 font-bold uppercase tracking-wider mb-2'>
                    <FileText size={10} /> Reference Sources
                  </div>
                  <div className='grid grid-cols-1 gap-2'>
                    {msg.sources.map((s, j) => (
                      <div key={j} className='text-xs text-dark-400 bg-dark-900/50 hover:bg-dark-900 rounded-xl p-3 border border-dark-800 transition-colors group/src'>
                        <div className='flex items-center justify-between mb-1'>
                          <p className='font-bold text-brand-400 truncate pr-4'>{s.title}</p>
                          <span className='px-1.5 py-0.5 rounded bg-dark-800 text-[9px] font-mono'>{s.score ? Math.round(s.score * 100) : 0}% Match</span>
                        </div>
                        <p className='text-dark-500 line-clamp-2 italic'>"{s.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className='flex justify-start animate-in fade-in duration-300'>
            <div className='bg-dark-800/80 border border-dark-700 rounded-3xl rounded-bl-sm px-5 py-4'>
              <div className='flex items-center gap-1.5'>
                <div className='w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce' style={{ animationDelay: '0s' }} />
                <div className='w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce' style={{ animationDelay: '0.15s' }} />
                <div className='w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce' style={{ animationDelay: '0.3s' }} />
                <span className='ml-2 text-xs font-medium text-dark-500'>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className='h-4' />
      </div>

      {/* Input Area */}
      <div className='p-6 bg-dark-900/80 border-t border-dark-800'>
        <form onSubmit={handleSubmit} className='max-w-4xl mx-auto'>
          <div className='relative flex items-end gap-3 bg-dark-800 border border-dark-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition-all duration-300 shadow-lg'>

            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className='p-3 text-dark-500 hover:text-brand-400 hover:bg-dark-700 rounded-xl transition-all'
              title="Upload Document"
              disabled={loading}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />

            <textarea
              rows="1"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={editingIndex !== null ? 'Update your prompt...' : placeholder}
              className='flex-1 bg-transparent border-none focus:ring-0 text-dark-100 placeholder-dark-500 text-sm py-3 px-1 resize-none min-h-[44px] max-h-32'
              disabled={loading}
            />

            <div className='flex items-center gap-2 pr-1 pb-1'>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={() => { setEditingIndex(null); setInput(''); }}
                  className='p-3 text-dark-500 hover:text-red-400 transition-all'
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className='p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-30 disabled:grayscale transition-all shadow-glow-sm'
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className='text-[10px] text-dark-600 mt-2 text-center'>
            Press <b>Enter</b> to send • <b>Shift + Enter</b> for new line
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

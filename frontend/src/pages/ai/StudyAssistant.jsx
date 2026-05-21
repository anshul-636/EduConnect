import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../../components/common/Layout';
import ChatWindow from '../../components/ai/ChatWindow';
import aiService from '../../services/aiService';
import resourceService from '../../services/resourceService';
import useAuthStore from '../../store/authStore';

const assistantConfig = {
  STUDENT: { title: '🎓 Study Assistant', desc: 'Ask questions from study materials', icon: '📚', placeholder: 'Ask a question about your study material...' },
  TEACHER: { title: '📝 Lesson Assistant', desc: 'Draft lessons, quizzes, & rubrics from materials', icon: '📝', placeholder: 'Ask to generate a lesson plan or pop quiz from resources...' },
  SCHOOL: { title: '📊 School Analyst', desc: 'Analyze reports and institution guidelines', icon: '📈', placeholder: 'Ask for guidance on compliance, strategy, or schedules...' },
  ADMIN: { title: '🛡️ Security Auditor', desc: 'Check platform policies and infrastructure guides', icon: '🛡️', placeholder: 'Ask about security regulations or platform audit protocols...' },
};

const presetTemplates = {
  TEACHER: [
    { label: '📝 Generate Lesson Plan', text: 'Draft a structured 45-minute lesson plan outline covering the key topics in this material.', icon: '📝', color: 'from-blue-500/20 to-indigo-600/20 text-brand-400 border border-brand-500/30' },
    { label: '❓ Construct Pop Quiz', text: 'Generate 5 multiple-choice questions with correct answers highlighted to test students on these concepts.', icon: '❓', color: 'from-purple-500/20 to-pink-600/20 text-purple-400 border border-purple-500/30' },
    { label: '🏫 Classroom Activities', text: 'Suggest 3 interactive, hands-on activities or debate topics that will help students grasp these materials.', icon: '🏫', color: 'from-amber-500/20 to-orange-600/20 text-amber-400 border border-amber-500/30' },
    { label: '🎯 Assessment Rubric', text: 'Build a detailed grading rubric evaluating students on their understanding of these key concepts.', icon: '🎯', color: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30' },
  ],
  SCHOOL: [
    { label: '📋 Compliance Checklist', text: 'Draft a state-board compliance checklist based on the uploaded school regulations guidelines.', icon: '📋', color: 'from-violet-500/20 to-purple-600/20 text-violet-400 border border-violet-500/30' },
    { label: '✉️ Parent Newsletter', text: 'Compose an engaging quarterly newsletter draft highlighting school updates, achievements, and events.', icon: '✉️', color: 'from-pink-500/20 to-rose-600/20 text-pink-400 border border-pink-500/30' },
    { label: '🍎 Performance Metrics', text: 'Recommend key performance indicators and evaluation patterns for school teachers.', icon: '🍎', color: 'from-red-500/20 to-orange-600/20 text-red-400 border border-red-500/30' },
    { label: '💡 Growth Blueprint', text: 'Suggest modern digital strategies to improve new student enrollments.', icon: '💡', color: 'from-yellow-500/20 to-amber-600/20 text-yellow-400 border border-yellow-500/30' },
  ],
  ADMIN: [
    { label: '🔒 Data Privacy Audit', text: 'Draft a security compliance summary auditing platform user data protection.', icon: '🔒', color: 'from-indigo-500/20 to-blue-600/20 text-brand-400 border border-brand-500/30' },
    { label: '📜 Terms Update', text: 'Suggest terms of service updates matching new platform features.', icon: '📜', color: 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30' },
    { label: '⚙️ Server Backup', text: 'Draft a step-by-step systems maintenance schedule for server recovery.', icon: '⚙️', color: 'from-slate-600/20 to-slate-800/20 text-slate-400 border border-slate-700' },
    { label: '🛡️ Moderation Rules', text: 'Recommend forum moderation guidelines and keyword filters.', icon: '🛡️', color: 'from-rose-500/20 to-red-600/20 text-rose-400 border border-rose-500/30' },
  ],
  STUDENT: [
    { label: '🧠 Summarize Topic', text: 'Summarize the core topics in this study material into 5 bullet points.', icon: '🧠', color: 'from-brand-500/20 to-cyan-600/20 text-brand-400 border border-brand-500/30' },
    { label: '📝 Solved Example', text: 'Show a detailed, step-by-step solved problem related to these concepts.', icon: '📝', color: 'from-violet-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30' },
    { label: '💡 Mind Map Outline', text: 'Draft a conceptual mind-map outline linking all the chapters in this document.', icon: '💡', color: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30' },
    { label: '🔥 Mock Test Question', text: 'Create a practice exam question with complete solution explanation.', icon: '🔥', color: 'from-rose-500/20 to-orange-600/20 text-rose-400 border border-rose-500/30' },
  ],
};

const StudyAssistant = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(() => {
    if (!user) return null;
    const saved = localStorage.getItem(`educonnect_assistant_resource_${user.id}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`educonnect_assistant_messages_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (!user) return uuidv4();
    const saved = localStorage.getItem(`educonnect_assistant_session_${user.id}`);
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem(`educonnect_assistant_session_${user.id}`, newId);
    return newId;
  });

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`educonnect_assistant_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`educonnect_assistant_resource_${user.id}`, JSON.stringify(selectedResource));
    }
  }, [selectedResource, user?.id]);

  useEffect(() => {
    resourceService.getAll({ type: 'PDF' })
      .then(res => {
        setResources(res.data || []);
      })
      .catch(err => {
        console.error(err);
        setResources([]);
      });
  }, [user?.role]);

  const handleSend = async (question) => {
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await aiService.ragChat(question, sessionId, selectedResource?.id || null, user?.role);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer || 'Sorry, I could not find an answer.',
        sources: res.sources || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to AI service. Make sure the AI service is running.',
      }]);
    } finally { setLoading(false); }
  };

  const handleClear = async () => {
    setMessages([]);
    setSelectedResource(null);
    if (user?.id) {
      localStorage.removeItem(`educonnect_assistant_messages_${user.id}`);
      localStorage.removeItem(`educonnect_assistant_resource_${user.id}`);
    }
    await aiService.clearSession(sessionId).catch(() => {});
    const newId = uuidv4();
    if (user?.id) {
      localStorage.setItem(`educonnect_assistant_session_${user.id}`, newId);
    }
    setSessionId(newId);
  };

  const cfg = assistantConfig[user?.role] || assistantConfig.STUDENT;
  const templates = presetTemplates[user?.role] || presetTemplates.STUDENT;

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
      const res = await resourceService.upload(formData);
      const newResource = res.data;
      
      // Update resources list
      setResources(prev => [newResource, ...prev]);
      // Auto-select the new resource
      setSelectedResource(newResource);
      
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { 
          role: 'assistant', 
          content: `✅ **Successfully uploaded and indexed "${file.name}".** I'm now ready to answer questions about this document!` 
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

  const welcomeScreen = (
    <div className='py-6 px-4 max-w-2xl mx-auto space-y-6'>
      <div className='text-center space-y-2'>
        <div className='w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-3xl mx-auto shadow-glow mb-4 animate-bounce'>
          {user?.role === 'TEACHER' ? '📝' : user?.role === 'SCHOOL' ? '📊' : user?.role === 'ADMIN' ? '🛡️' : '🎓'}
        </div>
        <h2 className='text-2xl font-display font-bold text-dark-50'>
          {user?.role === 'TEACHER' ? 'AI Lesson Workspace' : user?.role === 'SCHOOL' ? 'AI Institutional Hub' : user?.role === 'ADMIN' ? 'AI Operations Console' : 'AI Study Assistant'}
        </h2>
        <p className='text-dark-400 text-sm'>
          {user?.role === 'TEACHER' 
            ? 'Welcome, Educator! Select lesson resource PDFs on the left, then click any preset card below to instantly generate lesson plans or pop quizzes.'
            : user?.role === 'SCHOOL'
            ? 'Welcome, Principal! Analyze compliance frameworks, draft school updates, and optimize your institutional operations.'
            : user?.role === 'ADMIN'
            ? 'Welcome, Platform Administrator! Run platform safety metrics audits, policy adjustments, and system checks.'
            : 'Welcome, Learner! Choose your study notes PDF on the left and ask me any tough questions to help you prepare.'}
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 mt-8'>
        {templates.map((tpl, i) => (
          <button
            key={i}
            onClick={() => handleSend(tpl.text)}
            className={`flex flex-col items-start text-left p-4 rounded-2xl bg-gradient-to-br transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none ${tpl.color}`}
          >
            <div className='text-xl mb-2'>{tpl.icon}</div>
            <p className='font-display font-semibold text-sm text-dark-50'>{tpl.label}</p>
            <p className='text-dark-400 text-xs mt-1 leading-relaxed'>{tpl.text}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className='max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4'>
 
        {/* Left — Resource selector */}
        <div className='w-64 flex-shrink-0 flex flex-col gap-3'>
          <div className='card'>
            <h2 className='font-display font-bold text-dark-50 mb-1'>{cfg.title}</h2>
            <p className='text-dark-500 text-xs'>{cfg.desc}</p>
          </div>
 
          <div className='card flex-1 overflow-hidden flex flex-col'>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-dark-300'>Select Resource</p>
              <button onClick={() => setSelectedResource(null)}
                className='text-xs text-dark-500 hover:text-brand-400'>All</button>
            </div>
            <div className='flex-1 overflow-y-auto space-y-2'>
              <button
                onClick={() => setSelectedResource(null)}
                className={'w-full text-left px-3 py-2 rounded-xl text-xs transition-all ' +
                  (!selectedResource ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-dark-800 text-dark-400 hover:bg-dark-700')}>
                🌐 All Resources
              </button>
              {resources.map(r => (
                <button key={r.id} onClick={() => setSelectedResource(r)}
                  className={'w-full text-left px-3 py-2 rounded-xl text-xs transition-all ' +
                    (selectedResource?.id === r.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-dark-800 text-dark-400 hover:bg-dark-700')}>
                  📄 {r.title}
                </button>
              ))}
              {resources.length === 0 && (
                <p className='text-dark-600 text-xs text-center py-4'>No PDF resources found.<br/>Upload PDFs to use RAG.</p>
              )}
            </div>
          </div>
 
          <button onClick={handleClear} className='btn-secondary text-sm py-2'>
            🗑️ Clear Chat
          </button>
        </div>
 
        {/* Right — Chat */}
        <div className='flex-1 card overflow-hidden flex flex-col p-0'>
          <div className='px-4 py-3 border-b border-dark-800 flex items-center gap-2'>
            <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
            <span className='text-dark-300 text-sm font-medium'>
              {selectedResource ? selectedResource.title : 'All Resources'}
            </span>
          </div>
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            onUpload={handleUpload}
            loading={loading}
            placeholder={cfg.placeholder}
            welcomeScreen={welcomeScreen}
          />
        </div>
      </div>
    </Layout>
  );
};
export default StudyAssistant;

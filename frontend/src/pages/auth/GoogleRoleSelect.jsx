import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import schoolService from '../../services/schoolService';

const ROLES = ['STUDENT', 'TEACHER', 'SCHOOL', 'ADMIN'];
const ROLE_INFO = {
  STUDENT: { icon: '👨‍🎓', label: 'Student', desc: 'Join classes, submit assignments & track your progress.', color: 'from-brand-500 to-purple-600', border: 'rgba(139,92,246,0.5)' },
  TEACHER: { icon: '👨‍🏫', label: 'Teacher', desc: 'Create classes, grade assignments & manage students.', color: 'from-blue-500 to-indigo-600', border: 'rgba(59,130,246,0.5)' },
  SCHOOL:  { icon: '🏫', label: 'School Admin', desc: 'Manage your institution, teachers, and analytics.', color: 'from-emerald-500 to-teal-600', border: 'rgba(16,185,129,0.5)' },
  ADMIN:   { icon: '⚙️', label: 'Platform Admin', desc: 'System-wide control and platform monitoring.', color: 'from-orange-500 to-amber-600', border: 'rgba(245,158,11,0.5)' },
};

/* ── Shared study background ──── */
const StudyBg = () => (
  <>
    <style>{`
      @keyframes grs-float {
        0%,100%{transform:translateY(0) rotate(0deg);opacity:0.07;}
        50%{transform:translateY(-16px) rotate(5deg);opacity:0.13;}
      }
      @keyframes grs-glow {
        0%,100%{opacity:0.06;transform:scale(1);}
        50%{opacity:0.14;transform:scale(1.08);}
      }
    `}</style>
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#030712 0%,#050b1a 50%,#07021a 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', animation: 'grs-glow 8s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', animation: 'grs-glow 10s ease-in-out infinite 4s' }} />
      {['📐','🔬','📚','✏️','🧮','💡'].map((ic, i) => (
        <div key={i} className="absolute text-2xl select-none"
          style={{ left: `${[8,85,15,78,92,5][i]}%`, top: `${[15,12,70,65,45,50][i]}%`, animation: `grs-float ${10 + i}s ease-in-out infinite ${i * 1.2}s` }}>
          {ic}
        </div>
      ))}
    </div>
  </>
);

const GoogleRoleSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const [pending, setPending] = useState(null);
  const [role, setRole] = useState('STUDENT');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    if (['TEACHER', 'STUDENT'].includes(role)) {
      setLoadingSchools(true);
      schoolService.getAll()
        .then(res => setSchools(res.data))
        .catch(err => console.error('Failed to load schools', err))
        .finally(() => setLoadingSchools(false));
    }
  }, [role]);

  useEffect(() => {
    try {
      const raw = searchParams.get('pending');
      if (!raw) { navigate('/register'); return; }
      const profile = JSON.parse(decodeURIComponent(raw));
      if (!profile.email || !profile.googleId) { navigate('/register'); return; }
      setPending(profile);
    } catch {
      navigate('/register');
    }
  }, [searchParams, navigate]);

  const handleComplete = async () => {
    if (!pending) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/google/complete', {
        email: pending.email,
        name: pending.name,
        googleId: pending.googleId,
        role,
        ...(schoolId.trim() ? { schoolId: schoolId.trim() } : {}),
      });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      const DASH = { ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school', TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student' };
      navigate(DASH[user.role] || '/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sign-up. Please try again.');
    } finally { setLoading(false); }
  };

  if (!pending) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const info = ROLE_INFO[role];

  return (
    <div className="min-h-screen flex bg-[#030712] text-white relative">
      <StudyBg />

      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10 transition-all py-10">
        <div className="w-full max-w-[440px] mx-auto animate-fade-in">
          
          <Link to="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <span className="text-xl mt-1">📚</span>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">EduConnect</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-2 tracking-tight">Almost there!</h1>
            <p className="text-slate-400">Complete your profile to join EduConnect.</p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl mb-8 border border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              {pending.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white">{pending.name}</p>
              <p className="text-slate-400 text-sm">{pending.email}</p>
            </div>
            <div className="ml-auto px-2 py-1 bg-white/10 text-[10px] uppercase font-bold tracking-widest rounded text-slate-300">
              Google Verified
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-red-300 text-sm flex items-center gap-2 border border-red-500/20 bg-red-500/10">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">I am joining as a...</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {ROLES.map(r => {
                const ri = ROLE_INFO[r];
                const active = role === r;
                return (
                  <div key={r}
                    onClick={() => setRole(r)}
                    className="group cursor-pointer rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
                    style={{ 
                      background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? ri.border : 'rgba(255,255,255,0.05)'}`,
                      transform: active ? 'translateY(-2px)' : 'none',
                      boxShadow: active ? `0 10px 30px -10px ${ri.border}` : 'none',
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{ri.icon}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-transparent bg-white text-black' : 'border-slate-600'}`}>
                        {active && <CheckCircle2 size={14} strokeWidth={3} />}
                      </div>
                    </div>
                    <h3 className={`font-bold transition-colors ${active ? 'text-white' : 'text-slate-300'}`}>{ri.label}</h3>
                  </div>
                );
              })}
            </div>

            {['TEACHER', 'STUDENT'].includes(role) && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select your School (Optional)</label>
                {loadingSchools ? (
                  <div className="h-[50px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center animate-pulse text-sm text-slate-400">Loading schools...</div>
                ) : (
                  <select
                    value={schoolId} onChange={e => setSchoolId(e.target.value)}
                    className="glass-input bg-dark-900 h-[50px] appearance-none"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '0 16px', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                  >
                    <option value="" style={{ color: 'black' }}>-- Skip for now --</option>
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.id} style={{ color: 'black' }}>{sch.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <button onClick={handleComplete} disabled={loading} className="btn-glow h-[52px] bg-white text-dark-950 font-bold rounded-xl mt-4 w-full flex items-center justify-center gap-2 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {loading ? 'Creating...' : <>Join as {info.label} <ArrowRight size={16} /></>}
            </button>
            
            <p className="text-center text-sm text-slate-500 mt-6 pt-4 border-t border-white/5">
              Wrong account?{' '}
              <Link to="/register" className="text-white font-bold hover:text-slate-200">Start over</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden items-center justify-center border-l border-white/5 bg-gradient-to-br from-[#0a0515] to-[#050b14]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-lg text-center p-12 glass-card rounded-[2rem] border border-white/10 shadow-2xl animate-fade-in shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
             <span className="text-3xl mt-1">👋</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4 leading-tight">Welcome to EduConnect</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">You're one click away from joining our dynamic learning platform. Set your role to unlock customized tools, courses, and resources.</p>
          
          <div className="flex flex-col gap-3">
             {['Role-based access to everything you need', 'Securely linked to your Google account', 'Join schools seamlessly'].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300 text-left bg-white/5 border border-white/5 rounded-xl p-4">
                   <CheckCircle2 size={16} className="text-blue-400" />
                   {feat}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleRoleSelect;

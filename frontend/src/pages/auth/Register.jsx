import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2, ChevronRight, School } from 'lucide-react';
import authService from '../../services/authService';
import schoolService from '../../services/schoolService';

const ROLES = ['STUDENT', 'TEACHER', 'SCHOOL', 'ADMIN'];

const ROLE_INFO = {
  STUDENT: { icon: '👨‍🎓', label: 'Student', desc: 'Join classes, submit assignments & track your progress.', color: 'from-brand-500 to-purple-600', border: 'rgba(139,92,246,0.5)' },
  TEACHER: { icon: '👨‍🏫', label: 'Teacher', desc: 'Create classes, grade assignments & manage students.', color: 'from-blue-500 to-indigo-600', border: 'rgba(59,130,246,0.5)' },
  SCHOOL:  { icon: '🏫', label: 'School Admin', desc: 'Manage your institution, teachers, and analytics.', color: 'from-emerald-500 to-teal-600', border: 'rgba(16,185,129,0.5)' },
  ADMIN:   { icon: '⚙️', label: 'Platform Admin', desc: 'System-wide control and platform monitoring.', color: 'from-orange-500 to-amber-600', border: 'rgba(245,158,11,0.5)' },
};

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const StudyBg = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#030712 0%,#050b1a 50%,#07021a 100%)' }} />
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }} />
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', schoolId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    if (['TEACHER', 'STUDENT'].includes(form.role)) {
      setLoadingSchools(true);
      schoolService.getAll()
        .then(res => setSchools(res.data))
        .catch(err => console.error('Failed to load schools', err))
        .finally(() => setLoadingSchools(false));
    }
  }, [form.role]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  
  const handleGoogle = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    window.location.href = `${base}/auth/google`; // existing logic
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email.'); return; }
    const strength = getStrength(form.password);
    if (strength < 3) { setError('Password too weak. Use uppercase, lowercase and numbers.'); return; }
    
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password, role: form.role,
        ...(form.schoolId.trim() && { schoolId: form.schoolId.trim() })
      };
      const res = await authService.register(payload);
      navigate('/verify-email', { state: { userId: res.data.id, email: form.email, name: form.name } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen flex bg-[#030712] text-white relative">
      <StudyBg />

      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10 transition-all">
        <div className="w-full max-w-[440px] mx-auto animate-fade-in">
          
          <Link to="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <span className="text-xl mt-1">📚</span>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">EduConnect</span>
          </Link>

          {/* Stepper */}
          <div className="flex gap-2 mb-8 items-center cursor-pointer" onClick={() => step === 2 && setStep(1)}>
            {[1, 2].map(s => (
              <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  background: step >= s ? 'linear-gradient(90deg,#7c3aed,#00d4ff)' : 'rgba(255,255,255,0.06)',
                  boxShadow: step >= s ? '0 0 10px rgba(124,58,237,0.4)' : 'none'
                }} />
            ))}
          </div>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-2 tracking-tight">
              {step === 1 ? 'Choose your path' : 'Create account'}
            </h1>
            <p className="text-slate-400">
              {step === 1 ? 'Select how you want to use the platform.' : 'Fill in your details to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-red-300 text-sm flex items-center gap-2 border border-red-500/20 bg-red-500/10">
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4 animate-slide-up">
              <button onClick={handleGoogle} className="btn-google mb-6 shadow-sm border border-white/10 hover:border-white/20 hover:bg-white/5 h-[52px] rounded-xl font-semibold">
                <svg width="18" height="18" viewBox="0 0 24 24" className="mr-1">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">or map your journey</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {ROLES.map(role => {
                  const info = ROLE_INFO[role];
                  const active = form.role === role;
                  return (
                    <div key={role}
                      onClick={() => setForm(f => ({ ...f, role }))}
                      className="group cursor-pointer rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${active ? info.border : 'rgba(255,255,255,0.05)'}`,
                        transform: active ? 'translateY(-2px)' : 'none',
                        boxShadow: active ? `0 10px 30px -10px ${info.border}` : 'none',
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{info.icon}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-transparent bg-white text-black' : 'border-slate-600'}`}>
                          {active && <CheckCircle2 size={14} strokeWidth={3} />}
                        </div>
                      </div>
                      <h3 className={`font-bold transition-colors ${active ? 'text-white' : 'text-slate-300'}`}>{info.label}</h3>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setStep(2)} className="btn-glow h-[52px] bg-white text-dark-950 font-bold rounded-xl mt-4 w-full flex items-center justify-center gap-2 hover:bg-slate-200">
                Continue <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-slate-400 mt-6 pt-4 border-t border-white/5">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-bold hover:text-slate-200">Sign in</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="glass-input bg-dark-900 border-dark-700 h-[50px]" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@school.com" className="glass-input bg-dark-900 border-dark-700 h-[50px]" required />
              </div>

              {['TEACHER', 'STUDENT'].includes(form.role) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select your School</label>
                  {loadingSchools ? (
                    <div className="h-[50px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center animate-pulse text-sm text-slate-400">Loading schools...</div>
                  ) : (
                    <select
                      name="schoolId" value={form.schoolId} onChange={handleChange} required
                      className="glass-input bg-dark-900 border-dark-700 h-[50px] appearance-none"
                    >
                      <option value="">-- Choose School --</option>
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.id}>{sch.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" className="glass-input bg-dark-900 border-dark-700 h-[50px] pr-12" required />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <div key={lvl} className={`flex-1 rounded-full transition-all duration-300 ${strength >= lvl ? '' : 'bg-white/10'}`}
                          style={{ background: strength >= lvl ? STRENGTH_COLORS[strength] : undefined }} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="h-[50px] px-6 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-glow h-[50px] flex-1 bg-white text-dark-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden items-center justify-center border-l border-white/5 bg-gradient-to-br from-[#0a0515] to-[#050b14]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-lg text-center p-12 glass-card rounded-[2rem] border border-white/10 shadow-2xl animate-fade-in shadow-[0_0_50px_rgba(124,58,237,0.15)]">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
             <span className="text-3xl mt-1">✨</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4 leading-tight">Your gateway to smarter learning</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">Sign up and join a platform mapped specifically to your role. Seamless collaboration for students, teachers, and admins alike.</p>
          
          <div className="flex flex-col gap-3">
             {['AI Study assistant for personalized help', 'Live synced dynamic timetables', 'Instant announcements & updates'].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300 text-left bg-white/5 border border-white/5 rounded-xl p-4">
                   <CheckCircle2 size={16} className="text-emerald-400" />
                   {feat}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

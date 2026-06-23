import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const DASH = { ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school', TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student' };

// ─── Animated Study Background ───────────────────────────────────────────────
const StudyBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none fade-in">
      {/* Deep neutral background */}
      <div className="absolute inset-0 bg-dark-950" />
      <div className="absolute inset-0 noise" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-dots opacity-20" />

      {/* Hero mesh gradients / Glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
    </div>
  );
};


// ─── Animated CSS injector ────────────────────────────────────────────────────
const AuthStyles = () => (
  <style>{`
    @keyframes floatRandom {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
      25% { transform: translateY(-18px) rotate(5deg); opacity: 0.18; }
      50% { transform: translateY(-8px) rotate(-3deg); opacity: 0.12; }
      75% { transform: translateY(-22px) rotate(8deg); opacity: 0.16; }
    }
    @keyframes drift {
      0%, 100% { transform: translateX(0px) translateY(0px); opacity: 0.05; }
      33% { transform: translateX(10px) translateY(-8px); opacity: 0.09; }
      66% { transform: translateX(-6px) translateY(5px); opacity: 0.06; }
    }
    @keyframes shoot {
      0% { transform: translateX(0) translateY(0); opacity: 0.3; }
      50% { transform: translateX(80px) translateY(-30px); opacity: 0.1; }
      100% { transform: translateX(0) translateY(0); opacity: 0.3; }
    }
    @keyframes pulseSlow {
      0%, 100% { opacity: 0.05; transform: scale(1); }
      50% { opacity: 0.1; transform: scale(1.1); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glassIn {
      from { opacity: 0; transform: scale(0.97) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-float-random { animation: floatRandom linear infinite; }
    .animate-drift { animation: drift ease-in-out infinite; }
    .animate-shoot { animation: shoot ease-in-out infinite; }
    .animate-pulse-slow { animation: pulseSlow ease-in-out infinite 4s; }
    .animate-slide-up { animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
    .animate-glass-in { animation: glassIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

    .glass-card {
      background: rgba(20, 20, 20, 0.4);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.02), 0 30px 60px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
    }
    .glass-input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255,255,255,0.1);
      color: #ffffff;
      border-radius: 10px;
      padding: 12px 16px;
      width: 100%;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    .glass-input::placeholder { color: rgba(255,255,255,0.3); font-weight: 400; }
    .glass-input:focus {
      border-color: rgba(255,255,255,0.4);
      background: rgba(0, 0, 0, 0.5);
      box-shadow: 0 0 0 4px rgba(255,255,255,0.05);
    }
    .btn-glow {
      background: #ffffff;
      color: #000000;
      font-weight: 700;
      border-radius: 10px;
      padding: 12px 20px;
      width: 100%;
      border: none;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.95rem;
      box-shadow: 0 0 20px -5px rgba(255,255,255,0.3);
    }
    .btn-glow:hover {
      transform: translateY(-1.5px);
      box-shadow: 0 0 30px -5px rgba(255,255,255,0.5);
      background: #f8f8f8;
    }
    .btn-glow:active { transform: translateY(0px); }
    .btn-glow:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    
    .btn-google {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      color: #ffffff;
      font-weight: 600;
      border-radius: 10px;
      padding: 12px 20px;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .btn-google:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.2);
    }
  `}</style>
);

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (params.get('error') === 'oauth_failed') setError('Google sign-in failed. Please try again.');
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email (e.g. name@gmail.com).'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await authService.login(form);
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      navigate(DASH[user.role] || '/dashboard/student');
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email', {
          state: {
            userId: err.response.data.userId,
            email: err.response.data.userEmail,
            name: err.response.data.userName,
          }
        });
        return;
      }
      if (err.response?.data?.accountDeactivated) { setShowReactivate(true); return; }
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await authService.reactivateAccount(form);
      setShowReactivate(false);
      const res = await authService.login(form);
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      navigate(DASH[user.role] || '/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Reactivation failed.');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Role is chosen AFTER Google OAuth for new users — existing users log straight in
    window.location.href = `${base}/auth/google`;
  };

  return (
    <>
      <AuthStyles />
      <div className="min-h-screen flex bg-[#030712] text-white">
        
        {/* LEFT PANEL: Auth Form */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10">
          <div className="w-full max-w-md mx-auto animate-glass-in">
            {/* Logo */}
            <div className="mb-10 animate-slide-up">
              <Link to="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  <span className="text-xl mt-1">📚</span>
                </div>
                <span className="text-xl font-display font-bold text-white tracking-tight">EduConnect</span>
              </Link>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-2 tracking-tight">Welcome back</h1>
              <p className="text-slate-400">Sign in to your account and continue learning.</p>
            </div>

            {/* Form Container */}
            <div className="bg-transparent" style={{ animationDelay: '0.1s' }}>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-red-300 text-sm flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Google */}
              <button onClick={handleGoogle} className="btn-google mb-6 shadow-sm border border-white/10 hover:border-white/20 hover:bg-white/5 h-12 rounded-xl">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">or sign in with email</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="name@company.com"
                    className="glass-input bg-dark-900 border-dark-700 h-12" required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 font-bold transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} placeholder="••••••••"
                      className="glass-input bg-dark-900 border-dark-700 h-12" required style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-lg">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-glow h-12 mt-4 text-base font-bold bg-white text-dark-950 hover:bg-slate-200 w-full rounded-xl">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign in to Dashboard →'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-8 pt-6 border-t border-white/5">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-white font-bold hover:text-slate-200 transition-colors">
                  Create one for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Visual Showcase */}
        <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden items-center justify-center border-l border-white/5 bg-gradient-to-br from-[#0a0515] to-[#050b14]">
           <StudyBackground />
           <div className="relative z-10 max-w-lg text-center p-12 glass-card rounded-[2rem] border border-white/10 shadow-2xl animate-slide-up shadow-[0_0_50px_rgba(124,58,237,0.15)]" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                 <span className="text-3xl mt-1">📚</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4 leading-tight">Empower your academic journey</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">Join thousands of students and educators building the future of learning on our hyper-connected intelligent platform.</p>
              
              <div className="flex items-center justify-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex -space-x-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-[#09090b] flex items-center justify-center bg-dark-800 text-xs shadow-md">
                        {['👨‍🎓','👩‍🏫','👨‍🔬','👩‍🎓'][i-1]}
                     </div>
                   ))}
                </div>
                <div className="text-sm font-medium text-slate-400 text-left leading-tight">
                  <span className="text-brand-300 font-bold block text-base leading-none">5,000+</span> 
                  <span className="text-xs">active users</span>
                </div>
              </div>
           </div>
        </div>

        {/* Reactivation Modal */}
        {showReactivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,11,26,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card rounded-2xl p-8 max-w-md w-full animate-glass-in text-center">
              <div className="text-5xl mb-4">👋</div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back!</h3>
              <p className="text-slate-400 text-sm mb-8">Your account is currently disabled. Would you like to re-activate it and continue learning?</p>
              <div className="grid grid-cols-2 gap-3">
                <button disabled={loading} onClick={() => setShowReactivate(false)}
                  className="btn-google py-3 rounded-xl font-medium">
                  Not now
                </button>
                <button disabled={loading} onClick={handleReactivate} className="btn-glow py-3">
                  {loading ? 'Working...' : 'Re-activate ✓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;

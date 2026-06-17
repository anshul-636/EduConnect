import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const DASH = { ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school', TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student' };

// ─── Animated Study Background ───────────────────────────────────────────────
const StudyBackground = () => {
  const floatingItems = [
    { icon: '📐', x: 8, y: 15, delay: 0, duration: 6 },
    { icon: '🔬', x: 85, y: 10, delay: 1, duration: 7 },
    { icon: '📚', x: 15, y: 70, delay: 2, duration: 8 },
    { icon: '✏️', x: 78, y: 65, delay: 0.5, duration: 6.5 },
    { icon: '🧮', x: 50, y: 8, delay: 1.5, duration: 7.5 },
    { icon: '🔭', x: 92, y: 45, delay: 3, duration: 9 },
    { icon: '📊', x: 5, y: 45, delay: 2.5, duration: 7 },
    { icon: '🧬', x: 65, y: 80, delay: 1, duration: 8 },
    { icon: '💡', x: 35, y: 85, delay: 0, duration: 6 },
    { icon: '🎯', x: 72, y: 20, delay: 3.5, duration: 9 },
    { icon: '📝', x: 25, y: 30, delay: 2, duration: 7 },
    { icon: '🧪', x: 55, y: 55, delay: 4, duration: 8.5 },
  ];

  const equations = [
    { text: 'E = mc²', x: 10, y: 25, delay: 0 },
    { text: 'F = ma', x: 80, y: 30, delay: 1.5 },
    { text: 'a² + b² = c²', x: 20, y: 75, delay: 3 },
    { text: '∫f(x)dx', x: 70, y: 72, delay: 2 },
    { text: 'H₂O', x: 45, y: 18, delay: 1 },
    { text: 'π ≈ 3.14', x: 88, y: 58, delay: 4 },
    { text: 'y = mx+b', x: 3, y: 55, delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050b1a] via-[#080f1e] to-[#0a0520]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-700/5 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-indigo-600/5 blur-[90px] animate-pulse-slow" style={{ animationDelay: '4s' }} />

      {/* Floating study icons */}
      {floatingItems.map((item, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-10 select-none animate-float-random"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            filter: 'grayscale(30%)',
          }}
        >
          {item.icon}
        </div>
      ))}

      {/* Floating equations */}
      {equations.map((eq, i) => (
        <div
          key={i}
          className="absolute font-mono text-sm font-bold opacity-5 select-none animate-drift"
          style={{
            left: `${eq.x}%`,
            top: `${eq.y}%`,
            color: '#a855f7',
            animationDelay: `${eq.delay}s`,
            animationDuration: '10s',
          }}
        >
          {eq.text}
        </div>
      ))}

      {/* Shooting particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand-400/30 animate-shoot"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '4s',
          }}
        />
      ))}
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
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(124, 58, 237, 0.2);
      box-shadow: 0 0 0 1px rgba(168,85,247,0.05), 0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .glass-input {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #f1f5f9;
      border-radius: 12px;
      padding: 12px 16px;
      width: 100%;
      font-size: 0.9rem;
      transition: all 0.2s;
      outline: none;
    }
    .glass-input::placeholder { color: rgba(148,163,184,0.5); }
    .glass-input:focus {
      border-color: rgba(168,85,247,0.5);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px rgba(168,85,247,0.12);
    }
    .btn-glow {
      background: linear-gradient(135deg, #7c3aed, #9333ea, #a855f7);
      color: white;
      font-weight: 600;
      border-radius: 12px;
      padding: 12px 20px;
      width: 100%;
      border: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.25s;
      font-size: 0.9rem;
      box-shadow: 0 0 24px -6px rgba(168,85,247,0.45);
    }
    .btn-glow:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 32px -4px rgba(168,85,247,0.6);
    }
    .btn-glow:active { transform: translateY(0px); }
    .btn-glow:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-google {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: #e2e8f0;
      font-weight: 500;
      border-radius: 12px;
      padding: 11px 20px;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .btn-google:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.18);
    }
    .hover-glow:hover { box-shadow: 0 0 16px -4px rgba(168,85,247,0.3); }
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
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <StudyBackground />

        <div className="relative z-10 w-full max-w-md animate-glass-in">
          {/* Logo */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 24px -4px rgba(168,85,247,0.5)' }}>
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">EduConnect</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue learning</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-7" style={{ animationDelay: '0.1s' }}>
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Google */}
            <button onClick={handleGoogle} className="btn-google mb-5 hover-glow">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <span className="text-slate-500 text-xs font-medium">or with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  className="glass-input" required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••"
                    className="glass-input" required style={{ paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-lg">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-glow mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in →'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Role hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Available for <span className="text-slate-500">Students · Teachers · Schools · Admins</span>
            </p>
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

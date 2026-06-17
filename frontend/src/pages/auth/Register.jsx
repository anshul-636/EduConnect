import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ROLES = ['STUDENT', 'TEACHER', 'SCHOOL', 'ADMIN'];
const ROLE_INFO = {
  STUDENT: { icon: '🎓', label: 'Student', desc: 'Join events & access study resources', color: 'from-brand-600 to-purple-700', accent: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)' },
  TEACHER: { icon: '📚', label: 'Teacher', desc: 'Upload resources & guide students', color: 'from-blue-600 to-indigo-700', accent: 'rgba(37,99,235,0.15)', border: 'rgba(59,130,246,0.4)' },
  SCHOOL: { icon: '🏫', label: 'School', desc: 'Manage events & your school profile', color: 'from-emerald-600 to-teal-700', accent: 'rgba(5,150,105,0.15)', border: 'rgba(16,185,129,0.4)' },
  ADMIN: { icon: '⚙️', label: 'Admin', desc: 'Manage the entire platform', color: 'from-orange-600 to-amber-600', accent: 'rgba(217,119,6,0.15)', border: 'rgba(245,158,11,0.4)' },
};

// ─── Password strength ───────────────────────────────────────────────────────
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

// ─── Animated Study Background (shared) ─────────────────────────────────────
const StudyBackground = () => {
  const items = [
    { icon: '📐', x: 8, y: 15 }, { icon: '🔬', x: 85, y: 10 }, { icon: '📚', x: 15, y: 70 },
    { icon: '✏️', x: 78, y: 65 }, { icon: '🧮', x: 50, y: 8 }, { icon: '🔭', x: 92, y: 45 },
    { icon: '📊', x: 5, y: 45 }, { icon: '🧬', x: 65, y: 80 }, { icon: '💡', x: 35, y: 85 },
    { icon: '🎯', x: 72, y: 20 }, { icon: '📝', x: 25, y: 30 }, { icon: '🧪', x: 55, y: 55 },
  ];
  const eqs = [
    { text: 'E = mc²', x: 10, y: 25 }, { text: 'F = ma', x: 80, y: 30 },
    { text: 'a²+b²=c²', x: 20, y: 75 }, { text: '∫f(x)dx', x: 70, y: 72 },
    { text: 'H₂O', x: 45, y: 18 }, { text: 'π≈3.14', x: 88, y: 58 },
    { text: 'y=mx+b', x: 3, y: 55 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050b1a] via-[#080f1e] to-[#0a0520]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#7c3aed 1px,transparent 1px),linear-gradient(90deg,#7c3aed 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-700/5 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      {items.map((item, i) => (
        <div key={i} className="absolute text-2xl opacity-[0.08] select-none animate-float-random"
          style={{ left: `${item.x}%`, top: `${item.y}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${6 + i * 0.4}s` }}>
          {item.icon}
        </div>
      ))}
      {eqs.map((eq, i) => (
        <div key={i} className="absolute font-mono text-sm font-bold opacity-[0.05] select-none animate-drift"
          style={{ left: `${eq.x}%`, top: `${eq.y}%`, color: '#a855f7', animationDelay: `${i * 0.8}s`, animationDuration: '10s' }}>
          {eq.text}
        </div>
      ))}
    </div>
  );
};

const AuthStyles = () => (
  <style>{`
    @keyframes floatRandom {
      0%,100%{transform:translateY(0px) rotate(0deg);opacity:0.08;}
      25%{transform:translateY(-18px) rotate(5deg);opacity:0.14;}
      50%{transform:translateY(-8px) rotate(-3deg);opacity:0.1;}
      75%{transform:translateY(-22px) rotate(8deg);opacity:0.13;}
    }
    @keyframes drift {
      0%,100%{transform:translateX(0)translateY(0);opacity:0.05;}
      33%{transform:translateX(10px)translateY(-8px);opacity:0.09;}
      66%{transform:translateX(-6px)translateY(5px);opacity:0.06;}
    }
    @keyframes pulseSlow {
      0%,100%{opacity:0.05;transform:scale(1);}
      50%{opacity:0.1;transform:scale(1.1);}
    }
    @keyframes glassIn {
      from{opacity:0;transform:scale(0.97) translateY(10px);}
      to{opacity:1;transform:scale(1) translateY(0);}
    }
    @keyframes slideRight {
      from{opacity:0;transform:translateX(20px);}
      to{opacity:1;transform:translateX(0);}
    }
    .animate-float-random{animation:floatRandom linear infinite;}
    .animate-drift{animation:drift ease-in-out infinite;}
    .animate-pulse-slow{animation:pulseSlow ease-in-out 4s infinite;}
    .animate-glass-in{animation:glassIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;}
    .animate-slide-right{animation:slideRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards;}
    .glass-card{
      background:rgba(15,23,42,0.75);
      backdrop-filter:blur(24px);
      -webkit-backdrop-filter:blur(24px);
      border:1px solid rgba(124,58,237,0.2);
      box-shadow:0 0 0 1px rgba(168,85,247,0.05),0 32px 64px -16px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .glass-input{
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);
      color:#f1f5f9;
      border-radius:12px;
      padding:12px 16px;
      width:100%;
      font-size:0.9rem;
      transition:all 0.2s;
      outline:none;
    }
    .glass-input::placeholder{color:rgba(148,163,184,0.5);}
    .glass-input:focus{
      border-color:rgba(168,85,247,0.5);
      background:rgba(255,255,255,0.06);
      box-shadow:0 0 0 3px rgba(168,85,247,0.12);
    }
    .btn-glow{
      background:linear-gradient(135deg,#7c3aed,#9333ea,#a855f7);
      color:white;font-weight:600;border-radius:12px;
      padding:12px 20px;width:100%;border:none;cursor:pointer;
      transition:all 0.25s;font-size:0.9rem;
      box-shadow:0 0 24px -6px rgba(168,85,247,0.45);
    }
    .btn-glow:hover{transform:translateY(-1px);box-shadow:0 0 32px -4px rgba(168,85,247,0.6);}
    .btn-glow:active{transform:translateY(0);}
    .btn-glow:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
    .btn-ghost{
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.1);
      color:#e2e8f0;font-weight:500;
      border-radius:12px;padding:11px 20px;
      width:100%;cursor:pointer;transition:all 0.2s;font-size:0.875rem;
      display:flex;align-items:center;justify-content:center;gap:10px;
    }
    .btn-ghost:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.18);}
    .role-card{
      border-radius:14px;padding:16px;text-align:left;
      cursor:pointer;transition:all 0.2s;border:1.5px solid rgba(255,255,255,0.07);
      background:rgba(255,255,255,0.03);
    }
    .role-card:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.14);}
  `}</style>
);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', schoolId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleGoogle = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Role is chosen AFTER Google OAuth for new users — existing users log straight in
    window.location.href = `${base}/auth/google`;
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
  const strengthLabel = form.password ? STRENGTH_LABELS[strength] : '';
  const strengthColor = form.password ? STRENGTH_COLORS[strength] : 'transparent';
  const info = ROLE_INFO[form.role];

  return (
    <>
      <AuthStyles />
      <div className="min-h-screen relative flex items-center justify-center p-4 py-10">
        <StudyBackground />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center"
                style={{ boxShadow: '0 0 24px -4px rgba(168,85,247,0.5)' }}>
                <span className="text-xl">🎓</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EduConnect</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Join the learning community</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 px-1">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'text-white' : 'text-slate-600'
                    }`} style={{
                      background: step >= s ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.05)',
                      border: step >= s ? 'none' : '1.5px solid rgba(255,255,255,0.08)',
                      boxShadow: step >= s ? '0 0 12px -3px rgba(168,85,247,0.6)' : 'none',
                    }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-xs font-medium ${step >= s ? 'text-slate-300' : 'text-slate-600'}`}>
                    {s === 1 ? 'Choose Role' : 'Your Details'}
                  </span>
                </div>
                {s < 2 && <div className="flex-1 h-px mx-2" style={{ background: step >= 2 ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)' }} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-7 animate-glass-in">
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* STEP 1 — Role Selection */}
            {step === 1 && (
              <div className="animate-slide-right">
                <p className="text-slate-400 text-sm font-medium mb-4">I'm joining as a...</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {ROLES.map(role => {
                    const ri = ROLE_INFO[role];
                    const selected = form.role === role;
                    return (
                      <button key={role} type="button"
                        onClick={() => setForm(p => ({ ...p, role }))}
                        className="role-card"
                        style={selected ? {
                          background: ri.accent,
                          border: `1.5px solid ${ri.border}`,
                          boxShadow: `0 0 20px -8px ${ri.border}`,
                        } : {}}>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ri.color} flex items-center justify-center mb-2.5 text-lg`}>
                          {ri.icon}
                        </div>
                        <p className="font-semibold text-white text-sm">{ri.label}</p>
                        <p className="text-slate-500 text-xs mt-0.5 leading-snug">{ri.desc}</p>
                        {selected && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <span className="text-xs text-brand-400 font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setStep(2)} className="btn-glow mb-4">
                  Continue as {info.label} →
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span className="text-slate-600 text-xs">or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                <button onClick={handleGoogle} className="btn-ghost">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            )}

            {/* STEP 2 — Details */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-slide-right">
                {/* Selected role badge */}
                <div className="flex items-center justify-between mb-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    ← Change role
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: info.accent, border: `1px solid ${info.border}`, color: '#e2e8f0' }}>
                    <span>{info.icon}</span> {info.label}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="glass-input" placeholder="Your full name" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="glass-input" placeholder="you@example.com" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} className="glass-input" placeholder="Min. 8 characters"
                      required minLength={8} style={{ paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-lg">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2.5">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4, 5].map(l => (
                          <div key={l} className="flex-1 rounded-full transition-all duration-300"
                            style={{ background: l <= strength ? strengthColor : 'rgba(255,255,255,0.07)' }} />
                        ))}
                      </div>
                      <p className="text-xs mt-1.5 font-medium" style={{ color: strengthColor }}>
                        {strengthLabel}
                        {strength < 3 && <span className="text-slate-500 font-normal ml-1">— add uppercase, numbers</span>}
                      </p>
                    </div>
                  )}
                </div>

                {['TEACHER', 'STUDENT'].includes(form.role) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      School ID <span className="normal-case font-normal text-slate-600">(optional)</span>
                    </label>
                    <input name="schoolId" value={form.schoolId} onChange={handleChange}
                      className="glass-input" placeholder="School UUID to auto-join" />
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-glow mt-1">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create account →'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;

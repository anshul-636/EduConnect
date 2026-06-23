import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

/* ── Shared study background (kept light so it doesn't slow the page) ──── */
const StudyBg = () => (
  <>
    <style>{`
      @keyframes fp-float {
        0%,100%{transform:translateY(0) rotate(0deg);opacity:0.07;}
        50%{transform:translateY(-16px) rotate(5deg);opacity:0.13;}
      }
      @keyframes fp-glow {
        0%,100%{opacity:0.06;transform:scale(1);}
        50%{opacity:0.14;transform:scale(1.08);}
      }
    `}</style>
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#030712 0%,#050b1a 50%,#07021a 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', animation: 'fp-glow 8s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)', animation: 'fp-glow 10s ease-in-out infinite 4s' }} />
      {['📐','🔬','📚','✏️','🧮','💡'].map((ic, i) => (
        <div key={i} className="absolute text-2xl select-none"
          style={{ left: `${[8,85,15,78,92,5][i]}%`, top: `${[15,12,70,65,45,50][i]}%`, animation: `fp-float ${10 + i}s ease-in-out infinite ${i * 1.2}s` }}>
          {ic}
        </div>
      ))}
    </div>
  </>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('OTP sent! Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async e => {
    e.preventDefault(); setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] text-white relative">
      <StudyBg />

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10">
        <div className="w-full max-w-md mx-auto" style={{ animation: 'slideUp 0.45s cubic-bezier(.16,1,.3,1) forwards' }}>

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
              <GraduationCap size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">EduConnect</span>
          </Link>

          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ background: step >= s ? 'linear-gradient(90deg,#7c3aed,#6366f1)' : 'rgba(255,255,255,0.07)', boxShadow: step >= s ? '0 0 8px rgba(124,58,237,0.4)' : 'none' }} />
            ))}
          </div>

          {/* Heading */}
          {step === 1 ? (
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <Mail size={22} className="text-brand-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Forgot password?</h1>
              <p className="text-slate-400">Enter your email and we'll send you a one-time code.</p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <KeyRound size={22} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Reset password</h1>
              <p className="text-slate-400">Code sent to <span className="text-brand-300 font-semibold">{email}</span></p>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-red-300 text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl text-emerald-300 text-sm flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="glass-input bg-dark-900 border-dark-700 h-12" required
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px 16px', width: '100%', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}>
                {loading ? 'Sending...' : <><span>Send OTP</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {[
                { label: '6-digit OTP', val: otp, set: v => setOtp(v.replace(/\D/g, '').slice(0, 6)), type: 'text', ph: '000000', extra: { textAlign: 'center', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.4em' } },
                { label: 'New password', val: newPassword, set: v => setNewPassword(v), type: 'password', ph: '••••••••' },
                { label: 'Confirm password', val: confirmPassword, set: v => setConfirmPassword(v), type: 'password', ph: '••••••••' },
              ].map(({ label, val, set, type, ph, extra }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                  <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    style={{ ...extra, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px 16px', width: '100%', outline: 'none', fontSize: '0.95rem' }} required />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}>
                {loading ? 'Resetting...' : <><Lock size={15} /><span>Reset Password</span></>}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-8 pt-6 border-t border-white/5">
            Remember your password?{' '}
            <Link to="/login" className="text-white font-bold hover:text-slate-200 transition-colors">Back to Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden items-center justify-center border-l border-white/5" style={{ background: 'linear-gradient(135deg,#0a0515,#050b14)' }}>
        <div className="relative z-10 text-center p-12 max-w-sm">
          <div className="text-7xl mb-6" style={{ animation: 'fp-float 6s ease-in-out infinite' }}>🔐</div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">Secure password recovery</h2>
          <p className="text-slate-400 leading-relaxed">We use OTP verification to ensure only you can reset your account credentials. Your security is our priority.</p>
          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> End-to-end encrypted</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> OTP expires in 15 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

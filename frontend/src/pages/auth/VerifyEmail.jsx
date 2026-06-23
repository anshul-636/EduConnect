import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ArrowRight, Mail, KeyRound, Lock, CheckCircle2, RefreshCcw } from 'lucide-react';
import api from '../../services/api';

/* ── Shared study background (kept light) ──── */
const StudyBg = () => (
  <>
    <style>{`
      @keyframes ve-float {
        0%,100%{transform:translateY(0) rotate(0deg);opacity:0.07;}
        50%{transform:translateY(-16px) rotate(5deg);opacity:0.13;}
      }
      @keyframes ve-glow {
        0%,100%{opacity:0.06;transform:scale(1);}
        50%{opacity:0.14;transform:scale(1.08);}
      }
    `}</style>
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#030712 0%,#050b1a 50%,#07021a 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)', animation: 've-glow 8s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)', animation: 've-glow 10s ease-in-out infinite 4s' }} />
      {['📐','🔬','📚','✏️','🧮','💡'].map((ic, i) => (
        <div key={i} className="absolute text-2xl select-none"
          style={{ left: `${[8,85,15,78,92,5][i]}%`, top: `${[15,12,70,65,45,50][i]}%`, animation: `ve-float ${10 + i}s ease-in-out infinite ${i * 1.2}s` }}>
          {ic}
        </div>
      ))}
    </div>
  </>
);

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, name } = location.state || {};
  
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!userId) { navigate('/register'); return; }
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [userId, navigate]);

  const handleDigit = (i, val) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const otp = digits.join('');

  const handleVerify = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-email', { userId, otp });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true); setError('');
    try {
      await api.post('/auth/resend-otp', { userId });
      setSuccess('New OTP sent to your email!');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] text-white relative">
      <StudyBg />

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10">
        <div className="w-full max-w-md mx-auto" style={{ animation: 'slideUp 0.45s cubic-bezier(.16,1,.3,1) forwards' }}>

          <Link to="/" className="inline-flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#0ea5e9)', boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}>
              <GraduationCap size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">EduConnect</span>
          </Link>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Mail size={22} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Check your email</h1>
            <p className="text-slate-400">We've sent a verification code to <span className="font-semibold text-white">{email}</span></p>
          </div>

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

          <form onSubmit={handleVerify} className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Enter 6-digit code</label>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  style={{
                     width: '50px', height: '60px',
                     background: d ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.3)',
                     border: d ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                     color: '#fff', borderRadius: 12, textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', outline: 'none', transition: 'all 0.2s',
                     caretColor: 'transparent',
                     boxShadow: d ? '0 0 15px rgba(16,185,129,0.1)' : 'none'
                  }}
                  onFocus={e => {
                     e.target.style.borderColor = 'rgba(16,185,129,0.8)';
                     e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)';
                  }}
                  onBlur={e => {
                     e.target.style.borderColor = d ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)';
                     e.target.style.boxShadow = d ? '0 0 15px rgba(16,185,129,0.1)' : 'none';
                  }}
                />
              ))}
            </div>
            
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                   <RefreshCcw size={16} className="animate-spin" /> Verifying...
                </span>
              ) : <><span>Verify Email</span> <CheckCircle2 size={18} /></>}
            </button>
          </form>

          <div className="text-center mt-6">
            {countdown > 0 ? (
               <p className="text-sm text-slate-500 font-medium">Wait <span className="text-emerald-400 tabular-nums">{countdown}s</span> to send again</p>
            ) : (
               <button onClick={handleResend} disabled={resending} className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  {resending ? 'Sending...' : "Didn't receive code? Resend"}
               </button>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8 pt-6 border-t border-white/5">
            Wrong email address?{' '}
            <Link to="/register" className="text-white font-bold hover:text-slate-200 transition-colors">Start over</Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden items-center justify-center border-l border-white/5" style={{ background: 'linear-gradient(135deg,#050f1a,#030812)' }}>
        <div className="relative z-10 text-center p-12 max-w-sm">
          <div className="text-7xl mb-6 relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]" style={{ animation: 've-float 6s ease-in-out infinite' }}>
             🚀
          </div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">Almost there!</h2>
          <p className="text-slate-400 leading-relaxed">Verifying your email ensures that you can securely recover your account and receive important platform updates.</p>
          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Account security</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

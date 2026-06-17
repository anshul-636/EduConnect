import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const StudyBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-[#050b1a] via-[#080f1e] to-[#0a0520]" />
    <div className="absolute inset-0 opacity-[0.03]"
      style={{ backgroundImage: 'linear-gradient(#7c3aed 1px,transparent 1px),linear-gradient(90deg,#7c3aed 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-[100px]" style={{ animation: 'pulseSlow 4s ease-in-out infinite' }} />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-700/5 blur-[80px]" style={{ animation: 'pulseSlow 4s ease-in-out infinite 2s' }} />
  </div>
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
  }, []);

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
    <>
      <style>{`
        @keyframes pulseSlow{0%,100%{opacity:0.05;transform:scale(1);}50%{opacity:0.1;transform:scale(1.1);}}
        @keyframes glassIn{from{opacity:0;transform:scale(0.97)translateY(10px);}to{opacity:1;transform:scale(1)translateY(0);}}
        @keyframes bounceIn{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.15);}80%{transform:scale(0.95);}100%{transform:scale(1);opacity:1;}}
        .glass-card{background:rgba(15,23,42,0.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(124,58,237,0.2);box-shadow:0 0 0 1px rgba(168,85,247,0.05),0 32px 64px -16px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04);}
        .animate-glass-in{animation:glassIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;}
        .otp-box{
          width:52px;height:60px;border-radius:14px;
          background:rgba(255,255,255,0.04);
          border:1.5px solid rgba(255,255,255,0.1);
          color:#f1f5f9;font-size:1.75rem;font-weight:700;
          text-align:center;outline:none;transition:all 0.2s;
          caret-color:transparent;
        }
        .otp-box:focus{border-color:rgba(168,85,247,0.6);background:rgba(168,85,247,0.08);box-shadow:0 0 0 3px rgba(168,85,247,0.15);}
        .otp-box.filled{border-color:rgba(168,85,247,0.4);background:rgba(168,85,247,0.06);}
        .btn-glow{background:linear-gradient(135deg,#7c3aed,#9333ea,#a855f7);color:white;font-weight:600;border-radius:12px;padding:14px 20px;width:100%;border:none;cursor:pointer;transition:all 0.25s;font-size:0.9rem;box-shadow:0 0 24px -6px rgba(168,85,247,0.45);}
        .btn-glow:hover{transform:translateY(-1px);box-shadow:0 0 32px -4px rgba(168,85,247,0.6);}
        .btn-glow:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .icon-bounce{animation:bounceIn 0.6s cubic-bezier(0.16,1,0.3,1) both;}
      `}</style>

      <div className="min-h-screen relative flex items-center justify-center p-4">
        <StudyBackground />

        <div className="relative z-10 w-full max-w-md animate-glass-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center"
                style={{ boxShadow: '0 0 24px -4px rgba(168,85,247,0.5)' }}>
                <span className="text-xl">🎓</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EduConnect</span>
            </div>
            <div className="text-5xl mb-4 icon-bounce">📧</div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
            <p className="text-slate-400 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-brand-400 font-semibold mt-1">{email || 'your email'}</p>
          </div>

          <div className="glass-card rounded-2xl p-7">
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl text-emerald-400 text-sm flex items-center gap-2"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span>✅</span> {success}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Enter 6-digit code</p>

              {/* OTP boxes */}
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className={`otp-box ${d ? 'filled' : ''}`}
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="btn-glow">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Email ✓'}
              </button>
            </form>

            <div className="mt-5 text-center">
              {countdown > 0 ? (
                <p className="text-slate-600 text-sm">
                  Resend code in <span className="text-brand-400 font-semibold tabular-nums">{countdown}s</span>
                </p>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  className="text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors">
                  {resending ? 'Sending...' : "Didn't receive it? Resend →"}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-slate-600 mt-4">
              Check your spam folder if you don't see it.
            </p>
          </div>

          <p className="text-center text-sm text-slate-600 mt-5">
            Wrong email?{' '}
            <a href="/register" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Start over
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;

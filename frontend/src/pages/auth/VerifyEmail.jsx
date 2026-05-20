import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, name } = location.state || {};
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!userId) { navigate('/register'); return; }
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-email', { userId, otp });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true); setError('');
    try {
      await api.post('/auth/resend-otp', { userId });
      setSuccess('New OTP sent to your email!');
      setCountdown(60);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.');
    } finally { setResending(false); }
  };

  return (
    <div className='min-h-screen bg-dark-950 flex items-center justify-center p-6'>
      <div className='w-full max-w-md animate-fade-in'>
        <div className='text-center mb-8'>
          <div className='text-5xl mb-4'>📧</div>
          <h1 className='font-display font-bold text-3xl text-dark-50 mb-2'>Verify Your Email</h1>
          <p className='text-dark-400'>We sent a 6-digit OTP to</p>
          <p className='text-brand-400 font-medium mt-1'>{email}</p>
        </div>

        <div className='card'>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          {success && <div className='mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm'>{success}</div>}

          <form onSubmit={handleVerify} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-dark-300 mb-1.5'>Enter 6-digit OTP</label>
              <input
                type='text'
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/D/g, '').slice(0, 6))}
                placeholder='000000'
                className='input text-center text-2xl tracking-widest font-bold'
                maxLength={6}
                required
              />
            </div>
            <button type='submit' disabled={loading || otp.length !== 6} className='btn-primary'>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className='mt-4 text-center'>
            {countdown > 0 ? (
              <p className='text-dark-500 text-sm'>Resend OTP in <span className='text-brand-400 font-medium'>{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className='text-brand-400 hover:text-brand-300 text-sm font-medium'>
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerifyEmail;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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
      setSuccess('OTP sent to your email!');
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
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className='min-h-screen bg-dark-950 flex'>
      <div className='hidden lg:flex w-1/2 bg-gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='absolute rounded-full border border-white/30'
              style={{ width: (i+1)*120+'px', height: (i+1)*120+'px', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className='relative text-center text-white'>
          <div className='text-6xl mb-6 animate-float'>🔐</div>
          <h1 className='font-display font-bold text-4xl mb-4'>EduConnect</h1>
          <p className='text-white/80 text-lg max-w-xs'>Reset your password securely with OTP verification.</p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md animate-fade-in'>
          <div className='flex gap-2 mb-8'>
            {[1,2].map(s => (
              <div key={s} className={'flex-1 h-1 rounded-full ' + (step >= s ? 'bg-brand-500' : 'bg-dark-800')} />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className='mb-8'>
                <h2 className='font-display font-bold text-3xl text-dark-50 mb-2'>Forgot Password</h2>
                <p className='text-dark-400'>Enter your email to receive a reset OTP.</p>
              </div>
              {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
              <form onSubmit={handleSendOTP} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-dark-300 mb-1.5'>Email address</label>
                  <input type='email' value={email} onChange={e => setEmail(e.target.value)}
                    placeholder='you@example.com' className='input' required />
                </div>
                <button type='submit' disabled={loading} className='btn-primary'>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className='mb-8'>
                <h2 className='font-display font-bold text-3xl text-dark-50 mb-2'>Reset Password</h2>
                <p className='text-dark-400'>Enter the OTP sent to <span className='text-brand-400'>{email}</span></p>
              </div>
              {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
              {success && <div className='mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm'>{success}</div>}
              <form onSubmit={handleResetPassword} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-dark-300 mb-1.5'>6-digit OTP</label>
                  <input type='text' value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder='000000' className='input text-center text-2xl tracking-widest font-bold' maxLength={6} required />
                </div>
                <div>
                  <label className='block text-sm font-medium text-dark-300 mb-1.5'>New Password</label>
                  <input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder='••••••••' className='input' required minLength={8} />
                </div>
                <div>
                  <label className='block text-sm font-medium text-dark-300 mb-1.5'>Confirm Password</label>
                  <input type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder='••••••••' className='input' required minLength={8} />
                </div>
                <button type='submit' disabled={loading} className='btn-primary'>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className='text-center text-sm text-dark-500 mt-6'>
            Remember your password?{' '}
            <Link to='/login' className='text-brand-400 font-medium hover:text-brand-300'>Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;

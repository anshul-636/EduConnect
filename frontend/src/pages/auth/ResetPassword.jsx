import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';

const PasswordStrengthMeter = ({ password }) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  const getStrengthLabel = () => {
    switch(strength) {
      case 0: return 'Very Weak';
      case 1: case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  const getColor = () => {
    if (strength === 0) return 'bg-dark-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength >= 4) return 'bg-green-500';
  };

  return (
    <div className='mt-2'>
      <div className='flex gap-1 h-1.5 mb-1'>
        {[1, 2, 3, 4, 5].map(level => (
          <div key={level} className={`flex-1 rounded-full ${level <= strength ? getColor() : 'bg-dark-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength >= 4 ? 'text-green-400' : 'text-dark-400'}`}>
        {password ? `Password strength: ${getStrengthLabel()}` : 'Use 8+ chars, mix of cases, numbers & symbols'}
      </p>
    </div>
  );
};

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      setMessage(res.message || 'Password updated successfully. You can now login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-dark-950 flex'>
      <div className='hidden lg:flex w-1/2 bg-gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='absolute rounded-full border border-white/30'
              style={{ width: (i+1)*120 + 'px', height: (i+1)*120 + 'px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className='relative text-center text-white'>
          <div className='text-6xl mb-6 animate-float'>🎓</div>
          <h1 className='font-display font-bold text-4xl mb-4'>EduConnect</h1>
          <p className='text-white/80 text-lg max-w-xs'>
            Connecting schools, empowering students, building the future of education.
          </p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md animate-fade-in'>
          <div className='mb-8'>
            <h2 className='font-display font-bold text-3xl text-dark-50 mb-2'>Reset Password</h2>
            <p className='text-dark-400'>Enter your new password below.</p>
          </div>

          {error && (
            <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>
              {error}
            </div>
          )}
          {message && (
            <div className='mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm'>
              {message}
            </div>
          )}

          {!token ? (
            <div className='text-center mt-6'>
              <Link to='/forgot-password' className='btn-primary inline-block'>Request new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-dark-300 mb-1.5'>New Password</label>
                <input type='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••' className='input' required />
                <PasswordStrengthMeter password={password} />
              </div>
              <div>
                <label className='block text-sm font-medium text-dark-300 mb-1.5'>Confirm Password</label>
                <input type='password' name='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='••••••••' className='input' required />
              </div>
              <button type='submit' disabled={loading} className='btn-primary mt-4'>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          <p className='text-center text-sm text-dark-500 mt-6'>
            <Link to='/login' className='text-brand-400 font-medium hover:text-brand-300'>Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const DASH = { ADMIN:'/dashboard/admin', SCHOOL:'/dashboard/school', TEACHER:'/dashboard/teacher', STUDENT:'/dashboard/student' };

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('error') === 'oauth_failed') setError('Google sign-in failed. Please try again.');
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
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
        navigate('/verify-email', { state: {
          userId: err.response.data.userId,
          email: err.response.data.userEmail,
          name: err.response.data.userName,
        }});
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => { window.location.href = 'http://localhost:3000/api/v1/auth/google'; };

  return (
    <div className='min-h-screen bg-dark-950 flex'>
      <div className='hidden lg:flex w-1/2 bg-gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20'>
          {[...Array(6)].map((_,i) => (
            <div key={i} className='absolute rounded-full border border-white/30'
              style={{ width:(i+1)*120+'px', height:(i+1)*120+'px', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className='relative text-center text-white'>
          <div className='text-6xl mb-6 animate-float'>🎓</div>
          <h1 className='font-display font-bold text-4xl mb-4'>EduConnect</h1>
          <p className='text-white/80 text-lg max-w-xs'>Connecting schools, empowering students, building the future of education.</p>
          <div className='flex gap-6 justify-center mt-10'>
            {[['500+','Students'],['50+','Schools'],['200+','Events']].map(([n,l]) => (
              <div key={l} className='text-center'><p className='font-display font-bold text-2xl'>{n}</p><p className='text-white/70 text-sm'>{l}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md animate-fade-in'>
          <div className='mb-8'>
            <h2 className='font-display font-bold text-3xl text-dark-50 mb-2'>Welcome back</h2>
            <p className='text-dark-400'>Sign in to continue to EduConnect</p>
          </div>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          <button onClick={handleGoogle} className='w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 font-medium hover:bg-dark-700 mb-6'>
            <svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/><path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/><path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/><path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/></svg>
            Continue with Google
          </button>
          <div className='flex items-center gap-3 mb-6'><div className='flex-1 h-px bg-dark-800'/><span className='text-dark-500 text-xs'>or sign in with email</span><div className='flex-1 h-px bg-dark-800'/></div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-dark-300 mb-1.5'>Email address</label>
              <input type='email' name='email' value={form.email} onChange={handleChange} placeholder='you@example.com' className='input' required />
            </div>
            <div>
              <div className='flex items-center justify-between mb-1.5'>
                <label className='block text-sm font-medium text-dark-300'>Password</label>
                <Link to='/forgot-password' className='text-sm font-medium text-brand-400 hover:text-brand-300'>Forgot password?</Link>
              </div>
              <input type='password' name='password' value={form.password} onChange={handleChange} placeholder='••••••••' className='input' required />
            </div>
            <button type='submit' disabled={loading} className='btn-primary mt-2'>{loading?'Signing in...':'Sign in'}</button>
          </form>
          <p className='text-center text-sm text-dark-500 mt-6'>Don not have an account?{' '}<Link to='/register' className='text-brand-400 font-medium hover:text-brand-300'>Create one</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;

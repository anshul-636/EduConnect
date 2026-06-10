import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ROLES = ['STUDENT','TEACHER','SCHOOL','ADMIN'];
const ROLE_INFO = {
  STUDENT: { icon: '🎓', desc: 'Join events and access resources' },
  TEACHER: { icon: '📚', desc: 'Upload resources and guide students' },
  SCHOOL: { icon: '🏫', desc: 'Manage events and your school profile' },
  ADMIN: { icon: '⚙️', desc: 'Manage the entire platform' },
};

const PasswordStrengthMeter = ({ password }) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  const label = ['','Very Weak','Weak','Fair','Good','Strong'][strength] || '';
  const color = strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className='mt-2'>
      <div className='flex gap-1 h-1.5 mb-1'>
        {[1,2,3,4,5].map(l => <div key={l} className={'flex-1 rounded-full ' + (l <= strength ? color : 'bg-dark-700')} />)}
      </div>
      <p className={'text-xs ' + (strength >= 4 ? 'text-green-400' : 'text-dark-400')}>
        {password ? 'Strength: ' + label : 'Use 8+ chars, uppercase, lowercase, numbers'}
      </p>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'STUDENT', schoolId:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleGoogle = () => { 
    window.location.href = `http://localhost:3000/api/v1/auth/google?role=${form.role}`; 
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email (e.g. name@gmail.com).'); return; }

    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[a-z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (strength < 3) { setError('Password too weak. Use uppercase, lowercase and numbers.'); return; }

    setLoading(true);
    try {
      const payload = { name:form.name, email:form.email, password:form.password, role:form.role,
        ...(form.schoolId.trim() && { schoolId:form.schoolId.trim() }) };
      const res = await authService.register(payload);
      navigate('/verify-email', { state: { userId: res.data.id, email: form.email, name: form.name } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className='min-h-screen bg-dark-950 flex items-center justify-center p-6'>
      <div className='w-full max-w-lg animate-fade-in'>
        <div className='text-center mb-8'>
          <div className='text-4xl mb-3'>🎓</div>
          <h1 className='font-display font-bold text-3xl text-dark-50 mb-2'>Join EduConnect</h1>
          <p className='text-dark-400'>Create your account in seconds</p>
        </div>
        <div className='flex items-center gap-2 mb-8'>
          {[1,2].map(s => <div key={s} className={'flex-1 h-1 rounded-full ' + (step >= s ? 'bg-brand-500' : 'bg-dark-800')} />)}
        </div>
        <div className='card'>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          {step === 1 && (
            <div className='space-y-4 animate-fade-in'>
              <h2 className='font-display font-semibold text-dark-100 mb-4'>I am a...</h2>
              <div className='grid grid-cols-2 gap-3'>
                {ROLES.map(role => (
                  <button key={role} type='button' onClick={() => setForm(p => ({ ...p, role }))}
                    className={'p-4 rounded-xl border-2 text-left transition-all ' + (form.role===role?'border-brand-500 bg-brand-500/10':'border-dark-700 bg-dark-800 hover:border-dark-600')}>
                    <div className='text-2xl mb-1'>{ROLE_INFO[role].icon}</div>
                    <p className='font-semibold text-dark-100 text-sm'>{role.charAt(0)+role.slice(1).toLowerCase()}</p>
                    <p className='text-dark-500 text-xs mt-0.5'>{ROLE_INFO[role].desc}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className='btn-primary mt-2'>Continue →</button>
              <div className='flex items-center gap-3'><div className='flex-1 h-px bg-dark-800'/><span className='text-dark-500 text-xs'>or</span><div className='flex-1 h-px bg-dark-800'/></div>
              <button onClick={handleGoogle} className='w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 font-medium hover:bg-dark-700'>
                <svg width='18' height='18' viewBox='0 0 24 24'><path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/><path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/><path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/><path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/></svg>
                Sign up with Google
              </button>
            </div>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit} className='space-y-4 animate-fade-in'>
              <div className='flex items-center gap-2 mb-4'>
                <button type='button' onClick={() => setStep(1)} className='text-dark-400 hover:text-dark-100 text-sm'>← Back</button>
                <span className='text-dark-500'>|</span>
                <span className='text-sm text-dark-300'>{ROLE_INFO[form.role].icon} {form.role.charAt(0)+form.role.slice(1).toLowerCase()}</span>
              </div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Full name</label><input name='name' value={form.name} onChange={handleChange} className='input' placeholder='Your name' required /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Email address</label><input type='email' name='email' value={form.email} onChange={handleChange} className='input' placeholder='you@example.com' required /></div>
              <div>
                <label className='block text-sm font-medium text-dark-300 mb-1.5'>Password</label>
                <input type='password' name='password' value={form.password} onChange={handleChange} className='input' placeholder='••••••••' required minLength={8} />
                <PasswordStrengthMeter password={form.password} />
              </div>
              {['TEACHER','STUDENT'].includes(form.role) && (
                <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>School ID <span className='text-dark-500 font-normal'>(optional)</span></label><input name='schoolId' value={form.schoolId} onChange={handleChange} className='input' placeholder='School UUID' /></div>
              )}
              <button type='submit' disabled={loading} className='btn-primary'>{loading?'Creating account...':'Create account'}</button>
            </form>
          )}
        </div>
        <p className='text-center text-sm text-dark-500 mt-6'>Already have an account? <Link to='/login' className='text-brand-400 font-medium hover:text-brand-300'>Sign in</Link></p>
      </div>
    </div>
  );
};
export default Register;

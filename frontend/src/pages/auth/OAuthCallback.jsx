import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const DASH = {
  ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school',
  TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student',
};

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userStr = params.get('user');
    const error = params.get('error');

    if (error || !accessToken) {
      navigate('/login?error=oauth_failed');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      setAuth(user, accessToken, refreshToken);
      navigate(DASH[user.role] || '/dashboard/student');
    } catch {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className='min-h-screen bg-dark-950 flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-10 h-10 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin mx-auto mb-4' />
        <p className='text-dark-400 text-sm'>Signing you in...</p>
      </div>
    </div>
  );
};
export default OAuthCallback;

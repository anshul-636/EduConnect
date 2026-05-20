import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const DASH = { ADMIN:'/dashboard/admin', SCHOOL:'/dashboard/school', TEACHER:'/dashboard/teacher', STUDENT:'/dashboard/student' };

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <div className='min-h-screen bg-dark-950 flex items-center justify-center px-4'>
      <div className='text-center max-w-sm'>
        <p className='text-5xl mb-4'>🚫</p>
        <h1 className='font-display font-bold text-2xl text-dark-50 mb-2'>Access Denied</h1>
        <p className='text-dark-400 text-sm mb-6'>You do not have permission to view this page.</p>
        <button onClick={() => navigate(user ? DASH[user.role] : '/login')}
          className='px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-xl hover:opacity-90 shadow-glow'>
          Go back
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;

import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const roleGradient = {
  ADMIN: 'from-red-500 to-orange-500',
  SCHOOL: 'from-purple-500 to-pink-500',
  TEACHER: 'from-green-500 to-cyan-500',
  STUDENT: 'from-brand-500 to-cyan-500',
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const DASH = {
    ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school',
    TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student',
  };

  return (
    <nav className='bg-dark-900 border-b border-dark-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50'>
      <div className='flex items-center gap-6'>
        <Link to={user ? DASH[user?.role] : '/'} className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-xs'>E</div>
          <span className='font-display font-bold text-dark-50'>EduConnect</span>
        </Link>
        {user && (
          <div className='flex items-center gap-1'>
            {[['Schools','/schools'],['Events','/events'],['Resources','/resources'],['Leaderboard','/leaderboard'],['Forum','/forum']].map(([label,to]) => (
              <Link key={to} to={to} className='text-dark-400 hover:text-dark-100 text-sm px-3 py-1.5 rounded-lg hover:bg-dark-800 transition-all duration-150'>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {user ? (
        <div className='flex items-center gap-3'>
          <div className={'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm ' + (roleGradient[user.role] || 'from-brand-500 to-cyan-500')}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className='text-dark-500 hover:text-red-400 text-sm transition-colors'>Logout</button>
        </div>
      ) : (
        <div className='flex gap-3'>
          <Link to='/login' className='text-sm font-medium text-brand-400 hover:text-brand-300'>Login</Link>
          <Link to='/register' className='text-sm font-medium text-dark-400 hover:text-dark-100'>Register</Link>
        </div>
      )}
    </nav>
  );
};
export default Navbar;

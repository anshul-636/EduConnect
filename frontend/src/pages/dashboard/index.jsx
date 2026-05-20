import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import useAuthStore from '../../store/authStore';

const StatCard = ({ icon, label, value, gradient }) => (
  <div className={'rounded-2xl p-5 text-white bg-gradient-to-br ' + gradient}>
    <div className='text-2xl mb-3'>{icon}</div>
    <p className='text-white/70 text-xs font-medium uppercase tracking-wide'>{label}</p>
    <p className='font-display font-bold text-2xl mt-1'>{value}</p>
  </div>
);

const NavCard = ({ icon, label, desc, to, gradient }) => (
  <Link to={to} className='card-hover group'>
    <div className={'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl mb-4 ' + gradient}>{icon}</div>
    <h3 className='font-semibold text-dark-100 group-hover:text-brand-400 transition-colors'>{label}</h3>
    <p className='text-dark-500 text-sm mt-1'>{desc}</p>
  </Link>
);

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  return (
    <Layout>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='font-display font-bold text-2xl text-dark-50'>Welcome back, {user?.name} 👋</h1>
          <p className='text-dark-400 mt-1'>Here is what is happening on EduConnect today.</p>
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <StatCard icon='📅' label='Events' value='Browse' gradient='from-brand-600 to-purple-600' />
          <StatCard icon='📚' label='Resources' value='Learn' gradient='from-pink-600 to-rose-600' />
          <StatCard icon='🏆' label='Leaderboard' value='Compete' gradient='from-amber-500 to-orange-600' />
          <StatCard icon='🤖' label='AI Tools' value='3 Active' gradient='from-green-600 to-teal-600' />
        </div>
        <h2 className='font-display font-semibold text-dark-200 mb-4 text-sm uppercase tracking-wide'>Platform</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          <NavCard icon='🏫' label='Browse Schools' desc='Discover schools on the platform' to='/schools' gradient='from-brand-500 to-purple-600' />
          <NavCard icon='📅' label='Browse Events' desc='Find events to participate in' to='/events' gradient='from-pink-500 to-rose-600' />
          <NavCard icon='📚' label='Resource Library' desc='Access study materials' to='/resources' gradient='from-cyan-500 to-blue-600' />
          <NavCard icon='🏆' label='Leaderboard' desc='See top performers' to='/leaderboard' gradient='from-amber-500 to-orange-600' />
          <NavCard icon='🏅' label='My Certificates' desc='Download your achievements' to='/certificates' gradient='from-green-500 to-teal-600' />
          <NavCard icon='💬' label='Forum' desc='Discuss and collaborate' to='/forum' gradient='from-purple-500 to-indigo-600' />
        </div>
        <h2 className='font-display font-semibold text-dark-200 mb-4 text-sm uppercase tracking-wide'>AI Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <NavCard icon='🤖' label='Study Assistant' desc='Ask questions from PDFs using RAG' to='/ai/study' gradient='from-violet-500 to-purple-600' />
          <NavCard icon='📅' label='Study Planner' desc='AI-generated personalized plan' to='/ai/planner' gradient='from-fuchsia-500 to-pink-600' />
          <NavCard icon='💡' label='Platform Bot' desc='Ask anything about EduConnect' to='/ai/bot' gradient='from-rose-500 to-orange-600' />
        </div>
      </div>
    </Layout>
  );
};

export const TeacherDashboard = () => {
  const { user } = useAuthStore();
  return (
    <Layout>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='font-display font-bold text-2xl text-dark-50'>Teacher Panel</h1>
          <p className='text-dark-400 mt-1'>Hello, {user?.name}.</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <NavCard icon='📤' label='Upload Resource' desc='Share study material' to='/resources/upload' gradient='from-brand-500 to-purple-600' />
          <NavCard icon='📚' label='Resource Library' desc='Browse all resources' to='/resources' gradient='from-cyan-500 to-blue-600' />
          <NavCard icon='📅' label='Browse Events' desc='View upcoming events' to='/events' gradient='from-pink-500 to-rose-600' />
          <NavCard icon='🏫' label='Schools' desc='Browse schools' to='/schools' gradient='from-green-500 to-teal-600' />
          <NavCard icon='💬' label='Forum' desc='Discuss with students' to='/forum' gradient='from-purple-500 to-indigo-600' />
          <NavCard icon='🤖' label='Study Assistant' desc='AI-powered study help' to='/ai/study' gradient='from-violet-500 to-purple-600' />
        </div>
      </div>
    </Layout>
  );
};

export const SchoolDashboard = () => (
  <Layout>
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='font-display font-bold text-2xl text-dark-50'>School Dashboard</h1>
        <p className='text-dark-400 mt-1'>Manage your school, events and resources.</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <NavCard icon='⚙️' label='Manage School' desc='Update your school profile' to='/dashboard/school/manage' gradient='from-brand-500 to-purple-600' />
        <NavCard icon='➕' label='Create Event' desc='Post a new inter-school event' to='/events/create' gradient='from-pink-500 to-rose-600' />
        <NavCard icon='📅' label='Browse Events' desc='View all events' to='/events' gradient='from-cyan-500 to-blue-600' />
        <NavCard icon='📤' label='Upload Resource' desc='Share study material' to='/resources/upload' gradient='from-amber-500 to-orange-600' />
        <NavCard icon='📚' label='Resources' desc='Browse all resources' to='/resources' gradient='from-green-500 to-teal-600' />
        <NavCard icon='🏆' label='Leaderboard' desc='View rankings' to='/leaderboard' gradient='from-purple-500 to-indigo-600' />
      </div>
    </div>
  </Layout>
);

export const AdminDashboard = () => (
  <Layout>
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='font-display font-bold text-2xl text-dark-50'>Admin Panel</h1>
        <p className='text-dark-400 mt-1'>Manage the entire EduConnect platform.</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <NavCard icon='🏫' label='All Schools' desc='View and manage schools' to='/schools' gradient='from-brand-500 to-purple-600' />
        <NavCard icon='📅' label='All Events' desc='Monitor all events' to='/events' gradient='from-pink-500 to-rose-600' />
        <NavCard icon='📚' label='All Resources' desc='Review uploaded content' to='/resources' gradient='from-cyan-500 to-blue-600' />
        <NavCard icon='💬' label='Forum' desc='Moderate discussions' to='/forum' gradient='from-amber-500 to-orange-600' />
      </div>
    </div>
  </Layout>
);

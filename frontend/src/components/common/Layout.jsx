import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import FloatingBot from '../ai/FloatingBot';
import authService from '../../services/authService';

const NAV_ITEMS = {
  STUDENT: [
    { icon: '🏠', label: 'Dashboard', to: '/dashboard/student' },
    { icon: '🏫', label: 'Schools', to: '/schools' },
    { icon: '📅', label: 'Events', to: '/events' },
    { icon: '📚', label: 'Resources', to: '/resources' },
    { icon: '🏆', label: 'Leaderboard', to: '/leaderboard' },
    { icon: '🏅', label: 'Certificates', to: '/certificates' },
    { icon: '💬', label: 'Forum', to: '/forum' },
    { icon: '🎓', label: 'Study Assistant', to: '/ai/study' },
    { icon: '🗓️', label: 'Study Planner', to: '/ai/planner' },
  ],
  TEACHER: [
    { icon: '🏠', label: 'Dashboard', to: '/dashboard/teacher' },
    { icon: '🏫', label: 'Schools', to: '/schools' },
    { icon: '📅', label: 'Events', to: '/events' },
    { icon: '📤', label: 'Upload Resource', to: '/resources/upload' },
    { icon: '📚', label: 'Resources', to: '/resources' },
    { icon: '💬', label: 'Forum', to: '/forum' },
    { icon: '📝', label: 'Lesson Assistant', to: '/ai/study' },
    { icon: '📅', label: 'Lesson Planner', to: '/ai/planner' },
  ],
  SCHOOL: [
    { icon: '🏠', label: 'Dashboard', to: '/dashboard/school' },
    { icon: '⚙️', label: 'My School', to: '/dashboard/school/manage' },
    { icon: '➕', label: 'Create Event', to: '/events/create' },
    { icon: '📅', label: 'Events', to: '/events' },
    { icon: '📤', label: 'Upload Resource', to: '/resources/upload' },
    { icon: '📚', label: 'Resources', to: '/resources' },
    { icon: '🏆', label: 'Leaderboard', to: '/leaderboard' },
    { icon: '💬', label: 'Forum', to: '/forum' },
    { icon: '📊', label: 'School Analyst', to: '/ai/study' },
    { icon: '🗓️', label: 'Academic Planner', to: '/ai/planner' },
  ],
  ADMIN: [
    { icon: '🏠', label: 'Dashboard', to: '/dashboard/admin' },
    { icon: '🏫', label: 'Schools', to: '/schools' },
    { icon: '📅', label: 'Events', to: '/events' },
    { icon: '📚', label: 'Resources', to: '/resources' },
    { icon: '🏆', label: 'Leaderboard', to: '/leaderboard' },
    { icon: '💬', label: 'Forum', to: '/forum' },
    { icon: '🛡️', label: 'Security Auditor', to: '/ai/study' },
    { icon: '⚙️', label: 'Platform Planner', to: '/ai/planner' },
  ],
};

const roleGradient = {
  ADMIN: 'from-red-500 to-orange-500',
  SCHOOL: 'from-purple-500 to-pink-500',
  TEACHER: 'from-green-500 to-cyan-500',
  STUDENT: 'from-brand-500 to-cyan-500',
};

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profileExtras, setProfileExtras] = useState(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`educonnect_profile_extras_${user.id}`);
    if (saved) return JSON.parse(saved);
    
    const defaultPics = {
      STUDENT: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      TEACHER: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
      SCHOOL: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=256&auto=format&fit=crop',
      ADMIN: 'https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?q=80&w=256&auto=format&fit=crop',
    };
    
    const defaultCovers = {
      STUDENT: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      TEACHER: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
      SCHOOL: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
      ADMIN: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop',
    };

    return {
      profilePic: defaultPics[user.role] || defaultPics.STUDENT,
      coverPhoto: defaultCovers[user.role] || defaultCovers.STUDENT,
      
      // STUDENT PROPERTIES
      className: user.role === 'STUDENT' ? 'Grade 12-A' : '',
      academicStream: user.role === 'STUDENT' ? 'Science (PCM)' : '',
      studentBio: user.role === 'STUDENT' ? 'Passionate about engineering, mathematics, and building next-gen web applications.' : '',
      
      // TEACHER PROPERTIES
      teacherSubject: user.role === 'TEACHER' ? 'Advanced Physics' : '',
      teacherDept: user.role === 'TEACHER' ? 'Department of Science' : '',
      teacherEducation: user.role === 'TEACHER' ? 'M.Sc. in Physics, B.Ed' : '',
      teacherExperience: user.role === 'TEACHER' ? '8+ Years' : '',
      teacherBio: user.role === 'TEACHER' ? 'Committed to fostering inquiry-based learning and developing young scientific minds.' : '',
      
      // SCHOOL PROPERTIES
      schoolHead: user.role === 'SCHOOL' ? 'Dr. Sarah Jenkins (Principal)' : '',
      establishedYear: user.role === 'SCHOOL' ? '1998' : '',
      schoolPhone: user.role === 'SCHOOL' ? '+91 98765 43210' : '',
      schoolEnrollment: user.role === 'SCHOOL' ? '1,500+ Students' : '',
      schoolFaculty: user.role === 'SCHOOL' ? '75+ Certified Faculty' : '',
      schoolBio: user.role === 'SCHOOL' ? 'A premier educational institution dedicated to academic excellence and holistic development.' : '',
      
      // ADMIN PROPERTIES
      adminDept: user.role === 'ADMIN' ? 'Infrastructure & Operations' : '',
      adminRole: user.role === 'ADMIN' ? 'Super Administrator' : '',
      adminResponsibilities: user.role === 'ADMIN' ? 'Security Operations, User Auditing & Affiliation Lifecycles' : '',
      adminPhone: user.role === 'ADMIN' ? '+91 99999 88888' : '',
      adminLocation: user.role === 'ADMIN' ? 'EduConnect HQ, New Delhi' : '',
      adminBio: user.role === 'ADMIN' ? 'Managing and scaling EduConnect infrastructure to deliver flawless modern education resources.' : '',

      // GENERAL AFFILIATION
      schoolName: (user.role === 'STUDENT' || user.role === 'TEACHER') ? 'Greenwood High School' : '',
      schoolLocation: (user.role === 'STUDENT' || user.role === 'TEACHER') ? 'New Delhi, India' : '',
      schoolBoard: (user.role === 'STUDENT' || user.role === 'TEACHER') ? 'CBSE' : '',
    };
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileExtras(prev => {
          const nextState = { ...prev, [field]: reader.result };
          localStorage.setItem(`educonnect_profile_extras_${user.id}`, JSON.stringify(nextState));
          return nextState;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveExtrasInline = () => {}; // Used for backwards compatibility in onChange

  const handleSaveExtras = () => {
    localStorage.setItem(`educonnect_profile_extras_${user.id}`, JSON.stringify(profileExtras));
    setIsEditing(false);
  };

  useEffect(() => {
    if (showProfileModal) {
      setProfileLoading(true);
      authService.getMe()
        .then(res => {
          setProfileData(res.data);
        })
        .catch(err => {
          console.error('Failed to load profile:', err);
        })
        .finally(() => setProfileLoading(false));
    }
  }, [showProfileModal]);

  const navItems = NAV_ITEMS[user?.role] || [];
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className='flex h-screen bg-dark-950 overflow-hidden'>
      <aside className={'flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300 ' + (sidebarOpen ? 'w-60' : 'w-16')}>
        <Link 
          to={user ? `/dashboard/${user.role.toLowerCase()}` : '/'} 
          className='flex items-center gap-3 px-4 py-5 border-b border-dark-800 hover:opacity-85 transition-opacity focus:outline-none cursor-pointer'
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0'>E</div>
          {sidebarOpen && <span className='font-display font-bold text-dark-50 text-lg'>EduConnect</span>}
        </Link>
        <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={active ? 'sidebar-link-active' : 'sidebar-link'}>
                <span className='text-base flex-shrink-0'>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className='p-3 border-t border-dark-800'>
          {sidebarOpen ? (
            <div className='flex items-center gap-3 px-2 py-2'>
              <button 
                onClick={() => setShowProfileModal(true)} 
                className='flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity text-left focus:outline-none cursor-pointer'
                title="View Profile Details"
              >
                <div className={'w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ' + (roleGradient[user?.role] || '')}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-dark-100 text-sm font-medium truncate'>{user?.name}</p>
                  <p className='text-dark-500 text-xs'>{user?.role}</p>
                </div>
              </button>
              <button onClick={handleLogout} className='text-dark-500 hover:text-red-400 text-xs flex-shrink-0 ml-1.5'>Exit</button>
            </div>
          ) : (
            <button onClick={handleLogout} className='w-full flex justify-center py-2 text-dark-500 hover:text-red-400'>🚪</button>
          )}
        </div>
      </aside>

      <div className='flex-1 flex flex-col overflow-hidden'>
        <header className='h-14 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6 flex-shrink-0'>
          <div className='flex items-center gap-4'>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className='text-dark-400 hover:text-dark-100 transition-colors focus:outline-none' title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-800 transition-all border border-transparent hover:border-dark-700 font-medium text-sm focus:outline-none'
              title="Go Back"
            >
              <span className='text-lg leading-none'>←</span>
              <span>Back</span>
            </button>
          </div>
          <button 
            onClick={() => setShowProfileModal(true)} 
            className='flex items-center gap-3 hover:opacity-80 active:scale-95 transition-all focus:outline-none cursor-pointer'
            title="View Profile Details"
          >
            <span className={'badge bg-gradient-to-r text-white ' + (roleGradient[user?.role] || '')}>{user?.role}</span>
            <span className='text-dark-300 hover:text-dark-50 text-sm font-medium transition-colors flex items-center gap-1'>
              {user?.name} 👤
            </span>
          </button>
        </header>
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>

      <FloatingBot />

      {/* Premium Profile Modal Overlay */}
      {showProfileModal && (
        <div className='fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in'>
          <div className='bg-dark-900 border border-dark-700/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all duration-300 animate-scale-up my-8'>
            
            {/* Cover Photo Banner */}
            <div 
              className={`h-32 bg-cover bg-center relative bg-gradient-to-r ${roleGradient[user?.role] || 'from-brand-500 to-cyan-500'}`}
              style={profileExtras.coverPhoto ? { backgroundImage: `url(${profileExtras.coverPhoto})` } : {}}
            >
              <div className='absolute inset-0 bg-black/40'></div>
              
              <button 
                onClick={() => { setShowProfileModal(false); setIsEditing(false); }} 
                className='absolute top-4 right-4 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg font-bold transition-all focus:outline-none z-10'
              >
                ×
              </button>
              
              {isEditing && (
                <div className='absolute top-4 right-14 flex items-center gap-2 z-10'>
                  <label className='bg-black/60 hover:bg-black/80 text-white text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all font-semibold border border-white/10 shadow-lg active:scale-95'>
                    📷 Change Cover
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => { handleFileChange(e, 'coverPhoto'); handleSaveExtrasInline(e, 'coverPhoto'); }} 
                    />
                  </label>
                  {profileExtras.coverPhoto && (
                    <button 
                      onClick={() => {
                        setProfileExtras(prev => {
                          const next = { ...prev, coverPhoto: '' };
                          localStorage.setItem(`educonnect_profile_extras_${user.id}`, JSON.stringify(next));
                          return next;
                        });
                      }}
                      className='bg-red-500/80 hover:bg-red-600/90 text-white text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all font-semibold border border-red-500/20 shadow-lg active:scale-95'
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              )}
              
              {/* Floating User Avatar */}
              <div className='absolute -bottom-12 left-6 z-10'>
                <div className='w-24 h-24 rounded-full border-4 border-dark-900 overflow-hidden shadow-xl bg-dark-800 flex items-center justify-center relative group'>
                  {profileExtras.profilePic ? (
                    <img src={profileExtras.profilePic} alt={user?.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-br ${roleGradient[user?.role] || 'from-brand-500 to-cyan-500'}`}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 transition-all text-white p-1 z-20 backdrop-blur-sm'>
                      <label className='cursor-pointer flex flex-col items-center justify-center text-[10px] font-bold hover:text-brand-400 transition-colors w-full h-1/2 border-b border-white/20 pt-1'>
                        <span>📷 Change</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => { handleFileChange(e, 'profilePic'); handleSaveExtrasInline(e, 'profilePic'); }} 
                        />
                      </label>
                      {profileExtras.profilePic && (
                        <button 
                          onClick={() => {
                            setProfileExtras(prev => {
                              const next = { ...prev, profilePic: '' };
                              localStorage.setItem(`educonnect_profile_extras_${user.id}`, JSON.stringify(next));
                              return next;
                            });
                          }}
                          className='text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors w-full h-1/2 pb-1 flex items-center justify-center gap-0.5'
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className='absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-dark-900 rounded-full font-medium z-10' title="Online Status"></div>
              </div>
            </div>

            {/* Profile Intro Header */}
            <div className='pt-14 px-6 pb-4 flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <h3 className='text-xl font-bold text-dark-50 truncate flex items-center gap-1.5'>
                  {user?.name}
                </h3>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${roleGradient[user?.role] || 'from-brand-500 to-cyan-500'} mt-1`}>
                  {user?.role} MEMBER
                </span>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className='text-xs font-semibold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl border border-brand-500/20 transition-all focus:outline-none flex items-center gap-1 shrink-0'
              >
                {isEditing ? '👁️ View Profile' : '✏️ Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className='px-6 pb-6 space-y-4 max-h-[350px] overflow-y-auto'>
                <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400'>Customize Profile Details</h4>
                
                <div className='space-y-3.5'>
                  {user?.role === 'STUDENT' && (
                    <>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Short Bio</label>
                        <textarea 
                          className='input w-full text-sm h-16 py-1.5 resize-none' 
                          value={profileExtras.studentBio || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, studentBio: e.target.value }))}
                          placeholder='Tell us about yourself...'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Class / Grade</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.className} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, className: e.target.value }))}
                          placeholder='e.g. Grade 12-A'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Academic Stream / Focus</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.academicStream} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, academicStream: e.target.value }))}
                          placeholder='e.g. Science (PCM)'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Current School</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolName || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolName: e.target.value }))}
                          placeholder='e.g. Greenwood High School'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Location</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolLocation || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolLocation: e.target.value }))}
                          placeholder='e.g. New Delhi, India'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Affiliated Board</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolBoard || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolBoard: e.target.value }))}
                          placeholder='e.g. CBSE / ICSE'
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'TEACHER' && (
                    <>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Teacher Bio</label>
                        <textarea 
                          className='input w-full text-sm h-16 py-1.5 resize-none' 
                          value={profileExtras.teacherBio || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, teacherBio: e.target.value }))}
                          placeholder='Share your teaching philosophy...'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Primary Subject Expertise</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.teacherSubject} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, teacherSubject: e.target.value }))}
                          placeholder='e.g. Advanced Physics'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Department</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.teacherDept} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, teacherDept: e.target.value }))}
                          placeholder='e.g. Science & Research'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Classes Taught / Class Teacher</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.className || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, className: e.target.value }))}
                          placeholder='e.g. Grade 11-B'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Education & Qualifications</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.teacherEducation || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, teacherEducation: e.target.value }))}
                          placeholder='e.g. M.Sc in Physics, B.Ed'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Teaching Experience</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.teacherExperience || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, teacherExperience: e.target.value }))}
                          placeholder='e.g. 8+ Years'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Teaching at School</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolName || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolName: e.target.value }))}
                          placeholder='e.g. Greenwood High School'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Location</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolLocation || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolLocation: e.target.value }))}
                          placeholder='e.g. New Delhi, India'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Affiliated Board</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolBoard || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolBoard: e.target.value }))}
                          placeholder='e.g. CBSE / IB'
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'SCHOOL' && (
                    <>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Description / Bio</label>
                        <textarea 
                          className='input w-full text-sm h-16 py-1.5 resize-none' 
                          value={profileExtras.schoolBio || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolBio: e.target.value }))}
                          placeholder='Share details about your school...'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Head / Principal Name</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolHead} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolHead: e.target.value }))}
                          placeholder='e.g. Dr. Evelyn Richardson'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Established Year</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.establishedYear} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, establishedYear: e.target.value }))}
                          placeholder='e.g. 1998'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Contact Number</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolPhone} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolPhone: e.target.value }))}
                          placeholder='e.g. +91 98765 43210'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Total Enrolled Students</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolEnrollment || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolEnrollment: e.target.value }))}
                          placeholder='e.g. 1,500+ Students'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Total Faculty Members</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolFaculty || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolFaculty: e.target.value }))}
                          placeholder='e.g. 75+ Certified Faculty'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>School Location</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolLocation || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolLocation: e.target.value }))}
                          placeholder='e.g. New Delhi, India'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Affiliated Board</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.schoolBoard || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, schoolBoard: e.target.value }))}
                          placeholder='e.g. CBSE / ICSE'
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Administrative Bio</label>
                        <textarea 
                          className='input w-full text-sm h-16 py-1.5 resize-none' 
                          value={profileExtras.adminBio || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminBio: e.target.value }))}
                          placeholder='Share administrative details...'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Admin Department</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.adminDept || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminDept: e.target.value }))}
                          placeholder='e.g. Infrastructure & Operations'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Role Designation</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.adminRole || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminRole: e.target.value }))}
                          placeholder='e.g. Super Administrator'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Responsibilities</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.adminResponsibilities || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminResponsibilities: e.target.value }))}
                          placeholder='e.g. Global Security Operations'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>Contact Hotline</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.adminPhone || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminPhone: e.target.value }))}
                          placeholder='e.g. +91 99999 88888'
                        />
                      </div>
                      <div>
                        <label className='text-[10px] text-dark-400 font-bold uppercase tracking-wider mb-1 block'>HQ / Base Office</label>
                        <input 
                          type='text' 
                          className='input w-full text-sm' 
                          value={profileExtras.adminLocation || ''} 
                          onChange={e => setProfileExtras(prev => ({ ...prev, adminLocation: e.target.value }))}
                          placeholder='e.g. EduConnect HQ, New Delhi'
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className='flex items-center gap-3 pt-2'>
                  <button 
                    onClick={handleSaveExtras}
                    className={`flex-1 py-2.5 font-semibold text-sm rounded-xl text-white bg-gradient-to-r ${roleGradient[user?.role] || 'from-brand-500 to-cyan-500'} hover:opacity-95 transition-opacity focus:outline-none`}
                  >
                    💾 Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className='px-4 py-2.5 font-semibold text-sm rounded-xl bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors focus:outline-none'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='px-6 pb-6 space-y-4 max-h-[350px] overflow-y-auto text-left'>
                
                {profileLoading ? (
                  <div className='py-12 flex flex-col items-center justify-center gap-3'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-400'></div>
                    <p className='text-xs text-dark-400'>Loading latest credentials...</p>
                  </div>
                ) : (
                  <>
                    {/* General Credentials Section */}
                    <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3'>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>Personal Credentials</h4>
                      
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Full Name</span>
                          <span className='text-sm text-dark-100 font-semibold'>{profileData?.name || user?.name}</span>
                        </div>
                        <div>
                          <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Joined On</span>
                          <span className='text-sm text-dark-100 font-semibold'>
                            {profileData?.createdAt 
                              ? new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Email Address</span>
                        <span className='text-sm text-dark-100 font-semibold'>{profileData?.email || user?.email}</span>
                      </div>
                    </div>

                    {/* Bio Box */}
                    {(profileExtras.studentBio || profileExtras.teacherBio || profileExtras.schoolBio || profileExtras.adminBio) && (
                      <div className='bg-dark-800/30 p-4 rounded-2xl border border-dark-700/40 text-xs text-dark-300 italic leading-relaxed text-center relative overflow-hidden'>
                        <span className='absolute top-1 left-2.5 text-lg opacity-25 font-serif text-brand-400'>“</span>
                        <p className='px-4'>{profileExtras.studentBio || profileExtras.teacherBio || profileExtras.schoolBio || profileExtras.adminBio}</p>
                        <span className='absolute bottom-1 right-2.5 text-lg opacity-25 font-serif text-brand-400'>”</span>
                      </div>
                    )}

                    {/* Role Specific Details Section */}
                    {user?.role === 'STUDENT' && (
                      <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3'>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>Academic Status</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Class / Grade</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.className || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Focus Stream</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.academicStream || 'Not Set'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'TEACHER' && (
                      <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3'>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>Teaching Portfolio</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Subject Expertise</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.teacherSubject || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Department</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.teacherDept || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Qualifications</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.teacherEducation || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Experience</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.teacherExperience || 'Not Set'}</span>
                          </div>
                          <div className='col-span-2'>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Class Supervision</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.className || 'Not Set'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'SCHOOL' && (
                      <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3'>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>School Head & Details</h4>
                        <div>
                          <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Principal Name</span>
                          <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolHead || 'Not Set'}</span>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Established</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.establishedYear || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Contact Phone</span>
                            <span className='text-sm text-dark-100 font-semibold text-brand-400'>{profileExtras.schoolPhone || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Student Enrollment</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolEnrollment || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Faculty Strength</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolFaculty || 'Not Set'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'ADMIN' && (
                      <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3'>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>Platform Administration</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Admin Department</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.adminDept || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Role Designation</span>
                            <span className='text-sm text-dark-100 font-semibold text-brand-500'>{profileExtras.adminRole || 'Not Set'}</span>
                          </div>
                          <div className='col-span-2'>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Core Responsibilities</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.adminResponsibilities || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Contact Hotline</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.adminPhone || 'Not Set'}</span>
                          </div>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>HQ Location</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.adminLocation || 'Not Set'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* School Info Section */}
                    <div className='bg-dark-800/50 p-4 rounded-2xl border border-dark-700/60 space-y-3.5'>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-brand-400 mb-1'>School Affiliation</h4>
                      
                      {user?.role === 'ADMIN' ? (
                        <div className='text-sm text-dark-300 font-medium flex items-center gap-2'>
                          <span>🛠️</span> System Administration Level Access
                        </div>
                      ) : (profileData?.school || profileExtras.schoolName) ? (
                        <>
                          <div>
                            <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Associated School</span>
                            <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolName || profileData?.school?.name || 'TBA'}</span>
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Location</span>
                              <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolLocation || profileData?.school?.location || 'TBA'}</span>
                            </div>
                            <div>
                              <span className='text-[10px] text-dark-500 uppercase font-bold tracking-wider block'>Affiliated Board</span>
                              <span className='text-sm text-dark-100 font-semibold'>{profileExtras.schoolBoard || profileData?.school?.affiliation || 'TBA'}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className='text-xs text-dark-400 italic flex items-center gap-1.5'>
                          <span>ℹ️</span> No school linked to this profile.
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button 
                  onClick={() => setShowProfileModal(false)}
                  className={`w-full py-2.5 font-semibold text-sm rounded-xl text-white bg-gradient-to-r ${roleGradient[user?.role] || 'from-brand-500 to-cyan-500'} hover:opacity-90 transition-opacity focus:outline-none`}
                >
                  Close Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Layout;

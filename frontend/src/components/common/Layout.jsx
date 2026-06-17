import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, CalendarDays, BookOpen, Trophy,
  Award, MessageSquare, Brain, CalendarRange, Settings, Building2,
  Plus, Upload, Users, ClipboardList, UserCheck, Megaphone,
  Bot, ChevronLeft, ChevronRight, LogOut, Menu, ArrowLeft,
  Bell, Activity, Shield, Wrench
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import FloatingBot from '../ai/FloatingBot';
import authService from '../../services/authService';
import NotificationBell from './NotificationBell';

// ─── Role colour palette ───────────────────────────────────────────────────────
const roleGradient = {
  ADMIN:   'from-zinc-500 to-zinc-700',
  SCHOOL:  'from-brand-500 to-purple-600',
  TEACHER: 'from-amber-500 to-orange-600',
  STUDENT: 'from-brand-500 to-fuchsia-600',
};
const roleAccent = {
  ADMIN:   '#71717a', SCHOOL:  '#a855f7',
  TEACHER: '#f59e0b', STUDENT: '#c026d3',
};

// ─── Navigation config ────────────────────────────────────────────────────────
const NAV = {
  STUDENT: [
    { group: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard',   to: '/dashboard/student' },
        { icon: Activity,        label: 'My Progress',  to: '/dashboard/student' },
      ],
    },
    { group: 'Learning',
      items: [
        { icon: Users,           label: 'Classes',       to: '/classes' },
        { icon: CalendarRange,   label: 'Timetable',     to: '/timetable' },
        { icon: ClipboardList,   label: 'Assignments',   to: '/assignments' },
        { icon: UserCheck,       label: 'Attendance',    to: '/attendance' },
        { icon: Megaphone,       label: 'Announcements', to: '/announcements' },
      ],
    },
    { group: 'Platform',
      items: [
        { icon: Building2,       label: 'Schools',       to: '/schools' },
        { icon: CalendarDays,    label: 'Events',        to: '/events' },
        { icon: BookOpen,        label: 'Resources',     to: '/resources' },
        { icon: Trophy,          label: 'Leaderboard',   to: '/leaderboard' },
        { icon: Award,           label: 'Certificates',  to: '/certificates' },
        { icon: MessageSquare,   label: 'Forum',         to: '/forum' },
      ],
    },
    { group: 'AI Suite',
      items: [
        { icon: Brain,           label: 'Study Assistant', to: '/ai/study' },
        { icon: CalendarRange,   label: 'Study Planner',   to: '/ai/planner' },
        { icon: Bot,             label: 'Platform Bot',    to: '/ai/bot' },
      ],
    },
    { group: 'Account',
      items: [{ icon: Settings, label: 'Settings', to: '/settings' }],
    },
  ],

  TEACHER: [
    { group: 'Overview',
      items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/teacher' }],
    },
    { group: 'Teaching',
      items: [
        { icon: Users,         label: 'Classes',       to: '/classes' },
        { icon: CalendarRange, label: 'My Timetable',  to: '/timetable' },
        { icon: ClipboardList, label: 'Assignments',   to: '/assignments' },
        { icon: UserCheck,     label: 'Attendance',    to: '/attendance' },
        { icon: Megaphone,     label: 'Announcements', to: '/announcements' },
      ],
    },
    { group: 'Platform',
      items: [
        { icon: Building2,     label: 'Schools',     to: '/schools' },
        { icon: CalendarDays,  label: 'Events',      to: '/events' },
        { icon: Upload,        label: 'Upload',      to: '/resources/upload' },
        { icon: BookOpen,      label: 'Resources',   to: '/resources' },
        { icon: MessageSquare, label: 'Forum',       to: '/forum' },
      ],
    },
    { group: 'AI Suite',
      items: [
        { icon: Brain,         label: 'Lesson Helper', to: '/ai/study' },
        { icon: Bot,           label: 'Platform Bot',  to: '/ai/bot' },
      ],
    },
    { group: 'Account',
      items: [{ icon: Settings, label: 'Settings', to: '/settings' }],
    },
  ],

  SCHOOL: [
    { group: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard',   to: '/dashboard/school' },
        { icon: Wrench,          label: 'Manage School',to: '/dashboard/school/manage' },
      ],
    },
    { group: 'Academic',
      items: [
        { icon: Users,           label: 'Classes',       to: '/classes' },
        { icon: ClipboardList,   label: 'Assignments',   to: '/assignments' },
        { icon: UserCheck,       label: 'Attendance',    to: '/attendance' },
        { icon: Megaphone,       label: 'Announcements', to: '/announcements' },
      ],
    },
    { group: 'Events & Content',
      items: [
        { icon: Plus,            label: 'Create Event',  to: '/events/create' },
        { icon: CalendarDays,    label: 'Events',        to: '/events' },
        { icon: Upload,          label: 'Upload Resource',to: '/resources/upload' },
        { icon: BookOpen,        label: 'Resources',     to: '/resources' },
        { icon: Trophy,          label: 'Leaderboard',   to: '/leaderboard' },
        { icon: MessageSquare,   label: 'Forum',         to: '/forum' },
      ],
    },
    { group: 'AI Suite',
      items: [
        { icon: Brain,           label: 'School Analyst',to: '/ai/study' },
        { icon: Bot,             label: 'Platform Bot',  to: '/ai/bot' },
      ],
    },
    { group: 'Account',
      items: [{ icon: Settings,  label: 'Settings',      to: '/settings' }],
    },
  ],

  ADMIN: [
    { group: 'Overview',
      items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/admin' }],
    },
    { group: 'Platform',
      items: [
        { icon: Building2,   label: 'Schools',     to: '/schools' },
        { icon: CalendarDays,label: 'Events',      to: '/events' },
        { icon: BookOpen,    label: 'Resources',   to: '/resources' },
        { icon: MessageSquare,label: 'Forum',      to: '/forum' },
      ],
    },
    { group: 'AI Suite',
      items: [
        { icon: Shield,      label: 'Security Bot', to: '/ai/study' },
        { icon: Bot,         label: 'Platform Bot', to: '/ai/bot' },
      ],
    },
    { group: 'Account',
      items: [{ icon: Settings, label: 'Settings', to: '/settings' }],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [extras, setExtras] = useState(() => {
    if (!user) return {};
    try { return JSON.parse(localStorage.getItem(`ec_profile_${user.id}`) || '{}'); }
    catch { return {}; }
  });

  const saveExtras = (next) => {
    setExtras(next);
    localStorage.setItem(`ec_profile_${user.id}`, JSON.stringify(next));
  };

  useEffect(() => {
    if (profileOpen && !profileData) {
      setProfileLoading(true);
      authService.getMe()
        .then(r => setProfileData(r.data))
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    }
  }, [profileOpen]);

  const navGroups = NAV[user?.role] || [];
  const accent = roleAccent[user?.role] || '#a855f7';
  const grad = roleGradient[user?.role] || 'from-brand-500 to-cyan-500';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col flex-shrink-0 transition-all duration-300 border-r border-white/5 ${open ? 'w-60' : 'w-[60px]'}`}
        style={{ background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-white/5 flex-shrink-0 ${open ? 'px-4 gap-3' : 'justify-center'}`}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0 shadow-glow"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            E
          </div>
          {open && (
            <div>
              <span className="font-display font-black text-dark-50 text-base leading-tight tracking-tight">EduConnect</span>
              <p className="text-[10px] text-dark-500 font-medium">Education Platform</p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.group} className="mb-1">
              {open && (
                <p className="text-[10px] font-semibold text-dark-600 uppercase tracking-widest px-2 mb-1 mt-2">
                  {group.group}
                </p>
              )}
              {group.items.map(({ icon: Icon, label, to }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to.length > 10);
                return (
                  <Link
                    key={to + label}
                    to={to}
                    title={!open ? label : undefined}
                    className={`flex items-center rounded-xl transition-all duration-150 group
                      ${open ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'}
                      ${active
                        ? 'text-white'
                        : 'text-dark-500 hover:text-dark-100 hover:bg-white/5'
                      }`}
                    style={active ? {
                      background: `linear-gradient(135deg, ${accent}25, ${accent}10)`,
                      borderLeft: open ? `2px solid ${accent}` : 'none',
                      boxShadow: `0 0 20px -10px ${accent}`,
                    } : {}}
                  >
                    <Icon
                      size={16}
                      className={`flex-shrink-0 transition-colors ${active ? 'text-current' : 'group-hover:text-dark-200'}`}
                      style={active ? { color: accent } : {}}
                    />
                    {open && (
                      <span className="text-sm font-medium truncate" style={active ? { color: accent } : {}}>
                        {label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className={`border-t border-white/5 p-2 flex-shrink-0 ${open ? '' : 'flex justify-center'}`}>
          {open ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 p-2 rounded-xl hover:bg-dark-800 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${grad}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-200 text-xs font-semibold truncate">{user?.name}</p>
                  <p className="text-dark-500 text-[10px] uppercase tracking-wide">{user?.role}</p>
                </div>
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-2 rounded-lg text-dark-600 hover:text-red-400 hover:bg-red-900/20 transition-colors" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setProfileOpen(true)} className={`w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs ${grad}`}>
              {initials}
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0 z-30"
          style={{ background: 'rgba(10, 10, 10, 0.75)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all"
            >
              {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all text-sm font-medium border border-transparent hover:border-dark-700"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-px h-5 bg-dark-700" />
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-dark-800 transition-all"
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-[10px] ${grad}`}>
                {initials}
              </div>
              <span className="text-dark-300 text-sm font-medium hidden sm:block">{user?.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${grad}`}>{user?.role}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <FloatingBot />

      {/* ── Profile modal ──────────────────────────────────────────────────── */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-dark-900 border border-dark-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Cover */}
            <div className={`h-28 bg-gradient-to-r ${grad} relative`}>
              <button
                onClick={() => { setProfileOpen(false); setIsEditing(false); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all"
              >×</button>
              {/* Avatar */}
              <div className="absolute -bottom-10 left-5 w-20 h-20 rounded-2xl border-4 border-dark-900 overflow-hidden shadow-xl">
                {extras.profilePic
                  ? <img src={extras.profilePic} alt="" className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br ${grad}`}>{initials}</div>
                }
              </div>
            </div>

            {/* Info */}
            <div className="pt-12 px-5 pb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-dark-50 font-bold text-lg">{user?.name}</h3>
                  <p className="text-dark-400 text-xs">{user?.email}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${grad} mt-1 inline-block`}>{user?.role}</span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-medium text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl border border-brand-500/20 transition-all"
                >
                  {isEditing ? '👁 View' : '✏️ Edit'}
                </button>
              </div>

              {profileLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isEditing ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  <div>
                    <label className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block mb-1">Bio</label>
                    <textarea
                      value={extras.bio || ''}
                      onChange={e => setExtras(p => ({ ...p, bio: e.target.value }))}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl p-2.5 text-dark-100 text-xs resize-none h-16 focus:outline-none focus:border-brand-500"
                      placeholder="Tell us about yourself…"
                    />
                  </div>
                  {[
                    ['School', 'school'], ['Location', 'location'],
                    ['Specialisation', 'specialisation'], ['Experience', 'experience'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block mb-1">{label}</label>
                      <input
                        value={extras[key] || ''}
                        onChange={e => setExtras(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-dark-100 text-xs focus:outline-none focus:border-brand-500"
                        placeholder={label}
                      />
                    </div>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Profile Picture</span>
                    <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20 cursor-pointer">
                      Choose
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files[0];
                        if (f) { const r = new FileReader(); r.onloadend = () => setExtras(p => ({ ...p, profilePic: r.result })); r.readAsDataURL(f); }
                      }} />
                    </span>
                  </label>
                  <button
                    onClick={() => { saveExtras(extras); setIsEditing(false); }}
                    className={`w-full py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${grad} hover:opacity-90 transition-opacity`}
                  >Save Changes</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {extras.bio && <p className="text-dark-400 text-xs italic">{extras.bio}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Joined', profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : '—'],
                      ['School', extras.school || profileData?.school?.name || '—'],
                      ['Location', extras.location || '—'],
                      ['Specialisation', extras.specialisation || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-dark-800 rounded-xl p-2.5">
                        <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">{label}</p>
                        <p className="text-dark-100 text-xs font-medium mt-0.5 truncate">{val}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 text-sm font-medium transition-all"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

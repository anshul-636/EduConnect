import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Calendar, BookOpen, Award, Trophy,
  Users, Activity, Building2, ClipboardList, UserCheck,
  Megaphone, Zap, Star, ArrowRight, Target, BarChart2, Sparkles
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import useAuthStore from '../../store/authStore';
import dashboardService from '../../services/dashboardService';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// ─── Design tokens ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  PUBLISHED: '#60a5fa', OPEN: '#34d399', ONGOING: '#fbbf24',
  COMPLETED: '#94a3b8', DRAFT: '#475569'
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 shadow-glow-sm border-brand-500/20">
      <p className="text-dark-400 text-xs mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Study-themed animated background particles (SVG icons as decoration)
const BgDecoration = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    <div className="absolute top-20 left-10 text-white/[0.02] animate-float" style={{ animationDuration: '8s' }}>
      <BookOpen size={120} />
    </div>
    <div className="absolute top-1/3 right-16 text-white/[0.03] animate-float" style={{ animationDuration: '11s', animationDelay: '2s' }}>
      <Star size={90} />
    </div>
    <div className="absolute bottom-32 left-24 text-white/[0.02] animate-float" style={{ animationDuration: '9s', animationDelay: '1s' }}>
      <Target size={80} />
    </div>
    <div className="absolute top-16 right-1/3 text-white/[0.02] animate-spin-slow">
      <Sparkles size={100} />
    </div>
    <div className="absolute bottom-16 right-24 text-white/[0.03] animate-float" style={{ animationDuration: '13s', animationDelay: '3s' }}>
      <Trophy size={70} />
    </div>
    {/* subtle grid */}
    <div className="absolute inset-0 bg-dots opacity-20" />
  </div>
);

// Stat card with animated gradient border glow
const StatCard = ({ icon: Icon, label, value, sub, gradient, glowClass, index = 0 }) => (
  <div className={`stat-card reveal delay-${Math.min(index + 1, 8)}`}>
    {/* glow accent in corner */}
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br ${gradient}`} />
    <div className="relative">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-dark-500 text-xs font-semibold uppercase tracking-widest">{label}</p>
      <p className="font-display font-bold text-3xl text-white mt-1 leading-none">
        {value === null || value === undefined ? '—' : value}
      </p>
      {sub && <p className="text-dark-500 text-xs mt-2">{sub}</p>}
    </div>
  </div>
);

// Navigation card with icon and hover shimmer
const NavCard = ({ icon: Icon, label, desc, to, gradient, index = 0 }) => (
  <Link to={to} className={`nav-card group reveal delay-${Math.min(index + 1, 8)}`}>
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="text-dark-100 font-semibold text-sm group-hover:text-white transition-colors">{label}</h3>
    <p className="text-dark-500 text-xs mt-1 leading-relaxed">{desc}</p>
    <div className="mt-3 flex items-center gap-1 text-brand-400/0 group-hover:text-brand-400 transition-all">
      <span className="text-xs font-semibold">Open</span>
      <ArrowRight size={12} />
    </div>
  </Link>
);

// Section header with subtle glow line
const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-4 mt-8 reveal">
    {Icon && <Icon size={14} className="text-brand-400" />}
    <p className="section-label">{children}</p>
    <div className="flex-1 aurora-divider" />
  </div>
);

// Skeleton loader matching StatCard grid
const SkeletonGrid = ({ cols = 4, count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4 mb-6`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="h-32 skeleton" />
    ))}
  </div>
);

// Page header with greeting text
const PageHeader = ({ title, sub }) => (
  <div className="mb-8 reveal">
    <h1 className="font-display font-black text-3xl text-gradient-brand leading-tight">{title}</h1>
    <p className="text-dark-400 text-sm mt-2">{sub}</p>
  </div>
);

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    dashboardService.getSummary()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <BgDecoration />
      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader
          title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
          sub="Here's your learning overview for today. Keep it up!"
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Calendar} label="Events Joined" value={s.registeredEvents} sub={`${s.completedEvents || 0} completed`} gradient="from-brand-600 to-brand-400" index={0} />
            <StatCard icon={BookOpen} label="Resources" value={s.uploadedResources} gradient="from-rose-600 to-pink-500" index={1} />
            <StatCard icon={Trophy} label="Best Rank" value={s.bestRank ? `#${s.bestRank}` : '—'} sub={s.bestRankEvent} gradient="from-amber-500 to-orange-500" index={2} />
            <StatCard icon={Award} label="Certificates" value={s.certificates} gradient="from-emerald-500 to-teal-500" index={3} />
          </div>
        )}

        {data?.scoreTrend?.length > 1 && (
          <div className="chart-card reveal" style={{ transitionDelay: '0.1s' }}>
            <h3 className="chart-title">
              <TrendingUp size={16} className="text-brand-400" /> Score Trend
              <span className="ml-auto text-xs text-dark-600 font-normal">across events</span>
            </h3>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={data.scoreTrend.map(t => ({ name: t.event?.title?.slice(0, 12) || 'Event', score: t.score }))}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Score" stroke="#a855f7" strokeWidth={2.5} fill="url(#sg)" dot={{ fill: '#a855f7', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {data?.recentActivity?.length > 0 && (
          <>
            <SectionTitle icon={Zap}>Recent Events</SectionTitle>
            <div className="space-y-2 mb-6">
              {data.recentActivity.map((ev, i) => (
                <Link key={ev.id} to={`/events/${ev.id}`}
                  className={`flex items-center justify-between p-4 rounded-2xl glass-card-light border-dark-800/60 hover:border-brand-500/25 transition-all duration-200 hover:-translate-x-0.5 reveal delay-${Math.min(i+1,5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400" />
                    <div>
                      <p className="text-dark-100 font-semibold text-sm">{ev.title}</p>
                      <p className="text-dark-500 text-xs mt-0.5">{ev.category} · {new Date(ev.eventDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: `${STATUS_COLOR[ev.status]}22`, color: STATUS_COLOR[ev.status] }}>
                    {ev.status}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        <SectionTitle icon={BarChart2}>Quick Access</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}        label="Classes"       desc="View enrolled classes"   to="/classes"       gradient="from-cyan-500 to-blue-600"     index={0} />
          <NavCard icon={ClipboardList} label="Assignments"  desc="Pending work & grades"  to="/assignments"   gradient="from-violet-500 to-purple-600"  index={1} />
          <NavCard icon={UserCheck}    label="Attendance"    desc="Your attendance record"  to="/attendance"    gradient="from-emerald-500 to-teal-600"   index={2} />
          <NavCard icon={Megaphone}    label="Announcements" desc="School notices"          to="/announcements" gradient="from-amber-500 to-orange-600"    index={3} />
          <NavCard icon={Calendar}     label="Events"        desc="Upcoming competitions"   to="/events"        gradient="from-pink-500 to-rose-600"      index={4} />
          <NavCard icon={BookOpen}     label="Resources"     desc="Study materials"         to="/resources"     gradient="from-blue-500 to-indigo-600"    index={5} />
          <NavCard icon={Trophy}       label="Leaderboard"   desc="Rankings & scores"       to="/leaderboard"   gradient="from-amber-500 to-orange-500"   index={6} />
          <NavCard icon={Award}        label="Certificates"  desc="Your achievements"       to="/certificates"  gradient="from-green-500 to-teal-600"     index={7} />
        </div>
      </div>
    </Layout>
  );
};

// ─── TEACHER DASHBOARD ────────────────────────────────────────────────────────
export const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    dashboardService.getSummary()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <BgDecoration />
      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader
          title={`Teacher Panel`}
          sub={`Hello, ${user?.name}. Here's your classroom overview.`}
        />

        {loading ? <SkeletonGrid cols={3} count={3} /> : (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={BookOpen}  label="Resources Uploaded" value={s.uploadedResources} gradient="from-brand-600 to-purple-500"  index={0} />
            <StatCard icon={Activity}  label="Total Views"        value={s.totalViews}         gradient="from-cyan-500 to-blue-600"      index={1} />
            <StatCard icon={TrendingUp} label="Total Upvotes"     value={s.totalUpvotes}       gradient="from-amber-500 to-orange-500"   index={2} />
          </div>
        )}

        {data?.topResources?.length > 0 && (
          <div className="chart-card reveal">
            <h3 className="chart-title">
              <Activity size={16} className="text-accent-cyan" />
              Top Resources by Views
              <span className="ml-auto text-xs text-dark-600 font-normal">your content</span>
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.topResources.map(r => ({ name: r.title.slice(0, 14) + '…', views: r.viewCount, upvotes: r.upvotes }))}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Views" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="upvotes" name="Upvotes" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <SectionTitle icon={Zap}>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}         label="My Classes"      desc="Manage your classes"       to="/classes"          gradient="from-cyan-500 to-blue-600"     index={0} />
          <NavCard icon={ClipboardList} label="Assignments"     desc="Create & grade work"        to="/assignments"      gradient="from-violet-500 to-purple-600"  index={1} />
          <NavCard icon={UserCheck}     label="Attendance"      desc="Mark daily attendance"      to="/attendance"       gradient="from-emerald-500 to-teal-600"   index={2} />
          <NavCard icon={Megaphone}     label="Announce"        desc="Post to your school"        to="/announcements"    gradient="from-amber-500 to-orange-600"   index={3} />
          <NavCard icon={BookOpen}      label="Upload Resource"  desc="Share study material"      to="/resources/upload" gradient="from-blue-500 to-indigo-600"    index={4} />
          <NavCard icon={Calendar}      label="Events"          desc="Upcoming competitions"      to="/events"           gradient="from-pink-500 to-rose-600"      index={5} />
          <NavCard icon={Trophy}        label="Leaderboard"     desc="Student rankings"           to="/leaderboard"      gradient="from-amber-500 to-orange-500"   index={6} />
          <NavCard icon={Building2}     label="Schools"         desc="Browse schools"             to="/schools"          gradient="from-green-500 to-teal-600"     index={7} />
        </div>
      </div>
    </Layout>
  );
};

// ─── SCHOOL DASHBOARD ─────────────────────────────────────────────────────────
export const SchoolDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    dashboardService.getSummary()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const COLORS = ['#a855f7', '#06b6d4', '#34d399', '#f59e0b', '#f43f5e'];

  const statusData = data ? [
    { name: 'Active', value: s.activeEvents || 0 },
    { name: 'Completed', value: (s.totalEvents || 0) - (s.activeEvents || 0) },
  ] : [];

  return (
    <Layout>
      <BgDecoration />
      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader
          title={data?.schoolName || 'School Dashboard'}
          sub="Manage your school, events and academic records."
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users}    label="Students"   value={s.totalStudents}  gradient="from-brand-600 to-purple-500"  index={0} />
            <StatCard icon={Activity} label="Teachers"   value={s.totalTeachers}  gradient="from-cyan-500 to-blue-600"     index={1} />
            <StatCard icon={Calendar} label="Events"     value={s.totalEvents}    sub={`${s.activeEvents || 0} active`} gradient="from-pink-500 to-rose-600" index={2} />
            <StatCard icon={BookOpen} label="Resources"  value={s.totalResources} gradient="from-amber-500 to-orange-500"  index={3} />
          </div>
        )}

        {data?.participationTrend?.length > 1 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 chart-card reveal">
              <h3 className="chart-title">
                <TrendingUp size={16} className="text-pink-400" />
                Participation Trend
              </h3>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={data.participationTrend.map(t => ({ month: t.month, count: t.count }))}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Registrations" stroke="#ec4899" strokeWidth={2.5} fill="url(#pg)" dot={{ fill: '#ec4899', r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {statusData.length > 0 && (
              <div className="chart-card reveal delay-1">
                <h3 className="chart-title text-sm">Event Status</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" paddingAngle={4}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-dark-400">{d.name}</span>
                      <span className="text-white font-bold ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <SectionTitle icon={Zap}>Management</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}         label="Classes"       desc="Manage class sections"     to="/classes"        gradient="from-cyan-500 to-blue-600"     index={0} />
          <NavCard icon={ClipboardList} label="Assignments"   desc="Academic tasks"            to="/assignments"    gradient="from-violet-500 to-purple-600"  index={1} />
          <NavCard icon={UserCheck}     label="Attendance"    desc="Daily attendance"          to="/attendance"     gradient="from-emerald-500 to-teal-600"   index={2} />
          <NavCard icon={Megaphone}     label="Announcements" desc="School-wide notices"       to="/announcements"  gradient="from-amber-500 to-orange-600"   index={3} />
          <NavCard icon={Calendar}      label="Create Event"  desc="Post a competition"        to="/events/create"  gradient="from-pink-500 to-rose-600"      index={4} />
          <NavCard icon={BookOpen}      label="Resources"     desc="Study material library"    to="/resources"      gradient="from-blue-500 to-indigo-600"    index={5} />
          <NavCard icon={Trophy}        label="Leaderboard"   desc="Student rankings"          to="/leaderboard"    gradient="from-amber-500 to-orange-500"   index={6} />
          <NavCard icon={Award}         label="Certificates"  desc="Issue certificates"        to="/certificates"   gradient="from-green-500 to-teal-600"     index={7} />
        </div>
      </div>
    </Layout>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    dashboardService.getSummary()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const roleData = data?.usersByRole
    ? Object.entries(data.usersByRole).map(([role, count]) => ({ name: role, count }))
    : [];
  const ROLE_COLORS = ['#a855f7', '#06b6d4', '#34d399', '#f59e0b'];

  return (
    <Layout>
      <BgDecoration />
      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader
          title="Admin Panel"
          sub="Platform-wide management and oversight."
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Building2} label="Schools"   value={s.totalSchools}   gradient="from-brand-600 to-purple-500" index={0} />
            <StatCard icon={Users}     label="Users"     value={s.totalUsers}     gradient="from-cyan-500 to-blue-600"    index={1} />
            <StatCard icon={Calendar}  label="Events"    value={s.totalEvents}    gradient="from-pink-500 to-rose-600"    index={2} />
            <StatCard icon={BookOpen}  label="Resources" value={s.totalResources} gradient="from-amber-500 to-orange-500" index={3} />
          </div>
        )}

        {roleData.length > 0 && (
          <div className="chart-card reveal">
            <h3 className="chart-title">
              <Users size={16} className="text-accent-cyan" />
              Users by Role
              <span className="ml-auto text-xs text-dark-600 font-normal">total: {s.totalUsers}</span>
            </h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={roleData}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Users" radius={[8, 8, 0, 0]}>
                  {roleData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data?.recentSchools?.length > 0 && (
          <>
            <SectionTitle icon={Building2}>Recently Joined Schools</SectionTitle>
            <div className="space-y-2 mb-6">
              {data.recentSchools.map((school, i) => (
                <Link key={school.id} to={`/schools/${school.id}`}
                  className={`flex items-center justify-between p-4 rounded-2xl glass-card-light border-dark-800/60 hover:border-brand-500/25 transition-all duration-200 hover:-translate-x-0.5 reveal delay-${Math.min(i+1,5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                      {school.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-dark-100 font-semibold text-sm">{school.name}</p>
                      <p className="text-dark-500 text-xs">{school.location} · {school._count?.members} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-500 text-xs">{new Date(school.createdAt).toLocaleDateString()}</span>
                    <ArrowRight size={14} className="text-dark-600" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <SectionTitle icon={BarChart2}>Platform</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NavCard icon={Building2} label="All Schools"   desc="View and manage all schools" to="/schools"   gradient="from-brand-600 to-purple-500" index={0} />
          <NavCard icon={Calendar}  label="All Events"    desc="Monitor competitions"        to="/events"    gradient="from-pink-500 to-rose-600"    index={1} />
          <NavCard icon={BookOpen}  label="All Resources" desc="Review uploaded content"     to="/resources" gradient="from-cyan-500 to-blue-600"    index={2} />
        </div>
      </div>
    </Layout>
  );
};

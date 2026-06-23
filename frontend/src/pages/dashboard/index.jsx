import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Calendar, BookOpen, Award, Trophy,
  Users, Activity, Building2, ClipboardList, UserCheck,
  Megaphone, Zap, Star, ArrowRight, Target, BarChart2, Sparkles, Brain
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import useAuthStore from '../../store/authStore';
import dashboardService from '../../services/dashboardService';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// ─── Zone colour system (mirrors Layout.jsx section colours) ─────────────────
const ZONE = {
  overview: { hex: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.22)', grad: 'from-violet-500 to-purple-600' },
  learning: { hex: '#00d4ff', bg: 'rgba(0,212,255,0.10)', border: 'rgba(0,212,255,0.2)', grad: 'from-cyan-400 to-blue-600' },
  platform: { hex: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.2)', grad: 'from-amber-400 to-orange-600' },
  ai: { hex: '#00ff9d', bg: 'rgba(0,255,157,0.10)', border: 'rgba(0,255,157,0.2)', grad: 'from-emerald-400 to-teal-600' },
};

const STATUS_COLOR = {
  PUBLISHED: '#60a5fa', OPEN: '#34d399', ONGOING: '#fbbf24',
  COMPLETED: '#94a3b8', DRAFT: '#475569'
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-3 rounded-xl">
      <p className="text-slate-500 text-xs mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Stat card — colour-coded to its zone
const StatCard = ({ icon: Icon, label, value, sub, zone = 'overview', index = 0 }) => {
  const z = ZONE[zone];
  return (
    <div className={`stat-card border border-white/5 bg-white/5 reveal delay-${Math.min(index + 1, 8)}`}>
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-[40px] transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: z.hex }}
      />
      <div className="relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 animate-float-random"
          style={{ background: `linear-gradient(135deg, ${z.hex}33, ${z.hex}1a)`, border: `1px solid ${z.border}`, boxShadow: `0 0 20px ${z.hex}22` }}
        >
          <Icon size={20} style={{ color: z.hex }} />
        </div>
        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="font-display font-black text-3xl text-white mt-1 leading-none tracking-tight">
          {value === null || value === undefined ? '—' : value}
        </p>
        {sub && <p className="text-slate-500 font-medium text-xs mt-3 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-500"></span>{sub}</p>}
      </div>
    </div>
  );
};

// Navigation card
const NavCard = ({ icon: Icon, label, desc, to, zone = 'platform', index = 0 }) => {
  const z = ZONE[zone];
  return (
    <Link to={to} className={`nav-card group card-hover relative overflow-hidden reveal delay-${Math.min(index + 1, 8)}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${z.hex}15, transparent 70%)` }} />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${z.hex}22, ${z.hex}08)`, border: `1px solid ${z.border}` }}
      >
        <Icon size={20} style={{ color: z.hex }} />
      </div>
      <h3 className="text-slate-200 font-bold text-sm group-hover:text-white transition-colors">{label}</h3>
      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">{desc}</p>
      <div className="mt-4 flex items-center gap-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: z.hex }}>
        <span className="text-xs font-bold uppercase tracking-wider">Open</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
};

// Section header
const SectionHeader = ({ eyebrow, title, zone = 'overview' }) => {
  const z = ZONE[zone];
  return (
    <div className="reveal mb-6 mt-12 px-1">
      <div className="flex items-center gap-2 mb-2">
         <span className="w-2 h-2 rounded-full shadow-lg" style={{ background: z.hex, boxShadow: `0 0 10px ${z.hex}` }}></span>
         <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: z.hex }}>{eyebrow}</p>
      </div>
      <div className="flex items-center gap-4">
        <h2 className="font-display font-black text-2xl text-white tracking-tight">{title}</h2>
        <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(90deg, ${z.hex}44, transparent)` }} />
      </div>
    </div>
  );
};

// Skeleton loader
const SkeletonGrid = ({ cols = 4, count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4 mb-6`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="h-40 skeleton rounded-[24px]" />
    ))}
  </div>
);

// Page hero — greeting + subtitle
const PageHero = ({ title, sub }) => (
  <div className="mb-2 reveal">
    <h1 className="font-display font-black text-3xl text-gradient-brand leading-tight">{title}</h1>
    <p className="text-slate-500 text-sm mt-2">{sub}</p>
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        {/* ── Overview zone ─────────────────────────────────────────────── */}
        <PageHero
          title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
          sub="Here's your learning overview for today. Keep it up!"
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Calendar} label="Events Joined" value={s.registeredEvents} sub={`${s.completedEvents || 0} completed`} zone="overview" index={0} />
            <StatCard icon={BookOpen} label="Resources" value={s.uploadedResources} zone="overview" index={1} />
            <StatCard icon={Trophy} label="Best Rank" value={s.bestRank ? `#${s.bestRank}` : '—'} sub={s.bestRankEvent} zone="overview" index={2} />
            <StatCard icon={Award} label="Certificates" value={s.certificates} zone="overview" index={3} />
          </div>
        )}

        {data?.scoreTrend?.length > 1 && (
          <div className="chart-card reveal mt-6">
            <h3 className="chart-title">
              <TrendingUp size={16} style={{ color: ZONE.overview.hex }} /> Score Trend
              <span className="ml-auto text-xs text-slate-600 font-normal">across events</span>
            </h3>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={data.scoreTrend.map(t => ({ name: t.event?.title?.slice(0, 12) || 'Event', score: t.score }))}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Score" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#sg)" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Learning zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Learning" title="Manage your studies" zone="learning" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users} label="Classes" desc="View enrolled classes" to="/classes" zone="learning" index={0} />
          <NavCard icon={ClipboardList} label="Assignments" desc="Pending work & grades" to="/assignments" zone="learning" index={1} />
          <NavCard icon={UserCheck} label="Attendance" desc="Your attendance record" to="/attendance" zone="learning" index={2} />
          <NavCard icon={Megaphone} label="Announcements" desc="School notices" to="/announcements" zone="learning" index={3} />
        </div>

        {data?.recentActivity?.length > 0 && (
          <div className="space-y-2 mt-5">
            {data.recentActivity.map((ev, i) => (
              <Link key={ev.id} to={`/events/${ev.id}`}
                className={`flex items-center justify-between p-4 rounded-2xl glass border-transparent hover:border-cyan-500/25 transition-all duration-200 hover:-translate-x-0.5 reveal delay-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: ZONE.learning.hex }} />
                  <div>
                    <p className="text-slate-200 font-semibold text-sm">{ev.title}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{ev.category} · {new Date(ev.eventDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: `${STATUS_COLOR[ev.status]}22`, color: STATUS_COLOR[ev.status] }}>
                  {ev.status}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Platform zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Platform" title="Explore EduConnect" zone="platform" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Calendar} label="Events" desc="Upcoming competitions" to="/events" zone="platform" index={0} />
          <NavCard icon={BookOpen} label="Resources" desc="Study materials" to="/resources" zone="platform" index={1} />
          <NavCard icon={Trophy} label="Leaderboard" desc="Rankings & scores" to="/leaderboard" zone="platform" index={2} />
          <NavCard icon={Award} label="Certificates" desc="Your achievements" to="/certificates" zone="platform" index={3} />
        </div>

        {/* ── AI zone ────────────────────────────────────────────────────── */}
        <SectionHeader eyebrow="AI Suite" title="Your AI learning tools" zone="ai" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <NavCard icon={Brain} label="Study Assistant" desc="Ask questions, get help" to="/ai/study" zone="ai" index={0} />
          <NavCard icon={Calendar} label="Study Planner" desc="AI-built schedules" to="/ai/planner" zone="ai" index={1} />
          <NavCard icon={Sparkles} label="Platform Bot" desc="Your campus guide" to="/ai/bot" zone="ai" index={2} />
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <PageHero
          title="Teacher panel"
          sub={`Hello, ${user?.name}. Here's your classroom overview.`}
        />

        {loading ? <SkeletonGrid cols={3} count={3} /> : (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <StatCard icon={BookOpen} label="Resources Uploaded" value={s.uploadedResources} zone="overview" index={0} />
            <StatCard icon={Activity} label="Total Views" value={s.totalViews} zone="overview" index={1} />
            <StatCard icon={TrendingUp} label="Total Upvotes" value={s.totalUpvotes} zone="overview" index={2} />
          </div>
        )}

        {data?.topResources?.length > 0 && (
          <div className="chart-card reveal mt-6">
            <h3 className="chart-title">
              <Activity size={16} style={{ color: ZONE.learning.hex }} />
              Top Resources by Views
              <span className="ml-auto text-xs text-slate-600 font-normal">your content</span>
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.topResources.map(r => ({ name: r.title.slice(0, 14) + '…', views: r.viewCount, upvotes: r.upvotes }))}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Views" fill="#00d4ff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="upvotes" name="Upvotes" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Teaching zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Teaching" title="Your classroom tools" zone="learning" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users} label="My Classes" desc="Manage your classes" to="/classes" zone="learning" index={0} />
          <NavCard icon={ClipboardList} label="Assignments" desc="Create & grade work" to="/assignments" zone="learning" index={1} />
          <NavCard icon={UserCheck} label="Attendance" desc="Mark daily attendance" to="/attendance" zone="learning" index={2} />
          <NavCard icon={Megaphone} label="Announce" desc="Post to your school" to="/announcements" zone="learning" index={3} />
          <NavCard icon={BookOpen} label="Upload Resource" desc="Share study material" to="/resources/upload" zone="learning" index={4} />
        </div>

        {/* ── Platform zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Platform" title="Browse and connect" zone="platform" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NavCard icon={Calendar} label="Events" desc="Upcoming competitions" to="/events" zone="platform" index={0} />
          <NavCard icon={Trophy} label="Leaderboard" desc="Student rankings" to="/leaderboard" zone="platform" index={1} />
          <NavCard icon={Building2} label="Schools" desc="Browse schools" to="/schools" zone="platform" index={2} />
        </div>

        {/* ── AI zone ────────────────────────────────────────────────────── */}
        <SectionHeader eyebrow="AI Suite" title="Lesson support tools" zone="ai" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <NavCard icon={Brain} label="Lesson Helper" desc="AI lesson assistance" to="/ai/study" zone="ai" index={0} />
          <NavCard icon={Sparkles} label="Platform Bot" desc="Your campus guide" to="/ai/bot" zone="ai" index={1} />
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const PIE_COLORS = ['#8b5cf6', '#00d4ff'];

  const statusData = data ? [
    { name: 'Active', value: s.activeEvents || 0 },
    { name: 'Completed', value: (s.totalEvents || 0) - (s.activeEvents || 0) },
  ] : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <PageHero
          title={data?.schoolName || 'School dashboard'}
          sub="Manage your school, events and academic records."
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Users} label="Students" value={s.totalStudents} zone="overview" index={0} />
            <StatCard icon={Activity} label="Teachers" value={s.totalTeachers} zone="overview" index={1} />
            <StatCard icon={Calendar} label="Events" value={s.totalEvents} sub={`${s.activeEvents || 0} active`} zone="overview" index={2} />
            <StatCard icon={BookOpen} label="Resources" value={s.totalResources} zone="overview" index={3} />
          </div>
        )}

        {data?.participationTrend?.length > 1 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="col-span-2 chart-card reveal">
              <h3 className="chart-title">
                <TrendingUp size={16} style={{ color: ZONE.platform.hex }} />
                Participation Trend
              </h3>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={data.participationTrend.map(t => ({ month: t.month, count: t.count }))}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Registrations" stroke="#f59e0b" strokeWidth={2.5} fill="url(#pg)" dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {statusData.length > 0 && (
              <div className="chart-card reveal delay-1">
                <h3 className="chart-title text-sm">Event Status</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" paddingAngle={4}>
                      {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-500">{d.name}</span>
                      <span className="text-white font-bold ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Academic zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Academic" title="Manage your school" zone="learning" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users} label="Classes" desc="Manage class sections" to="/classes" zone="learning" index={0} />
          <NavCard icon={ClipboardList} label="Assignments" desc="Academic tasks" to="/assignments" zone="learning" index={1} />
          <NavCard icon={UserCheck} label="Attendance" desc="Daily attendance" to="/attendance" zone="learning" index={2} />
          <NavCard icon={Megaphone} label="Announcements" desc="School-wide notices" to="/announcements" zone="learning" index={3} />
        </div>

        {/* ── Events & content zone ────────────────────────────────────── */}
        <SectionHeader eyebrow="Events & content" title="Engage your students" zone="platform" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Calendar} label="Create Event" desc="Post a competition" to="/events/create" zone="platform" index={0} />
          <NavCard icon={BookOpen} label="Upload Resource" desc="Share study material" to="/resources/upload" zone="platform" index={1} />
          <NavCard icon={Trophy} label="Leaderboard" desc="Student rankings" to="/leaderboard" zone="platform" index={2} />
          <NavCard icon={Award} label="Certificates" desc="Issue certificates" to="/certificates" zone="platform" index={3} />
        </div>

        {/* ── AI zone ────────────────────────────────────────────────────── */}
        <SectionHeader eyebrow="AI Suite" title="Analyse your school" zone="ai" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <NavCard icon={Brain} label="School Analyst" desc="AI performance insights" to="/ai/study" zone="ai" index={0} />
          <NavCard icon={Sparkles} label="Platform Bot" desc="Your campus guide" to="/ai/bot" zone="ai" index={1} />
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const roleData = data?.usersByRole
    ? Object.entries(data.usersByRole).map(([role, count]) => ({ name: role, count }))
    : [];
  const ROLE_COLORS = ['#8b5cf6', '#00d4ff', '#00ff9d', '#f59e0b'];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <PageHero
          title="Admin panel"
          sub="Platform-wide management and oversight."
        />

        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Building2} label="Schools" value={s.totalSchools} zone="overview" index={0} />
            <StatCard icon={Users} label="Users" value={s.totalUsers} zone="overview" index={1} />
            <StatCard icon={Calendar} label="Events" value={s.totalEvents} zone="overview" index={2} />
            <StatCard icon={BookOpen} label="Resources" value={s.totalResources} zone="overview" index={3} />
          </div>
        )}

        {roleData.length > 0 && (
          <div className="chart-card reveal mt-6">
            <h3 className="chart-title">
              <Users size={16} style={{ color: ZONE.learning.hex }} />
              Users by Role
              <span className="ml-auto text-xs text-slate-600 font-normal">total: {s.totalUsers}</span>
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
            <SectionHeader eyebrow="Activity" title="Recently joined schools" zone="learning" />
            <div className="space-y-2">
              {data.recentSchools.map((school, i) => (
                <Link key={school.id} to={`/schools/${school.id}`}
                  className={`flex items-center justify-between p-4 rounded-2xl glass border-transparent hover:border-cyan-500/25 transition-all duration-200 hover:-translate-x-0.5 reveal delay-${Math.min(i + 1, 5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: `linear-gradient(135deg, ${ZONE.overview.hex}, ${ZONE.learning.hex})`, boxShadow: `0 0 14px -3px ${ZONE.overview.hex}` }}>
                      {school.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-200 font-semibold text-sm">{school.name}</p>
                      <p className="text-slate-600 text-xs">{school.location} · {school._count?.members} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs">{new Date(school.createdAt).toLocaleDateString()}</span>
                    <ArrowRight size={14} className="text-slate-700" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── Platform zone ─────────────────────────────────────────────── */}
        <SectionHeader eyebrow="Platform" title="Oversight tools" zone="platform" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <NavCard icon={Building2} label="All Schools" desc="View and manage all schools" to="/schools" zone="platform" index={0} />
          <NavCard icon={Calendar} label="All Events" desc="Monitor competitions" to="/events" zone="platform" index={1} />
          <NavCard icon={BookOpen} label="All Resources" desc="Review uploaded content" to="/resources" zone="platform" index={2} />
        </div>
      </div>
    </Layout>
  );
};

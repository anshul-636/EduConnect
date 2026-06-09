import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Calendar, BookOpen, Award, Trophy,
  Users, Activity, Building2, ClipboardList, UserCheck, Megaphone
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import useAuthStore from '../../store/authStore';
import dashboardService from '../../services/dashboardService';

// ─── Shared UI ────────────────────────────────────────────────────────────────

const STATUS_COLOR = { PUBLISHED:'#60a5fa', OPEN:'#34d399', ONGOING:'#fbbf24', COMPLETED:'#94a3b8', DRAFT:'#475569' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-dark-400 text-xs mb-1">{label}</p>
      {payload.map((p,i) => (
        <p key={i} className="text-xs font-semibold" style={{color:p.color}}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, gradient, iconColor }) => (
  <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 relative overflow-hidden">
    <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${gradient}`}/>
    <div className="relative">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${gradient}`}>
        <Icon size={18} className="text-white"/>
      </div>
      <p className="text-dark-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="font-display font-bold text-2xl text-dark-50 mt-1">
        {value === null || value === undefined ? '—' : value}
      </p>
      {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
    </div>
  </div>
);

const NavCard = ({ icon: Icon, label, desc, to, gradient }) => (
  <Link to={to} className="group bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-2xl p-5 transition-all hover:shadow-lg">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 ${gradient}`}>
      <Icon size={18} className="text-white"/>
    </div>
    <h3 className="text-dark-100 font-semibold text-sm group-hover:text-white transition-colors">{label}</h3>
    <p className="text-dark-500 text-xs mt-1 leading-relaxed">{desc}</p>
  </Link>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-dark-500 text-xs font-bold uppercase tracking-widest mb-3 mt-6">{children}</h2>
);

const Loader = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-dark-800 rounded-2xl animate-pulse"/>)}
  </div>
);

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(r => setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-dark-50">Welcome back, {user?.name} 👋</h1>
          <p className="text-dark-400 text-sm mt-1">Here's your learning overview for today.</p>
        </div>

        {loading ? <Loader/> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Calendar}  label="Events Joined"   value={s.registeredEvents} sub={`${s.completedEvents||0} completed`} gradient="from-brand-600 to-purple-700"/>
            <StatCard icon={BookOpen}  label="Resources"       value={s.uploadedResources} gradient="from-pink-600 to-rose-700"/>
            <StatCard icon={Trophy}    label="Best Rank"       value={s.bestRank ? `#${s.bestRank}` : '—'} sub={s.bestRankEvent} gradient="from-amber-500 to-orange-600"/>
            <StatCard icon={Award}     label="Certificates"    value={s.certificates} gradient="from-emerald-600 to-teal-700"/>
          </div>
        )}

        {/* Score trend chart */}
        {data?.scoreTrend?.length > 1 && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6">
            <h3 className="text-dark-200 font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-brand-400"/> Score Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.scoreTrend.map(t=>({ name: t.event?.title?.slice(0,10)||'Event', score: t.score }))}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="score" name="Score" stroke="#a855f7" strokeWidth={2} fill="url(#sg)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent events */}
        {data?.recentActivity?.length > 0 && (
          <>
            <SectionTitle>Recent Events</SectionTitle>
            <div className="space-y-2 mb-6">
              {data.recentActivity.map(ev => (
                <Link key={ev.id} to={`/events/${ev.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-brand-500/30 transition-all">
                  <div>
                    <p className="text-dark-100 font-medium text-sm">{ev.title}</p>
                    <p className="text-dark-500 text-xs mt-0.5">{ev.category} · {new Date(ev.eventDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:`${STATUS_COLOR[ev.status]}22`,color:STATUS_COLOR[ev.status]}}>{ev.status}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <SectionTitle>Quick Access</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}        label="Classes"       desc="View enrolled classes"       to="/classes"       gradient="from-cyan-600 to-blue-700"/>
          <NavCard icon={ClipboardList} label="Assignments"  desc="Pending work & grades"       to="/assignments"  gradient="from-violet-600 to-purple-700"/>
          <NavCard icon={UserCheck}    label="Attendance"    desc="Your attendance record"      to="/attendance"   gradient="from-emerald-600 to-teal-700"/>
          <NavCard icon={Megaphone}    label="Announcements" desc="School notices"              to="/announcements" gradient="from-amber-500 to-orange-600"/>
          <NavCard icon={Calendar}     label="Events"        desc="Upcoming competitions"       to="/events"       gradient="from-pink-600 to-rose-700"/>
          <NavCard icon={BookOpen}     label="Resources"     desc="Study materials"             to="/resources"    gradient="from-blue-600 to-indigo-700"/>
          <NavCard icon={Trophy}       label="Leaderboard"   desc="Rankings & scores"           to="/leaderboard"  gradient="from-amber-600 to-orange-700"/>
          <NavCard icon={Award}        label="Certificates"  desc="Your achievements"           to="/certificates" gradient="from-green-600 to-teal-700"/>
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

  useEffect(() => {
    dashboardService.getSummary().then(r => setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-dark-50">Teacher Panel</h1>
          <p className="text-dark-400 text-sm mt-1">Hello, {user?.name}.</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={BookOpen}  label="Resources Uploaded" value={s.uploadedResources} gradient="from-brand-600 to-purple-700"/>
            <StatCard icon={Activity}  label="Total Views"        value={s.totalViews}        gradient="from-cyan-600 to-blue-700"/>
            <StatCard icon={TrendingUp} label="Total Upvotes"     value={s.totalUpvotes}      gradient="from-amber-500 to-orange-600"/>
          </div>
        )}

        {/* Top resources bar chart */}
        {data?.topResources?.length > 0 && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6">
            <h3 className="text-dark-200 font-semibold mb-4 flex items-center gap-2"><Activity size={16} className="text-cyan-400"/> Top Resources by Views</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.topResources.map(r=>({ name:r.title.slice(0,14)+'…', views:r.viewCount, upvotes:r.upvotes }))}>
                <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="views" name="Views" fill="#06b6d4" radius={[4,4,0,0]}/>
                <Bar dataKey="upvotes" name="Upvotes" fill="#a855f7" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}        label="My Classes"     desc="Manage your classes"        to="/classes"       gradient="from-cyan-600 to-blue-700"/>
          <NavCard icon={ClipboardList} label="Assignments"   desc="Create & grade work"        to="/assignments"   gradient="from-violet-600 to-purple-700"/>
          <NavCard icon={UserCheck}    label="Attendance"     desc="Mark daily attendance"      to="/attendance"    gradient="from-emerald-600 to-teal-700"/>
          <NavCard icon={Megaphone}    label="Announce"       desc="Post to your school"        to="/announcements" gradient="from-amber-500 to-orange-600"/>
          <NavCard icon={BookOpen}     label="Upload Resource" desc="Share study material"      to="/resources/upload" gradient="from-blue-600 to-indigo-700"/>
          <NavCard icon={Calendar}     label="Events"         desc="Upcoming competitions"      to="/events"        gradient="from-pink-600 to-rose-700"/>
          <NavCard icon={Trophy}       label="Leaderboard"    desc="Student rankings"           to="/leaderboard"   gradient="from-amber-600 to-orange-700"/>
          <NavCard icon={Building2}    label="Schools"        desc="Browse schools"             to="/schools"       gradient="from-green-600 to-teal-700"/>
        </div>
      </div>
    </Layout>
  );
};

// ─── SCHOOL DASHBOARD ─────────────────────────────────────────────────────────
export const SchoolDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(r => setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const s = data?.stats || {};
  const COLORS = ['#a855f7','#06b6d4','#34d399','#f59e0b'];

  const statusData = data ? [
    { name:'Published', value: s.activeEvents||0 },
    { name:'Completed', value: (s.totalEvents||0)-(s.activeEvents||0) },
  ] : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-dark-50">
            {data?.schoolName || 'School Dashboard'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">Manage your school, events and academic records.</p>
        </div>

        {loading ? <Loader/> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users}    label="Students"     value={s.totalStudents}   gradient="from-brand-600 to-purple-700"/>
            <StatCard icon={Activity} label="Teachers"     value={s.totalTeachers}   gradient="from-cyan-600 to-blue-700"/>
            <StatCard icon={Calendar} label="Events"       value={s.totalEvents}     sub={`${s.activeEvents||0} active`} gradient="from-pink-600 to-rose-700"/>
            <StatCard icon={BookOpen} label="Resources"    value={s.totalResources}  gradient="from-amber-500 to-orange-600"/>
          </div>
        )}

        {/* Participation trend + event status */}
        {data?.participationTrend?.length > 1 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-5">
              <h3 className="text-dark-200 font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-pink-400"/> Participation Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data.participationTrend.map(t=>({ month: t.month, count: t.count }))}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="count" name="Registrations" stroke="#ec4899" strokeWidth={2} fill="url(#pg)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {statusData.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
                <h3 className="text-dark-200 font-semibold mb-4 text-sm">Event Status</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {statusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {statusData.map((d,i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-dark-400">{d.name}</span>
                      <span className="text-dark-200 font-semibold ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <SectionTitle>Management</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={Users}        label="Classes"       desc="Manage class sections"      to="/classes"        gradient="from-cyan-600 to-blue-700"/>
          <NavCard icon={ClipboardList} label="Assignments"  desc="Academic tasks"             to="/assignments"    gradient="from-violet-600 to-purple-700"/>
          <NavCard icon={UserCheck}    label="Attendance"    desc="Daily attendance"           to="/attendance"     gradient="from-emerald-600 to-teal-700"/>
          <NavCard icon={Megaphone}    label="Announcements" desc="School-wide notices"        to="/announcements"  gradient="from-amber-500 to-orange-600"/>
          <NavCard icon={Calendar}     label="Create Event"  desc="Post a competition"         to="/events/create"  gradient="from-pink-600 to-rose-700"/>
          <NavCard icon={BookOpen}     label="Resources"     desc="Study material library"     to="/resources"      gradient="from-blue-600 to-indigo-700"/>
          <NavCard icon={Trophy}       label="Leaderboard"   desc="Student rankings"           to="/leaderboard"    gradient="from-amber-600 to-orange-700"/>
          <NavCard icon={Award}        label="Certificates"  desc="Issue certificates"         to="/certificates"   gradient="from-green-600 to-teal-700"/>
        </div>
      </div>
    </Layout>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(r => setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const s = data?.stats || {};
  const roleData = data?.usersByRole ? Object.entries(data.usersByRole).map(([role,count]) => ({ name:role, count })) : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-dark-50">Admin Panel</h1>
          <p className="text-dark-400 text-sm mt-1">Platform-wide management and oversight.</p>
        </div>

        {loading ? <Loader/> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Building2} label="Schools"   value={s.totalSchools}   gradient="from-brand-600 to-purple-700"/>
            <StatCard icon={Users}     label="Users"     value={s.totalUsers}     gradient="from-cyan-600 to-blue-700"/>
            <StatCard icon={Calendar}  label="Events"    value={s.totalEvents}    gradient="from-pink-600 to-rose-700"/>
            <StatCard icon={BookOpen}  label="Resources" value={s.totalResources} gradient="from-amber-500 to-orange-600"/>
          </div>
        )}

        {roleData.length > 0 && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6">
            <h3 className="text-dark-200 font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-cyan-400"/> Users by Role</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={roleData}>
                <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Users" radius={[6,6,0,0]}>
                  {roleData.map((_,i) => <Cell key={i} fill={['#a855f7','#06b6d4','#34d399','#f59e0b'][i%4]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data?.recentSchools?.length > 0 && (
          <>
            <SectionTitle>Recently Joined Schools</SectionTitle>
            <div className="space-y-2 mb-6">
              {data.recentSchools.map(school => (
                <Link key={school.id} to={`/schools/${school.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-brand-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                      {school.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-dark-100 font-medium text-sm">{school.name}</p>
                      <p className="text-dark-500 text-xs">{school.location} · {school._count?.members} members</p>
                    </div>
                  </div>
                  <span className="text-dark-500 text-xs">{new Date(school.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <SectionTitle>Platform</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NavCard icon={Building2}    label="All Schools"  desc="View and manage all schools"  to="/schools"   gradient="from-brand-600 to-purple-700"/>
          <NavCard icon={Calendar}     label="All Events"   desc="Monitor competitions"         to="/events"    gradient="from-pink-600 to-rose-700"/>
          <NavCard icon={BookOpen}     label="All Resources" desc="Review uploaded content"     to="/resources" gradient="from-cyan-600 to-blue-700"/>
        </div>
      </div>
    </Layout>
  );
};

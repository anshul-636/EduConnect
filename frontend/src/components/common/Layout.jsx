import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, CalendarDays, BookOpen, Trophy,
  Award, MessageSquare, Brain, CalendarRange, Settings, Building2,
  Plus, Upload, Users, ClipboardList, UserCheck, Megaphone,
  Bot, ChevronLeft, ChevronRight, LogOut, ArrowLeft,
  Bell, Activity, Shield, Wrench, Sparkles, Menu, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import FloatingBot from '../ai/FloatingBot';
import authService from '../../services/authService';
import NotificationBell from './NotificationBell';

// ─── Section ambient colour map ───────────────────────────────────────────────
const SECTION_COLORS = {
  dashboard: { r: 139, g: 92, b: 246 }, // violet
  learning: { r: 0, g: 212, b: 255 }, // cyan
  platform: { r: 245, g: 158, b: 11 }, // amber
  ai: { r: 0, g: 255, b: 157 }, // neon green
  account: { r: 100, g: 116, b: 139 }, // slate
};

const ROUTE_SECTION_MAP = {
  '/dashboard': 'dashboard',
  '/classes': 'learning',
  '/timetable': 'learning',
  '/assignments': 'learning',
  '/attendance': 'learning',
  '/announcements': 'learning',
  '/schools': 'platform',
  '/events': 'platform',
  '/resources': 'platform',
  '/leaderboard': 'platform',
  '/certificates': 'platform',
  '/forum': 'platform',
  '/ai': 'ai',
  '/settings': 'account',
  '/notifications': 'account',
};

const getSectionForRoute = (pathname) => {
  for (const [prefix, section] of Object.entries(ROUTE_SECTION_MAP)) {
    if (pathname.startsWith(prefix)) return section;
  }
  return 'dashboard';
};

// ─── Role palette ─────────────────────────────────────────────────────────────
const ROLE_COLOR = {
  ADMIN: { from: '#71717a', to: '#52525b', glow: 'rgba(113,113,122,0.5)' },
  SCHOOL: { from: '#8b5cf6', to: '#7c3aed', glow: 'rgba(139,92,246,0.5)' },
  TEACHER: { from: '#f59e0b', to: '#d97706', glow: 'rgba(245,158,11,0.5)' },
  STUDENT: { from: '#8b5cf6', to: '#c026d3', glow: 'rgba(192,38,211,0.5)' },
};

// ─── Navigation config ────────────────────────────────────────────────────────
const NAV = {
  STUDENT: [
    {
      group: 'Overview', section: 'dashboard', items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/student' },
        { icon: Activity, label: 'Progress', to: '/dashboard/student' },
      ]
    },
    {
      group: 'Learning', section: 'learning', items: [
        { icon: Users, label: 'Classes', to: '/classes' },
        { icon: CalendarRange, label: 'Timetable', to: '/timetable' },
        { icon: ClipboardList, label: 'Assignments', to: '/assignments' },
        { icon: UserCheck, label: 'Attendance', to: '/attendance' },
        { icon: Megaphone, label: 'Announcements', to: '/announcements' },
      ]
    },
    {
      group: 'Platform', section: 'platform', items: [
        { icon: Building2, label: 'Schools', to: '/schools' },
        { icon: CalendarDays, label: 'Events', to: '/events' },
        { icon: BookOpen, label: 'Resources', to: '/resources' },
        { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
        { icon: Award, label: 'Certificates', to: '/certificates' },
        { icon: MessageSquare, label: 'Forum', to: '/forum' },
      ]
    },
    {
      group: 'AI Suite', section: 'ai', items: [
        { icon: Brain, label: 'Study Assistant', to: '/ai/study' },
        { icon: CalendarRange, label: 'Study Planner', to: '/ai/planner' },
        { icon: Bot, label: 'Platform Bot', to: '/ai/bot' },
      ]
    },
    {
      group: 'Account', section: 'account', items: [
        { icon: Settings, label: 'Settings', to: '/settings' },
      ]
    },
  ],

  TEACHER: [
    {
      group: 'Overview', section: 'dashboard', items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/teacher' },
      ]
    },
    {
      group: 'Teaching', section: 'learning', items: [
        { icon: Users, label: 'Classes', to: '/classes' },
        { icon: CalendarRange, label: 'Timetable', to: '/timetable' },
        { icon: ClipboardList, label: 'Assignments', to: '/assignments' },
        { icon: UserCheck, label: 'Attendance', to: '/attendance' },
        { icon: Megaphone, label: 'Announcements', to: '/announcements' },
      ]
    },
    {
      group: 'Platform', section: 'platform', items: [
        { icon: Building2, label: 'Schools', to: '/schools' },
        { icon: CalendarDays, label: 'Events', to: '/events' },
        { icon: Upload, label: 'Upload', to: '/resources/upload' },
        { icon: BookOpen, label: 'Resources', to: '/resources' },
        { icon: MessageSquare, label: 'Forum', to: '/forum' },
      ]
    },
    {
      group: 'AI Suite', section: 'ai', items: [
        { icon: Brain, label: 'Lesson Helper', to: '/ai/study' },
        { icon: Bot, label: 'Platform Bot', to: '/ai/bot' },
      ]
    },
    {
      group: 'Account', section: 'account', items: [
        { icon: Settings, label: 'Settings', to: '/settings' },
      ]
    },
  ],

  SCHOOL: [
    {
      group: 'Overview', section: 'dashboard', items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/school' },
        { icon: Wrench, label: 'Manage School', to: '/dashboard/school/manage' },
      ]
    },
    {
      group: 'Academic', section: 'learning', items: [
        { icon: Users, label: 'Classes', to: '/classes' },
        { icon: ClipboardList, label: 'Assignments', to: '/assignments' },
        { icon: UserCheck, label: 'Attendance', to: '/attendance' },
        { icon: Megaphone, label: 'Announcements', to: '/announcements' },
      ]
    },
    {
      group: 'Events & Content', section: 'platform', items: [
        { icon: Plus, label: 'Create Event', to: '/events/create' },
        { icon: CalendarDays, label: 'Events', to: '/events' },
        { icon: Upload, label: 'Upload Resource', to: '/resources/upload' },
        { icon: BookOpen, label: 'Resources', to: '/resources' },
        { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
        { icon: MessageSquare, label: 'Forum', to: '/forum' },
      ]
    },
    {
      group: 'AI Suite', section: 'ai', items: [
        { icon: Brain, label: 'School Analyst', to: '/ai/study' },
        { icon: Bot, label: 'Platform Bot', to: '/ai/bot' },
      ]
    },
    {
      group: 'Account', section: 'account', items: [
        { icon: Settings, label: 'Settings', to: '/settings' },
      ]
    },
  ],

  ADMIN: [
    {
      group: 'Overview', section: 'dashboard', items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard/admin' },
      ]
    },
    {
      group: 'Platform', section: 'platform', items: [
        { icon: Building2, label: 'Schools', to: '/schools' },
        { icon: CalendarDays, label: 'Events', to: '/events' },
        { icon: BookOpen, label: 'Resources', to: '/resources' },
        { icon: MessageSquare, label: 'Forum', to: '/forum' },
      ]
    },
    {
      group: 'AI Suite', section: 'ai', items: [
        { icon: Shield, label: 'Security Bot', to: '/ai/study' },
        { icon: Bot, label: 'Platform Bot', to: '/ai/bot' },
      ]
    },
    {
      group: 'Account', section: 'account', items: [
        { icon: Settings, label: 'Settings', to: '/settings' },
      ]
    },
  ],
};

// ─── Section accent colours by section name ───────────────────────────────────
const SECTION_ACCENTS = {
  dashboard: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', dot: '#8b5cf6' },
  learning: { bg: 'rgba(0,212,255,0.10)', border: 'rgba(0,212,255,0.22)', dot: '#00d4ff' },
  platform: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)', dot: '#f59e0b' },
  ai: { bg: 'rgba(0,255,157,0.09)', border: 'rgba(0,255,157,0.20)', dot: '#00ff9d' },
  account: { bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.2)', dot: '#94a3b8' },
};

// ─── Canvas background ────────────────────────────────────────────────────────
function EduCanvas({ ambientColor }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialise particles
    const N = 60;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.8,
      type: Math.random() < 0.1 ? 'edu' : 'dot', // 10% are edu symbols
    }));
    stateRef.current = { particles };

    // Educational symbols (simplified paths)
    const drawEduSymbol = (ctx, x, y, alpha, color) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.translate(x, y);
      const t = Math.floor(Date.now() / 2000) % 3;
      if (t === 0) {
        // Book
        ctx.beginPath();
        ctx.rect(-8, -6, 16, 12);
        ctx.moveTo(0, -6); ctx.lineTo(0, 6);
        ctx.stroke();
      } else if (t === 1) {
        // Star
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 7, Math.sin(a) * 7);
          ctx.lineTo(Math.cos(b) * 3, Math.sin(b) * 3);
          ctx.stroke();
        }
      } else {
        // Graduation cap
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(0, -5); ctx.lineTo(8, 0);
        ctx.lineTo(0, 5); ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = () => {
      const { r, g, b } = stateRef.current?.ambientColor ||
        { r: 139, g: 92, b: 246 };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = stateRef.current.particles;

      // Move particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = canvas.width; }
        if (p.x > canvas.width) { p.x = 0; }
        if (p.y < 0) { p.y = canvas.height; }
        if (p.y > canvas.height) { p.y = 0; }
      });

      const linkColor = `rgba(${r},${g},${b},0.12)`;
      const dotColor = `rgba(${r},${g},${b},0.55)`;
      const symColor = `rgba(${r},${g},${b},0.2)`;

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = linkColor;
            ctx.lineWidth = 0.5 * (1 - dist / 110);
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      pts.forEach(p => {
        if (p.type === 'edu') {
          drawEduSymbol(ctx, p.x, p.y, 0.18, symColor);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Sync ambient color to ref
  useEffect(() => {
    if (stateRef.current) stateRef.current.ambientColor = ambientColor;
  }, [ambientColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.7,
      }}
    />
  );
}

// ─── Ambient background overlay ───────────────────────────────────────────────
function AmbientOverlay({ ambientColor }) {
  const { r, g, b } = ambientColor;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(${r},${g},${b},0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 90% 90%, rgba(${r},${g},${b},0.05) 0%, transparent 60%)
        `,
        transition: 'background 1.5s ease',
      }}
    />
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [ambientColor, setAmbientColor] = useState({ r: 139, g: 92, b: 246 });

  const [extras, setExtras] = useState(() => {
    if (!user) return {};
    try { return JSON.parse(localStorage.getItem(`ec_profile_${user.id}`) || '{}'); }
    catch { return {}; }
  });

  const saveExtras = (next) => {
    setExtras(next);
    localStorage.setItem(`ec_profile_${user.id}`, JSON.stringify(next));
  };

  // Load profile when modal opens
  useEffect(() => {
    if (profileOpen && !profileData) {
      setProfileLoading(true);
      authService.getMe()
        .then(r => setProfileData(r.data))
        .catch(() => { })
        .finally(() => setProfileLoading(false));
    }
  }, [profileOpen]);

  // Scroll-reactive ambient colour
  useEffect(() => {
    const section = getSectionForRoute(location.pathname);
    setAmbientColor(SECTION_COLORS[section] || SECTION_COLORS.dashboard);
  }, [location.pathname]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Scroll tracking for within-page colour shift
  useEffect(() => {
    const mainEl = document.getElementById('main-scroll');
    if (!mainEl) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainEl;
      const fraction = scrollTop / Math.max(scrollHeight - clientHeight, 1);
      // Blend between current section colour and a deeper shade
      const base = SECTION_COLORS[getSectionForRoute(location.pathname)] || SECTION_COLORS.dashboard;
      const darkened = {
        r: Math.round(base.r * (1 - fraction * 0.3)),
        g: Math.round(base.g * (1 - fraction * 0.3)),
        b: Math.min(255, Math.round(base.b * (1 + fraction * 0.1))),
      };
      setAmbientColor(darkened);
    };

    mainEl.addEventListener('scroll', onScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, [location.pathname, children]);

  const navGroups = NAV[user?.role] || [];
  const roleColor = ROLE_COLOR[user?.role] || ROLE_COLOR.STUDENT;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const section = getSectionForRoute(location.pathname);
  const sectionAccent = SECTION_ACCENTS[section] || SECTION_ACCENTS.dashboard;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}>

      {/* ── Canvas + ambient bg ─────────────────────────────────────────── */}
      <EduCanvas ambientColor={ambientColor} />
      <AmbientOverlay ambientColor={ambientColor} />

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`ec-sidebar ${mobileOpen ? 'ec-sidebar-mobile-open' : ''}`}
        style={{
          position: 'relative', zIndex: 41,
          width: sidebarOpen ? '240px' : '64px',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
          background: 'rgba(4, 6, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', height: '58px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: sidebarOpen ? '0 16px' : '0',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: '12px', flexShrink: 0,
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '15px',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: `0 0 16px -4px ${roleColor.glow}`,
            flexShrink: 0,
          }}>E</div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '15px', color: '#f1f5f9', lineHeight: 1.2, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                EduConnect
              </div>
              <div style={{ fontSize: '10px', color: '#475569', fontWeight: '500', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                EDUCATION PLATFORM
              </div>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ec-mobile-close"
            style={{
              display: 'none',
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: '#94a3b8', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Toggle button (desktop only) */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="ec-sidebar-toggle"
          style={{
            position: 'absolute', top: '20px', right: '-12px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'rgba(10,15,35,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }} className="scrollbar-thin">
          {navGroups.map((group) => {
            const accent = SECTION_ACCENTS[group.section] || SECTION_ACCENTS.dashboard;
            return (
              <div key={group.group} style={{ marginBottom: '4px' }}>
                {sidebarOpen && (
                  <div style={{
                    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '0.15em', color: '#334155',
                    padding: '8px 10px 4px', display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: accent.dot, display: 'inline-block', flexShrink: 0 }} />
                    {group.group}
                  </div>
                )}
                {group.items.map(({ icon: Icon, label, to }) => {
                  const active = location.pathname === to ||
                    (to.length > 12 && location.pathname.startsWith(to));
                  return (
                    <Link
                      key={to + label}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      title={!sidebarOpen ? label : undefined}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: sidebarOpen ? '10px' : '0',
                        padding: sidebarOpen ? '8px 10px' : '10px',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '13px', fontWeight: '500',
                        transition: 'all 0.15s ease',
                        color: active ? '#f1f5f9' : '#475569',
                        background: active ? accent.bg : 'transparent',
                        borderLeft: active && sidebarOpen ? `2px solid ${accent.dot}` : '2px solid transparent',
                        boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#cbd5e1'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } }}
                    >
                      <Icon
                        size={15}
                        style={{ flexShrink: 0, color: active ? accent.dot : 'currentColor' }}
                      />
                      {sidebarOpen && (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: active ? accent.dot : 'inherit' }}>
                          {label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '10px 8px', flexShrink: 0,
        }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setProfileOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  flex: 1, minWidth: 0, padding: '8px',
                  borderRadius: '10px', background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '11px',
                  boxShadow: `0 0 10px -3px ${roleColor.glow}`,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ color: '#334155', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.role}</div>
                </div>
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '7px', borderRadius: '8px', background: 'transparent', border: 'none',
                  color: '#334155', cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                title="Sign out"
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setProfileOpen(true)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'center',
                padding: '6px', borderRadius: '10px', background: 'transparent', border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '11px',
                boxShadow: `0 0 12px -3px ${roleColor.glow}`,
              }}>
                {initials}
              </div>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Topbar */}
        <header style={{
          height: '58px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(4, 6, 18, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="ec-mobile-menu-btn"
              style={{
                display: 'none',
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Menu size={15} />
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                background: 'transparent', border: '1px solid transparent',
                color: '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <ArrowLeft size={13} />
              <span className="ec-back-label">Back</span>
            </button>

            {/* Ambient section indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              background: sectionAccent.bg,
              border: `1px solid ${sectionAccent.border}`,
              fontSize: '11px', fontWeight: '600', color: sectionAccent.dot,
              textTransform: 'capitalize', letterSpacing: '0.02em',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sectionAccent.dot, display: 'inline-block' }} />
              {section}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell />
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.07)' }} />
            <button
              onClick={() => setProfileOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px', borderRadius: '10px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px',
                background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '10px',
                boxShadow: `0 0 10px -3px ${roleColor.glow}`,
              }}>
                {initials}
              </div>
              <span className="ec-topbar-name" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>{user?.name?.split(' ')[0]}</span>
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                background: sectionAccent.bg, color: sectionAccent.dot,
                border: `1px solid ${sectionAccent.border}`,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{user?.role}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          id="main-scroll"
          style={{
            flex: 1, overflowY: 'auto',
            padding: '28px 28px 40px',
            position: 'relative',
          }}
          className="scrollbar-thin"
        >
          {/* Subtle grid overlay */}
          <div style={{
            position: 'fixed', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      <FloatingBot />

      {/* ── Profile modal ───────────────────────────────────────────────── */}
      {profileOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setProfileOpen(false); setIsEditing(false); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{
            background: 'rgba(8,12,28,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(139,92,246,0.1)',
            width: '100%', maxWidth: '360px',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Cover */}
            <div style={{
              height: '100px',
              background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
              position: 'relative',
            }}>
              <button
                onClick={() => { setProfileOpen(false); setIsEditing(false); }}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)', border: 'none',
                  color: 'white', cursor: 'pointer', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
              >
                <X size={13} />
              </button>
              <div style={{
                position: 'absolute', bottom: '-36px', left: '20px',
                width: '72px', height: '72px', borderRadius: '16px',
                border: '3px solid rgba(8,12,28,0.97)',
                overflow: 'hidden', boxShadow: `0 0 20px -4px ${roleColor.glow}`,
              }}>
                {extras.profilePic
                  ? <img src={extras.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '22px', fontFamily: "'Space Grotesk', sans-serif" }}>{initials}</div>
                }
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: '48px', padding: '48px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>{user?.name}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>{user?.email}</div>
                  <div style={{
                    display: 'inline-block', marginTop: '6px',
                    fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em',
                    padding: '3px 10px', borderRadius: '20px',
                    background: sectionAccent.bg, color: sectionAccent.dot,
                    border: `1px solid ${sectionAccent.border}`,
                  }}>{user?.role}</div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    fontSize: '12px', fontWeight: '600',
                    color: '#a78bfa', background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    padding: '6px 12px', borderRadius: '10px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                >
                  {isEditing ? 'View' : 'Edit'}
                </button>
              </div>

              {profileLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }} className="scrollbar-thin">
                  {[['Bio', 'bio', true], ['School', 'school', false], ['Location', 'location', false], ['Specialisation', 'specialisation', false]].map(([label, key, multi]) => (
                    <div key={key}>
                      <div style={{ fontSize: '10px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{label}</div>
                      {multi ? (
                        <textarea
                          value={extras[key] || ''}
                          onChange={e => setExtras(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: '100%', background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', color: '#e2e8f0', fontSize: '13px', resize: 'none', height: '64px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                          placeholder="Tell us about yourself…"
                        />
                      ) : (
                        <input
                          value={extras[key] || ''}
                          onChange={e => setExtras(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: '100%', background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                          placeholder={label}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => { saveExtras(extras); setIsEditing(false); }}
                    style={{
                      padding: '10px', borderRadius: '10px', border: 'none',
                      background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})`,
                      color: 'white', fontWeight: '700', fontSize: '13px',
                      cursor: 'pointer', marginTop: '4px',
                      boxShadow: `0 0 16px -4px ${roleColor.glow}`,
                    }}
                  >Save Changes</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {extras.bio && (
                    <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.5 }}>{extras.bio}</div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      ['Joined', profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : '—'],
                      ['School', extras.school || profileData?.school?.name || '—'],
                      ['Location', extras.location || '—'],
                      ['Role', extras.specialisation || user?.role || '—'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(15,22,45,0.8)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px', borderRadius: '10px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }

        /* ── Mobile drawer behaviour ──────────────────────────────────────── */
        @media (max-width: 860px) {
          .ec-sidebar {
            position: fixed !important;
            top: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16,1,0.3,1) !important;
          }
          .ec-sidebar-mobile-open { transform: translateX(0); }
          .ec-sidebar-toggle { display: none !important; }
          .ec-mobile-close { display: flex !important; }
          .ec-mobile-menu-btn { display: flex !important; }
          .ec-back-label { display: none; }
          .ec-topbar-name { display: none; }
        }
      `}</style>
    </div>
  );
}
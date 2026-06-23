import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  ArrowRight, BookOpen, Brain, Trophy, Shield, Zap, Calendar,
  Users, Star, ChevronRight, GraduationCap, MessageSquare, FileText
} from 'lucide-react';

/* ─── Scroll-Reveal Hook ─────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.land-reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('land-visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Animated Study Background ─────────────────────────────────────────── */
const StudyBg = () => {
  const ICONS = [
    { svg: '📐', x: 8, y: 15, dur: 12 }, { svg: '🧬', x: 85, y: 12, dur: 14 },
    { svg: '📚', x: 20, y: 70, dur: 16 }, { svg: '✏️', x: 75, y: 65, dur: 11 },
    { svg: '🔬', x: 50, y: 8, dur: 13 }, { svg: '🔭', x: 90, y: 45, dur: 15 },
    { svg: '💡', x: 5, y: 50, dur: 17 }, { svg: '📊', x: 65, y: 80, dur: 12 },
    { svg: '🧮', x: 35, y: 88, dur: 14 }, { svg: '⚗️', x: 92, y: 80, dur: 16 },
    { svg: '📝', x: 15, y: 35, dur: 18 }, { svg: '🎓', x: 55, y: 50, dur: 10 },
  ];

  // Floating math/formula strings
  const FORMULAS = [
    { txt: 'E = mc²', x: 12, y: 25, dur: 20 },
    { txt: 'F = ma', x: 80, y: 30, dur: 18 },
    { txt: 'PV = nRT', x: 60, y: 10, dur: 22 },
    { txt: '∑F = 0', x: 30, y: 80, dur: 19 },
    { txt: 'λ = h/mv', x: 70, y: 72, dur: 24 },
    { txt: 'a² + b² = c²', x: 5, y: 60, dur: 21 },
  ];

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) rotate(0deg);  opacity: 0.08; }
          33%  { transform: translateY(-22px) rotate(6deg); opacity: 0.14; }
          66%  { transform: translateY(-10px) rotate(-4deg); opacity: 0.1; }
          100% { transform: translateY(0px) rotate(0deg);  opacity: 0.08; }
        }
        @keyframes driftX {
          0%,100% { transform: translateX(0);  opacity: 0.06; }
          50%      { transform: translateX(12px); opacity: 0.1; }
        }
        @keyframes land-slideUp {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes land-fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes pulseGlow {
          0%,100% { opacity:0.06; transform:scale(1); }
          50%     { opacity:0.14; transform:scale(1.08); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        .land-reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        .land-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .land-delay-1 { transition-delay: 0.1s; }
        .land-delay-2 { transition-delay: 0.2s; }
        .land-delay-3 { transition-delay: 0.3s; }
        .land-delay-4 { transition-delay: 0.4s; }
        .land-delay-5 { transition-delay: 0.5s; }
        .land-delay-6 { transition-delay: 0.6s; }

        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa, #818cf8, #6ee7b7, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-hover {
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 60px -10px rgba(124,58,237,0.2);
        }
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(124,58,237,0.5), rgba(99,102,241,0.3), rgba(124,58,237,0.5));
          background-size: 300% 300%;
          animation: borderSpin 4s linear infinite;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-border:hover::before { opacity: 1; }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Base background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #030712 0%, #050b1a 40%, #07021a 70%, #030712 100%)' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)' }} />

        {/* Aurora orbs */}
        <div className="absolute top-0 right-0 rounded-full" style={{ width: 800, height: 800, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'pulseGlow 7s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 rounded-full" style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'pulseGlow 9s ease-in-out infinite 3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 1000, height: 400, background: 'radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)', animation: 'pulseGlow 11s ease-in-out infinite 6s' }} />

        {/* Floating emoji icons */}
        {ICONS.map((ic, i) => (
          <div key={i} className="absolute text-3xl select-none"
            style={{ left: `${ic.x}%`, top: `${ic.y}%`, animation: `floatUp ${ic.dur}s ease-in-out infinite ${i * 1.1}s` }}>
            {ic.svg}
          </div>
        ))}

        {/* Floating formula text */}
        {FORMULAS.map((f, i) => (
          <div key={i} className="absolute font-mono text-sm font-bold select-none"
            style={{ left: `${f.x}%`, top: `${f.y}%`, color: 'rgba(167,139,250,0.18)', animation: `driftX ${f.dur}s ease-in-out infinite ${i * 2}s`, letterSpacing: '0.05em' }}>
            {f.txt}
          </div>
        ))}
      </div>
    </>
  );
};

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Brain, title: 'AI Study Assistant', desc: 'Get instant answers, generate custom study plans, and have complex textbooks explained in plain language—powered by Gemini AI.', tag: 'AI-Powered' },
  { icon: Calendar, title: 'Smart Timetables', desc: 'Schools build weekly timetables assigning specific teachers to each subject slot. Students and teachers see their schedules in real-time.', tag: 'Live Sync' },
  { icon: Trophy, title: 'Gamified Learning', desc: 'Earn XP, unlock digital certificates, and compete on inter-school leaderboards that make academic progress genuinely exciting.', tag: 'Engagement' },
  { icon: FileText, title: 'Assignment Hub', desc: 'Teachers post assignments with deadlines. Students submit directly on the platform. Auto-grading and feedback loops built in.', tag: 'Assignments' },
  { icon: MessageSquare, title: 'Community Forums', desc: 'A rich discussion space where students can ask questions, share knowledge, and get peer-to-peer support 24/7.', tag: 'Community' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Four distinct portals—Admin, School, Teacher, Student—each with precisely scoped permissions and tailored dashboards.', tag: 'Security' },
];

const STATS = [
  { value: '5,000+', label: 'Active Students' },
  { value: '120+', label: 'Schools Onboarded' },
  { value: '1,800+', label: 'Lessons Uploaded' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Class 12 Student', text: "EduConnect's AI assistant helped me understand complex physics concepts I had been struggling with for months. My grades improved dramatically!", avatar: '👩‍🎓' },
  { name: 'Mr. Arun Kumar', role: 'Mathematics Teacher', text: 'Managing attendance, assignments, and class timetables from one place is a game-changer. I save hours of paperwork every single week.', avatar: '👨‍🏫' },
  { name: 'Sunita Patel', role: 'School Administrator', text: 'The school management dashboard gives me instant visibility across all classes and teachers. The interface is simply beautiful.', avatar: '👩‍💼' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up as a School, Teacher, or Student in under 60 seconds. Google OAuth makes it instantly accessible.' },
  { step: '02', title: 'Connect to Your School', desc: "Join your school's network. Teachers set up classes; students enroll and see their timetable automatically." },
  { step: '03', title: 'Start Learning & Growing', desc: 'Access AI tools, attend live announcements, submit assignments, and track your progress on leaderboards.' },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, tag, delay }) => (
  <div className={`land-reveal land-delay-${delay} card-hover glow-border relative bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-7 flex flex-col gap-4`}>
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <Icon size={22} className="text-brand-300" />
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>{tag}</span>
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed flex-1">{desc}</p>
    <div className="flex items-center gap-1 text-brand-400 text-sm font-semibold mt-1 group cursor-pointer w-fit">
      Learn more <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const TestimonialCard = ({ name, role, text, avatar, delay }) => (
  <div className={`land-reveal land-delay-${delay} card-hover bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 flex flex-col gap-4`} style={{ backdropFilter: 'blur(12px)' }}>
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" className="text-amber-400" />)}
    </div>
    <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
    <div className="flex items-center gap-3 pt-2 border-t border-white/5">
      <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-xl border border-white/10">{avatar}</div>
      <div>
        <p className="text-white font-semibold text-sm">{name}</p>
        <p className="text-slate-500 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Landing() {
  useReveal();

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden font-sans selection:bg-brand-500/30">
      <StudyBg />

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center border-b border-white/5" style={{ background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">EduConnect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How it Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-44 pb-28 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 land-reveal" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-brand-200 uppercase">Platform now live — Join 5,000+ students</span>
        </div>

        <h1 className="land-reveal land-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-black tracking-tight leading-[1.08] mb-8">
          The Modern&nbsp;
          <span className="shimmer-text">Education OS</span>
          <br />for Every School
        </h1>

        <p className="land-reveal land-delay-2 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-12">
          One hyper-intelligent platform connecting Schools, Teachers, and Students. AI-powered study tools, live timetables, gamified leaderboards, and rich community forums—all in one stunning interface.
        </p>

        <div className="land-reveal land-delay-3 flex flex-col sm:flex-row justify-center gap-5 mb-20">
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            Start for free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300">
            Sign in to Dashboard
          </Link>
        </div>

        {/* ── Stats row ─ */}
        <div className="land-reveal land-delay-4 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="py-8 px-6 text-center" style={{ background: 'rgba(3,7,18,0.7)' }}>
              <p className="text-2xl sm:text-3xl font-black text-white mb-1 shimmer-text">{value}</p>
              <p className="text-slate-500 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16 land-reveal">
          <p className="text-brand-400 font-bold uppercase tracking-widest text-xs mb-4">Everything you need</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">A feature-set that puts other<br/>platforms to shame</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">From AI tutoring to automated attendance tracking—EduConnect handles it all in one place.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={Math.min(i + 1, 6)} />
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16 land-reveal">
          <p className="text-brand-400 font-bold uppercase tracking-widest text-xs mb-4">Simple onboarding</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Up and running in minutes</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">No complex installations. No confusing dashboards. EduConnect gets out of your way so you can focus on learning.</p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 mt-12">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div key={i} className={`land-reveal land-delay-${i + 1} relative text-center`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-black text-white mb-6 mx-auto"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.3))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 30px rgba(124,58,237,0.15)' }}>
                {step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section id="testimonials" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16 land-reveal">
          <p className="text-brand-400 font-bold uppercase tracking-widest text-xs mb-4">Loved by learners</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Trusted by educators & students</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Real stories from real people whose academic lives have been transformed.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} {...t} delay={i + 1} />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-white/[0.06]">
        <div className="land-reveal max-w-4xl mx-auto text-center rounded-3xl p-16 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.08))', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 80px rgba(124,58,237,0.08)' }}>
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(circle at center, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
          <GraduationCap size={48} className="text-brand-400 mx-auto mb-6 relative z-10" />
          <h2 className="relative z-10 text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Ready to transform your school?
          </h2>
          <p className="relative z-10 text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of schools already saving time, improving grades, and inspiring students with EduConnect.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
              Get started for free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white border border-white/15 hover:bg-white/5 transition-all">
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06]" style={{ background: 'rgba(3,7,18,0.95)' }}>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                  <GraduationCap size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg text-white">EduConnect</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">A next-generation education management platform designed to empower every school, teacher, and student.</p>
            </div>

            {/* Links */}
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</p>
              <ul className="space-y-3 text-slate-500 text-sm">
                {['AI Study Assistant', 'Timetables', 'Assignments', 'Leaderboards', 'Forums'].map(l => (
                  <li key={l}><Link to="/login" className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Users</p>
              <ul className="space-y-3 text-slate-500 text-sm">
                {['For Schools', 'For Teachers', 'For Students', 'For Admins'].map(l => (
                  <li key={l}><Link to="/register" className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Account</p>
              <ul className="space-y-3 text-slate-500 text-sm">
                {[['Sign In', '/login'], ['Register', '/register'], ['Forgot Password', '/forgot-password']].map(([l, to]) => (
                  <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} EduConnect. All rights reserved.</p>
            <div className="flex items-center gap-6 text-slate-600 text-xs">
              <span>Made with ❤️ for educators</span>
              <span className="flex items-center gap-1.5"><Users size={12} /> 5,000+ users</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const ROLES = ['STUDENT', 'TEACHER', 'SCHOOL', 'ADMIN'];
const ROLE_INFO = {
    STUDENT: { icon: '🎓', label: 'Student', desc: 'Join events & access study resources', accent: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.45)', glow: 'rgba(124,58,237,0.3)', grad: 'from-brand-600 to-purple-700' },
    TEACHER: { icon: '📚', label: 'Teacher', desc: 'Upload resources & guide students', accent: 'rgba(37,99,235,0.15)', border: 'rgba(59,130,246,0.45)', glow: 'rgba(59,130,246,0.3)', grad: 'from-blue-600 to-indigo-700' },
    SCHOOL: { icon: '🏫', label: 'School', desc: 'Manage events & your school profile', accent: 'rgba(5,150,105,0.15)', border: 'rgba(16,185,129,0.45)', glow: 'rgba(16,185,129,0.3)', grad: 'from-emerald-600 to-teal-700' },
    ADMIN: { icon: '⚙️', label: 'Admin', desc: 'Manage the entire platform', accent: 'rgba(217,119,6,0.15)', border: 'rgba(245,158,11,0.45)', glow: 'rgba(245,158,11,0.3)', grad: 'from-orange-600 to-amber-600' },
};

const StudyBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050b1a] via-[#080f1e] to-[#0a0520]" />
        <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#7c3aed 1px,transparent 1px),linear-gradient(90deg,#7c3aed 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-brand-600/5 blur-[120px]"
            style={{ animation: 'pulseSlow 5s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-700/5 blur-[80px]"
            style={{ animation: 'pulseSlow 5s ease-in-out infinite 2.5s' }} />
        {['📐', '🔬', '📚', '✏️', '🧮', '🔭', '📊', '🧬', '💡', '🎯', '📝', '🧪'].map((icon, i) => (
            <div key={i} className="absolute text-2xl select-none"
                style={{
                    left: `${[8, 85, 15, 78, 50, 92, 5, 65, 35, 72, 25, 55][i]}%`,
                    top: `${[15, 10, 70, 65, 8, 45, 45, 80, 85, 20, 30, 55][i]}%`,
                    opacity: 0.07,
                    animation: `floatRandom ${6 + i * 0.4}s linear infinite`,
                    animationDelay: `${i * 0.5}s`,
                }}>
                {icon}
            </div>
        ))}
    </div>
);

const GoogleRoleSelect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuthStore();

    const [pending, setPending] = useState(null);
    const [role, setRole] = useState('STUDENT');
    const [schoolId, setSchoolId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const raw = searchParams.get('pending');
            if (!raw) { navigate('/register'); return; }
            const profile = JSON.parse(decodeURIComponent(raw));
            if (!profile.email || !profile.googleId) { navigate('/register'); return; }
            setPending(profile);
        } catch {
            navigate('/register');
        }
    }, []);

    const handleComplete = async () => {
        if (!pending) return;
        setLoading(true); setError('');
        try {
            const res = await api.post('/auth/google/complete', {
                email: pending.email,
                name: pending.name,
                googleId: pending.googleId,
                role,
                ...(schoolId.trim() ? { schoolId: schoolId.trim() } : {}),
            });
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            const DASH = { ADMIN: '/dashboard/admin', SCHOOL: '/dashboard/school', TEACHER: '/dashboard/teacher', STUDENT: '/dashboard/student' };
            navigate(DASH[user.role] || '/dashboard/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete sign-up. Please try again.');
        } finally { setLoading(false); }
    };

    if (!pending) {
        return (
            <div className="min-h-screen bg-[#080f1e] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    const info = ROLE_INFO[role];

    return (
        <>
            <style>{`
        @keyframes pulseSlow{0%,100%{opacity:0.05;transform:scale(1);}50%{opacity:0.1;transform:scale(1.1);}}
        @keyframes floatRandom{0%,100%{transform:translateY(0)rotate(0);opacity:0.07;}40%{transform:translateY(-20px)rotate(6deg);opacity:0.13;}70%{transform:translateY(-10px)rotate(-4deg);opacity:0.09;}}
        @keyframes glassIn{from{opacity:0;transform:scale(0.96)translateY(12px);}to{opacity:1;transform:scale(1)translateY(0);}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .glass-card{background:rgba(15,23,42,0.78);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(124,58,237,0.2);box-shadow:0 0 0 1px rgba(168,85,247,0.05),0 32px 64px -16px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04);}
        .animate-glass-in{animation:glassIn 0.5s cubic-bezier(0.16,1,0.3,1) both;}
        .animate-slide-up{animation:slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;}
        .role-card{border-radius:16px;padding:18px 16px;text-align:left;cursor:pointer;transition:all 0.22s;border:1.5px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);}
        .role-card:hover{background:rgba(255,255,255,0.055);border-color:rgba(255,255,255,0.13);transform:translateY(-1px);}
        .btn-glow{background:linear-gradient(135deg,#7c3aed,#9333ea,#a855f7);color:white;font-weight:700;border-radius:14px;padding:14px 20px;width:100%;border:none;cursor:pointer;transition:all 0.25s;font-size:0.95rem;letter-spacing:0.01em;box-shadow:0 0 28px -6px rgba(168,85,247,0.5);}
        .btn-glow:hover{transform:translateY(-2px);box-shadow:0 0 36px -4px rgba(168,85,247,0.65);}
        .btn-glow:active{transform:translateY(0);}
        .btn-glow:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .glass-input{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);color:#f1f5f9;border-radius:12px;padding:11px 15px;width:100%;font-size:0.875rem;transition:all 0.2s;outline:none;}
        .glass-input::placeholder{color:rgba(148,163,184,0.45);}
        .glass-input:focus{border-color:rgba(168,85,247,0.5);background:rgba(255,255,255,0.06);box-shadow:0 0 0 3px rgba(168,85,247,0.12);}
      `}</style>

            <div className="min-h-screen relative flex items-center justify-center p-4 py-10">
                <StudyBackground />

                <div className="relative z-10 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-7 animate-slide-up">
                        <div className="inline-flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center"
                                style={{ boxShadow: '0 0 24px -4px rgba(168,85,247,0.55)' }}>
                                <span className="text-xl">🎓</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">EduConnect</span>
                        </div>

                        {/* Google avatar / greeting */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white"
                            style={{ boxShadow: '0 0 24px -6px rgba(168,85,247,0.5)' }}>
                            {pending.name?.[0]?.toUpperCase() || '?'}
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-1">Almost there, {pending.name?.split(' ')[0]}!</h1>
                        <p className="text-slate-400 text-sm">
                            One last step — choose how you're joining EduConnect
                        </p>
                        <p className="text-brand-400 text-xs font-medium mt-1">{pending.email}</p>
                    </div>

                    {/* Card */}
                    <div className="glass-card rounded-2xl p-7 animate-glass-in">
                        {error && (
                            <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-sm flex items-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">I'm joining as a...</p>

                        {/* Role grid */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {ROLES.map(r => {
                                const ri = ROLE_INFO[r];
                                const selected = role === r;
                                return (
                                    <button key={r} type="button"
                                        onClick={() => setRole(r)}
                                        className="role-card"
                                        style={selected ? {
                                            background: ri.accent,
                                            border: `1.5px solid ${ri.border}`,
                                            boxShadow: `0 0 20px -8px ${ri.glow}`,
                                            transform: 'translateY(-1px)',
                                        } : {}}>
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ri.grad} flex items-center justify-center mb-3 text-lg shadow-sm`}>
                                            {ri.icon}
                                        </div>
                                        <p className="font-bold text-white text-sm">{ri.label}</p>
                                        <p className="text-slate-500 text-xs mt-0.5 leading-snug">{ri.desc}</p>
                                        {selected && (
                                            <div className="flex items-center gap-1.5 mt-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ri.border }} />
                                                <span className="text-xs font-semibold" style={{ color: ri.border }}>Selected</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* School ID for student/teacher */}
                        {['TEACHER', 'STUDENT'].includes(role) && (
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    School ID <span className="normal-case font-normal text-slate-600">(optional — to auto-join your school)</span>
                                </label>
                                <input
                                    value={schoolId}
                                    onChange={e => setSchoolId(e.target.value)}
                                    className="glass-input"
                                    placeholder="Paste your school's UUID here"
                                />
                            </div>
                        )}

                        {/* Divider with selected role summary */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                            <span className="text-xs text-slate-500 font-medium">
                                Joining as {info.icon} <span className="text-slate-300">{info.label}</span>
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        <button onClick={handleComplete} disabled={loading} className="btn-glow">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : `Join as ${info.label} →`}
                        </button>

                        <p className="text-center text-xs text-slate-600 mt-4">
                            Wrong account?{' '}
                            <a href="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                                Sign up differently
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GoogleRoleSelect;

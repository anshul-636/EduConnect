import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null); // 'disable' or 'delete'

  const handleDisable = async () => {
    setLoading(true);
    try {
      await authService.deactivateAccount();
      logout();
      navigate('/login?msg=account_disabled');
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
      logout();
      navigate('/register?msg=account_deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto animate-fade-in'>
      <header className='mb-8'>
        <h1 className='text-3xl font-display font-bold text-dark-50'>Account Settings</h1>
        <p className='text-dark-400 mt-1'>Manage your profile security and account status</p>
      </header>

      <div className='space-y-6'>
        {/* Profile Info */}
        <section className='card p-6 border-brand-500/20 bg-brand-500/5'>
          <h2 className='text-lg font-display font-semibold text-dark-50 mb-4 flex items-center gap-2'>
            👤 Profile Snapshot
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-xs text-brand-400 font-medium uppercase tracking-wider'>Display Name</p>
              <p className='text-dark-100 font-medium'>{user?.name}</p>
            </div>
            <div>
              <p className='text-xs text-brand-400 font-medium uppercase tracking-wider'>Email Address</p>
              <p className='text-dark-100 font-medium'>{user?.email}</p>
            </div>
            <div>
              <p className='text-xs text-brand-400 font-medium uppercase tracking-wider'>Account Role</p>
              <p className='text-dark-100 font-medium'>{user?.role}</p>
            </div>
          </div>
        </section>

        {/* Safety & Lifecycle */}
        <section className='card overflow-hidden'>
          <div className='p-6 border-b border-dark-800 bg-red-500/5'>
            <h2 className='text-lg font-display font-semibold text-red-400 flex items-center gap-2'>
              🛡️ Account Safety & Data Control
            </h2>
            <p className='text-dark-400 text-sm mt-1'>These actions are significant. Please proceed with caution.</p>
          </div>

          <div className='p-6 space-y-8'>
            {/* Disable */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div>
                <h3 className='font-semibold text-dark-50'>Temporarily Disable Account</h3>
                <p className='text-sm text-dark-400 max-w-md'>
                  This will hide your profile and deactivate your access. All your data remains safe,
                  and you can re-activate it anytime just by logging in again.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm('disable')}
                className='px-6 py-2.5 bg-dark-800 border border-dark-700 text-dark-200 rounded-xl font-medium hover:bg-dark-700 transition-colors whitespace-nowrap'
              >
                Disable Account
              </button>
            </div>

            <div className='h-px bg-dark-800' />

            {/* Delete */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div>
                <h3 className='font-semibold text-red-400'>Permanently Delete Account</h3>
                <p className='text-sm text-dark-400 max-w-md'>
                  Everything—including your certificates, event history, and posts—will be wiped clean.
                  This action is irreversible. You can rejoin with the same email later, but you'll start fresh.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm('delete')}
                className='px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-all whitespace-nowrap'
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className='fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='card max-w-md w-full p-8 animate-scale-in border-red-500/30'>
            <div className='text-4xl mb-4 text-center'>{showConfirm === 'delete' ? '⚠️' : '⏸️'}</div>
            <h3 className='text-2xl font-display font-bold text-dark-50 text-center mb-2'>
              Are you absolutely sure?
            </h3>
            <p className='text-dark-400 text-center mb-8'>
              {showConfirm === 'delete'
                ? "This will erase your entire journey on EduConnect. There is no 'undo' for this."
                : "You can come back anytime, but for now, we'll keep your account on ice."}
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <button
                disabled={loading}
                onClick={() => setShowConfirm(null)}
                className='btn-secondary py-3'
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={showConfirm === 'delete' ? handleDelete : handleDisable}
                className={`py-3 rounded-xl font-bold text-white transition-all ${showConfirm === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-500 hover:bg-brand-600'
                  }`}
              >
                {loading ? 'Processing...' : `Confirm ${showConfirm.charAt(0).toUpperCase() + showConfirm.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

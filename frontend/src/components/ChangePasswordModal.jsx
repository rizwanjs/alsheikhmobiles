import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

export default function ChangePasswordModal({ user, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.warning('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/change-password`, {
        newPassword: newPassword.trim()
      });
      toast.success('Your password has been changed successfully!');
      onClose();
    } catch (err) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        // Fallback for Vercel / Offline mode
        const mockLogins = JSON.parse(localStorage.getItem('als_mock_logins') || '{}');
        mockLogins[user.username.toLowerCase()] = newPassword.trim();
        localStorage.setItem('als_mock_logins', JSON.stringify(mockLogins));
        
        toast.success('Your password has been updated locally (Demo Mode)!');
        onClose();
      } else {
        toast.error(err.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-[400px] frosted-metal rounded-2xl border border-white/10 shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lock_reset</span>
              Change Your Password
            </h4>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant mb-4">
            Update security settings for account <strong className="text-on-surface">@{user.username}</strong> ({user.role}).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                placeholder="Enter new password"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-on-primary font-bold px-4 py-2 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-transform text-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {loading ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

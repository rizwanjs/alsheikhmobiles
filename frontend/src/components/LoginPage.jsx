import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      const { token, username, role } = res.data;
      localStorage.setItem('als_token', token);
      localStorage.setItem('als_user', JSON.stringify({ username, role }));
      onLogin({ username, role, token });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-tertiary/3 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Login Card */}
      <div
        className={`relative w-full max-w-sm transition-all duration-200 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        {/* Glass card */}
        <div className="bg-surface-container/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Top banner */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/10 border-b border-white/5 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-primary text-[32px]">smartphone</span>
            </div>
            <h1 className="font-bold text-xl text-on-surface tracking-tight">Al Sheikh Mobiles</h1>
            <p className="text-on-surface-variant text-xs mt-1 uppercase tracking-widest">Management System</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div className="text-center mb-2">
              <h2 className="font-semibold text-sm text-on-surface">Sign In to Continue</h2>
              <p className="text-on-surface-variant text-xs mt-0.5">Enter your admin credentials</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-error/10 border border-error/30 text-error rounded-xl px-3 py-2.5 text-xs">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">person</span>
                  <input
                    type="text"
                    autoComplete="username"
                    autoFocus
                    className="w-full bg-surface-container border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                    placeholder="admin"
                    value={form.username}
                    onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(''); }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full bg-surface-container border border-white/10 rounded-xl py-3 pl-10 pr-11 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/30 mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 text-center border-t border-white/5 pt-4">
            <div className="flex items-center justify-center gap-1.5 text-secondary text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secure Admin Portal
            </div>
            <p className="text-on-surface-variant text-[10px] mt-1 opacity-60">
              Al Sheikh Mobiles ERP • Hall Road, Lahore
            </p>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-on-surface-variant/40 text-[10px] mt-4">
          Session lasts 7 days. Contact admin if locked out.
        </p>
      </div>

      {/* Shake keyframe via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

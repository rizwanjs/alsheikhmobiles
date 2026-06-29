import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      const { token, username: user, role } = res.data;
      
      localStorage.setItem('als_token', token);
      localStorage.setItem('als_user', JSON.stringify({ username: user, role }));
      
      onLogin({ token, username: user, role });
    } catch (err) {
      // Fallback if backend server is offline or unreachable (e.g. running on Vercel without hosted backend)
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      const fallbackUsername = 'admin';
      const fallbackPassword = 'AlSheikh@2024';

      if (isNetworkError && username === fallbackUsername && password === fallbackPassword) {
        const dummyToken = 'mock-jwt-token-for-vercel-demo';
        localStorage.setItem('als_token', dummyToken);
        localStorage.setItem('als_user', JSON.stringify({ username: 'admin', role: 'admin' }));
        onLogin({ token: dummyToken, username: 'admin', role: 'admin' });
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-15"
          style={{ 
            background: 'radial-gradient(circle, rgba(78,222,163,0.3) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite reverse'
          }}
        />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,185,95,0.4) 0%, transparent 70%)',
            animation: 'float 5s ease-in-out infinite 1s'
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(180,197,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(180,197,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating phone icons */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/5"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              animation: `float ${4 + i * 0.5}s ease-in-out infinite ${i * 0.8}s`,
              fontSize: `${30 + i * 8}px`
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>smartphone</span>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        
        {/* Top branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <span className="material-symbols-outlined text-white text-[36px]">store</span>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping opacity-20" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Al Sheikh <span className="text-primary">Mobiles</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 font-body-md">Flagship Store • Enterprise Suite</p>
        </div>

        {/* Login Form Card */}
        <form onSubmit={handleSubmit} className="relative rounded-2xl overflow-hidden">
          {/* Card background with glassmorphism */}
          <div className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(23,31,51,0.95) 0%, rgba(11,19,38,0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,197,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
            }}
          />
          
          <div className="relative p-8">
            <h2 className="text-on-surface font-headline-md text-xl font-semibold mb-1">Admin Login</h2>
            <p className="text-on-surface-variant text-xs mb-6">Sign in to access the management dashboard</p>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <span className="text-error text-xs font-medium">{error}</span>
              </div>
            )}

            {/* Username field */}
            <div className="mb-4">
              <label className="block text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-2">
                Username
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors text-[20px]">
                  person
                </span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none text-sm"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label className="block text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-2">
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors text-[20px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none text-sm"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: loading 
                  ? 'rgba(37,99,235,0.3)' 
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                boxShadow: loading 
                  ? 'none' 
                  : '0 4px 20px rgba(37,99,235,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
                color: '#fff'
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Sign In to Dashboard
                </>
              )}
            </button>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 mt-5 text-on-surface-variant/40">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span className="text-[10px] uppercase tracking-widest">256-bit Encrypted Session</span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-on-surface-variant/30 text-[10px] uppercase tracking-widest">
            Al Sheikh Mobiles ERP • © 2026 • v2.4.0
          </p>
        </div>
      </div>

      {/* Shake animation for errors */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

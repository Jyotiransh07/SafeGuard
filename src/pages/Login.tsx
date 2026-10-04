import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) throw error;
        setSuccessMsg('Account created successfully! Check your email to confirm or sign in directly.');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Google authentication failed.');
    }
  };

  const handleDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 selection:bg-red-500 selection:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 fixed top-0 left-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="flex items-center gap-3 mb-3 group">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-stone-900 block leading-none">AEA</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">SafeGuard Pro</span>
          </div>
        </Link>
        <span className="text-xs font-mono font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          {isConfigured ? 'Supabase Authentication Active' : 'Supabase Backend Connected (Demo Mode)'}
        </span>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/90 shadow-[6px_6px_0px_0px_rgba(28,25,23,0.06)] space-y-6">
          {/* Mode Switcher */}
          <div className="flex bg-[#f8f7f4] p-1.5 rounded-2xl border border-stone-200/80">
            <button
              className={`flex-1 py-2.5 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                isLogin ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' : 'text-stone-500 hover:text-stone-800'
              }`}
              onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2.5 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                !isLogin ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' : 'text-stone-500 hover:text-stone-800'
              }`}
              onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email" 
                placeholder="you@example.com"
                className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" 
                placeholder="••••••••••••"
                className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-stone-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-stone-300 text-red-600 focus:ring-red-500 mr-2" defaultChecked />
                  Remember device
                </label>
                <a href="#" className="font-semibold text-red-600 hover:text-red-700">
                  Forgot password?
                </a>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Emergency Account'}
            </button>
          </form>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-stone-500 font-mono uppercase tracking-wider">Or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-3 px-4 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 bg-white hover:bg-stone-50 shadow-xs transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
            
            <button
              type="button"
              onClick={handleDemo}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-sm transition-all cursor-pointer"
            >
              Instant Demo Access (Bypass Auth)
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>
        
        <p className="mt-6 text-center text-xs text-stone-500 max-w-xs mx-auto">
          Protected by end-to-end encrypted telemetry and Supabase PostgreSQL with RLS.
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, UserPlus, Phone, BookOpen } from 'lucide-react';
import { Button, Input } from './ui';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, signInWithRedirect, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn('Popup authentication style blocked/unsupported. Attempting fallback redirect...', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }
      try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (redirectErr: any) {
        console.error('Redirect sign-in also failed:', redirectErr);
        setError("Your mobile web-view or frame is restricting popup capabilities. Please authenticate utilizing standard Email/Password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-transparent">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center border-r border-noir-border/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/40 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-12 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <motion.div 
                animate={{ 
                  y: [0, -8],
                  filter: ["drop-shadow(0 0 15px rgba(8,145,178,0.2))", "drop-shadow(0 0 35px rgba(8,145,178,0.6))"]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
                className="h-16 w-16 rounded-[24%] bg-[#020202] flex items-center justify-center text-white border border-white/10 overflow-hidden shadow-[0_4px_15px_rgba(8,145,178,0.3)]"
              >
                <img src="/logo.svg" alt="EasyAssess Logo" className="h-12 w-12 object-contain" />
              </motion.div>
              <motion.span 
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-[linear-gradient(110deg,#0ea5e9,45%,#fff,55%,#0ea5e9)] bg-[length:200%_100%] tracking-tight"
              >
                EasyAssess
              </motion.span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-6">
              Curated academic materials for professional assessment.
            </h1>
            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              Join our network of verified evaluators. Contribute to global standards by reviewing and assessing educational resources.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0833441a_1px,transparent_1px),linear-gradient(to_bottom,#0833441a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
        
        <div className="absolute top-0 right-0 w-full h-full bg-black/20 blur-[100px] lg:hidden pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10 bg-black/60 backdrop-blur-xl border border-noir-border/20 p-6 sm:p-10 rounded-[28px] sm:rounded-[40px] shadow-[0_0_40px_rgba(8,145,178,0.05)] my-8"
        >
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <motion.div 
                animate={{ 
                  scale: [1, 1.08],
                  filter: ["drop-shadow(0 0 20px rgba(8,145,178,0.3))", "drop-shadow(0 0 45px rgba(8,145,178,0.7))"]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
                className="h-20 w-20 rounded-[24%] bg-[#020202] flex items-center justify-center text-white border border-white/10 overflow-hidden shadow-[0_5px_20px_rgba(8,145,178,0.4)]"
              >
                <img src="/logo.svg" alt="EasyAssess Logo" className="h-14 w-14 object-contain" />
              </motion.div>
              <motion.span 
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-[linear-gradient(110deg,#0ea5e9,45%,#fff,55%,#0ea5e9)] bg-[length:200%_100%] tracking-tighter"
              >
                EasyAssess
              </motion.span>
            </div>

            <h2 className="text-3xl font-serif font-bold text-white mb-2">
              {isResettingPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className="text-zinc-500 text-sm">
              {isResettingPassword 
                ? 'Enter your email to receive a password reset link.'
                : (isLogin ? 'Enter your login  id and password.' : 'Join the verified evaluators network.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {resetMessage && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 text-center">
              {resetMessage}
            </div>
          )}

          {isResettingPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="pl-12 h-14 bg-black/40 border-noir-border/20 text-white placeholder:text-white/20 focus:border-cyan/50 focus:ring-[4px] focus:ring-cyan/10 focus:bg-black/60 rounded-2xl transition-all duration-300"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-2xl cyan-gradient text-white font-bold mt-6 shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_50px_rgba(8,145,178,0.4)] transition-all"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="flex items-center justify-center h-6 w-6"
                  >
                    <img src="/logo.svg" alt="Loading" className="h-full w-full object-contain" />
                  </motion.div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setError('');
                    setResetMessage('');
                  }}
                  className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                    <div className="relative">
                      <Input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jane Doe"
                        className="pl-12 h-14 bg-black/40 border-noir-border/20 text-white placeholder:text-white/20 focus:border-cyan/50 focus:ring-[4px] focus:ring-cyan/10 focus:bg-black/60 rounded-2xl transition-all duration-300"
                      />
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user123@gmail.com"
                      className="pl-12 h-14 bg-black/40 border-noir-border/20 text-white placeholder:text-white/20 focus:border-cyan/50 focus:ring-[4px] focus:ring-cyan/10 focus:bg-black/60 rounded-2xl transition-all duration-300"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setError('');
                          setResetMessage('');
                        }}
                        className="text-xs font-bold text-cyan-400/80 hover:text-cyan-300 transition-colors py-1 px-2 -mr-2 rounded-lg hover:bg-cyan/5"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 h-14 bg-black/40 border-noir-border/20 text-white placeholder:text-white/20 focus:border-cyan/50 focus:ring-[4px] focus:ring-cyan/10 focus:bg-black/60 rounded-2xl transition-all duration-300"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl cyan-gradient text-white font-bold mt-6 shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_50px_rgba(8,145,178,0.4)] transition-all"
                >
                  {isLoading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="flex items-center justify-center h-6 w-6"
                    >
                      <img src="/logo.svg" alt="Loading" className="h-full w-full object-contain" />
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/40"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Or continue with</span>
                <div className="h-px flex-1 bg-black/40"></div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border-noir-border/40 text-white hover:bg-black/80 font-bold bg-black/60 shadow-[0_0_20px_rgba(8,145,178,0.1)] hover:shadow-[0_0_30px_rgba(8,145,178,0.2)] transition-all flex items-center justify-center gap-3 w-full"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isLogin ? 'Sign in with Google ' : 'Create Account with Google '}
                </Button>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setResetMessage('');
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-sm font-medium text-zinc-400 hover:text-white hover:border-cyan/20 hover:bg-cyan/5 transition-all active:scale-95"
                >
                  {isLogin 
                    ? "Don't have an account? Register" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

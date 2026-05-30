import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Camera, ShieldCheck, ArrowLeft, Save, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types';
import { Button, Input } from './ui';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { cn } from '../lib/utils';

interface SettingsPageProps {
  user: UserProfile;
  onBack: () => void;
  onUpdateUser: (updatedProfile: Partial<UserProfile>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [language, setLanguage] = useState(user.language || 'English');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        displayName,
        photoURL: photoURL || null,
        language,
      };
      
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }

      await updateDoc(userRef, updates);
      onUpdateUser(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatars = [
    'https://picsum.photos/seed/evaluator1/200',
    'https://picsum.photos/seed/evaluator2/200',
    'https://picsum.photos/seed/evaluator3/200',
    'https://picsum.photos/seed/evaluator4/200',
    'https://picsum.photos/seed/evaluator5/200',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-12 space-y-8 sm:space-y-12 pb-32"
    >
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="rounded-full h-12 w-12 border border-noir-border/20 text-zinc-500 hover:text-cyan hover:border-cyan/40 transition-all z-10 bg-black/20"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="h-px flex-1 border-b border-noir-border/10 relative">
          {/* Animated Settings Logo in the background track */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-cyan/20 blur-[1px]"
          >
            <SettingsIcon size={24} />
          </motion.div>
        </div>
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">Account Settings</h2>
      </div>

      <div className="glass-panel rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 relative overflow-hidden">
        {/* Animated Background Logo */}
        <motion.div 
          animate={{ 
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 sm:-top-12 sm:-right-12 text-noir-border/5 pointer-events-none"
        >
          <SettingsIcon className="w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px]" strokeWidth={0.5} />
        </motion.div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full cyan-gradient p-1">
                <div className="h-full w-full rounded-full bg-black/60 flex items-center justify-center overflow-hidden relative">
                  {(photoURL || user.photoURL) ? (
                    <img 
                      src={photoURL || user.photoURL} 
                      alt="Profile" 
                      className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <User size={64} className="text-cyan" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-noir-border shadow-lg"
              >
                <ShieldCheck size={20} />
              </motion.div>
            </div>

            <div className="w-full space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Quick Avatars</label>
              <div className="flex flex-wrap justify-center gap-4">
                {avatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoURL(url)}
                    className={cn(
                      "h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110",
                      photoURL === url ? "border-cyan" : "border-transparent"
                    )}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="bg-black/40 border-noir-border/20 text-white h-14 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Preferred Language</label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English, Spanish, Tamil, Hindi, French"
                className="bg-black/40 border-noir-border/20 text-white h-14 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Custom Photo URL</label>
              <div className="relative">
                <Input
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-black/40 border-noir-border/20 text-white h-14 rounded-2xl pl-12"
                />
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Theme Preference</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all",
                    theme === 'light' 
                      ? "bg-white/10 border-cyan text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                      : "bg-black/20 border-noir-border/10 text-zinc-500 hover:border-noir-border/30"
                  )}
                >
                  <Sun size={24} className={theme === 'light' ? "text-amber-400" : ""} />
                  <span className="text-xs font-bold uppercase tracking-widest">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all",
                    theme === 'dark' 
                      ? "bg-cyan/10 border-cyan text-white shadow-[0_0_20px_rgba(8,145,178,0.1)]" 
                      : "bg-black/20 border-noir-border/10 text-zinc-500 hover:border-noir-border/30"
                  )}
                >
                  <Moon size={24} className={theme === 'dark' ? "text-cyan" : ""} />
                  <span className="text-xs font-bold uppercase tracking-widest">Dark</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email (Read-only)</label>
              <div className="relative opacity-60">
                <Input
                  value={user.email || 'No email linked'}
                  readOnly
                  className="bg-black/20 border-noir-border/10 text-zinc-400 h-14 rounded-2xl pl-12 cursor-not-allowed"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              </div>
            </div>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center text-sm"
            >
              Profile updated successfully!
            </motion.div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-16 rounded-2xl cyan-gradient text-white font-bold text-lg shadow-xl gap-3"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
      
      {/* Animated Floating Settings Logo */}
      <div className="flex justify-center pt-8">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="p-4 rounded-2xl bg-black/60 border border-noir-border/20 text-cyan shadow-[0_0_30px_rgba(8,145,178,0.1)]"
        >
          <SettingsIcon size={48} />
        </motion.div>
      </div>
    </motion.div>
  );
};

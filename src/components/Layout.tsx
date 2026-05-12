import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, User, LogOut, Menu, X, ShieldCheck, Trash2, Settings, Home, LayoutDashboard, Zap, Bot, ChevronDown } from 'lucide-react';
import { Button } from './ui';
import { cn } from '@/src/lib/utils';

import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: UserProfile | null;
  onLogout?: () => void;
  onHome?: () => void;
  currentView?: string;
}

export const Layout: React.FC<LayoutProps> = React.memo(({ children, user, onLogout, onHome, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavClick = React.useCallback((viewName: string, hash?: string) => {
    if (viewName === 'landing' && currentView !== 'landing') {
      (window as any).setView?.('landing');
      // Wait for render then scroll
      if (hash) {
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-transparent font-sans text-white selection:bg-noir-border selection:text-white flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-noir-border/20 bg-black/60 backdrop-blur-md">
        {/* Shimmering Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-full w-full bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50"
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <button onClick={onHome} className="flex items-center gap-3 group transition-transform hover:scale-105">
              <motion.div 
                animate={{ 
                  y: [0, -4, 0],
                  filter: ["drop-shadow(0 0 10px rgba(8,145,178,0.2))", "drop-shadow(0 0 25px rgba(8,145,178,0.5))", "drop-shadow(0 0 10px rgba(8,145,178,0.2))"]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-12 w-12 items-center justify-center rounded-full cyan-gradient text-white border border-white/10 transition-shadow group-hover:shadow-[0_0_40px_rgba(8,145,178,0.3)]"
              >
                <BookOpen size={24} />
              </motion.div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#0ea5e9,45%,#fff,55%,#0ea5e9)] bg-[length:200%_100%] animate-shimmer"
              >
                EasyAssess
              </motion.span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2 lg:gap-3">
                <NavLink onClick={() => { onHome?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} active={currentView === 'landing'}>
                  <motion.div whileHover={{ scale: 1.2 }} className="inline-block align-middle mr-2">
                    <Home size={14} />
                  </motion.div>
                  Home
                </NavLink>
                {user && (
                  <NavLink onClick={() => (window as any).setView?.('dashboard')} active={currentView === 'dashboard'}>
                    <motion.div whileHover={{ rotate: 15 }} className="inline-block align-middle mr-2">
                      <LayoutDashboard size={14} />
                    </motion.div>
                    Dashboard
                  </NavLink>
                )}
                {user && (
                  <NavLink onClick={() => (window as any).setView?.('chat')} active={currentView === 'chat'}>
                    <motion.div whileHover={{ scale: 1.2 }} className="inline-block align-middle mr-2">
                      <Bot size={14} className={currentView === 'chat' ? "text-cyan" : "text-zinc-400 group-hover:text-white transition-colors"} />
                    </motion.div>
                    AI Chat
                  </NavLink>
                )}
                <NavLink onClick={() => handleNavClick('landing', '#features')}>
                  <motion.div whileHover={{ y: -2 }} className="inline-block align-middle mr-2">
                    <Zap size={14} />
                  </motion.div>
                  Features
                </NavLink>
                {user && (
                  <NavLink onClick={() => (window as any).setView?.('trash')} active={currentView === 'trash'}>
                    <motion.div whileHover={{ x: [0, -2, 2, -2, 2, 0] }} className="inline-block align-middle mr-2">
                      <Trash2 size={14} />
                    </motion.div>
                    Trash
                  </NavLink>
                )}
                {user && (
                  <NavLink onClick={() => (window as any).setView?.('settings')} active={currentView === 'settings'}>
                    <motion.div 
                      whileHover={{ rotate: 90 }}
                      className="inline-block align-middle mr-2"
                    >
                      <Settings size={14} />
                    </motion.div>
                    Settings
                  </NavLink>
                )}
                {(user as any)?.role === 'admin' && <NavLink onClick={() => (window as any).setView?.('admin')} active={currentView === 'admin'}>Admin</NavLink>}
                {user && (
                  <UserDropdown 
                    user={user} 
                    onLogout={onLogout} 
                    currentView={currentView}
                  />
                )}
              </div>
            </div>

            {/* Mobile menu button - Aesthetic Creative Version */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative h-12 w-12 flex items-center justify-center focus:outline-none group rounded-full"
                aria-label="Toggle menu"
              >
                {/* Background Glass Orb Effect */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isMenuOpen ? 1.1 : 0.9,
                    backgroundColor: isMenuOpen ? "rgba(8, 145, 178, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  }}
                  className="absolute inset-0 rounded-full border border-white/5 backdrop-blur-sm"
                />
                
                {/* Magnetic Dot/Line Patterns */}
                <div className="relative w-6 h-6 flex flex-col items-center justify-center gap-1.5">
                  <motion.span 
                    animate={{ 
                      rotate: isMenuOpen ? 45 : 0,
                      y: isMenuOpen ? 8 : 0,
                      width: isMenuOpen ? "24px" : "16px",
                      x: isMenuOpen ? 0 : -4,
                      backgroundColor: isMenuOpen ? "#22d3ee" : "#ffffff"
                    }}
                    className="h-[1.5px] rounded-full transition-colors duration-500"
                    style={{ transformOrigin: "center" }}
                  />
                  <motion.span 
                    animate={{ 
                      opacity: isMenuOpen ? 0 : 1,
                      scaleX: isMenuOpen ? 0 : 1,
                      x: isMenuOpen ? 12 : 0
                    }}
                    className="h-[1.5px] w-6 bg-white/80 rounded-full transition-all duration-500"
                  />
                  <motion.span 
                    animate={{ 
                      rotate: isMenuOpen ? -45 : 0,
                      y: isMenuOpen ? -8 : 0,
                      width: isMenuOpen ? "24px" : "16px",
                      x: isMenuOpen ? 0 : 4,
                      backgroundColor: isMenuOpen ? "#22d3ee" : "#ffffff"
                    }}
                    className="h-[1.5px] rounded-full transition-colors duration-500"
                    style={{ transformOrigin: "center" }}
                  />
                </div>

                {/* Outer Ring Animation (Visible when open) */}
                <motion.div 
                  animate={{ 
                    rotate: isMenuOpen ? 180 : 0,
                    opacity: isMenuOpen ? 1 : 0,
                    scale: isMenuOpen ? 1 : 0.8
                  }}
                  transition={{ duration: 0.6, ease: "anticipate" }}
                  className="absolute inset-1 rounded-full border border-cyan/20 border-dashed"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-b border-noir-border/20 md:hidden"
            >
              <div className="space-y-1 px-4 pb-6 pt-2">
                <MobileNavLink onClick={() => { onHome?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }} active={currentView === 'landing'}>
                  <Home size={18} className="inline-block mr-3" />
                  Home
                </MobileNavLink>
                {user && (
                  <MobileNavLink onClick={() => { (window as any).setView?.('dashboard'); setIsMenuOpen(false); }} active={currentView === 'dashboard'}>
                    <LayoutDashboard size={18} className="inline-block mr-3" />
                    Dashboard
                  </MobileNavLink>
                )}
                {user && (
                  <MobileNavLink onClick={() => { (window as any).setView?.('chat'); setIsMenuOpen(false); }} active={currentView === 'chat'}>
                    <Bot size={18} className={cn("inline-block mr-3", currentView === 'chat' ? "text-white" : "text-zinc-400")} />
                    AI Assistant
                  </MobileNavLink>
                )}
                <MobileNavLink onClick={() => { handleNavClick('landing', '#features'); setIsMenuOpen(false); }}>
                  <Zap size={18} className="inline-block mr-3" />
                  Features
                </MobileNavLink>
                {user && (
                  <MobileNavLink onClick={() => { (window as any).setView?.('trash'); setIsMenuOpen(false); }} active={currentView === 'trash'}>
                    <Trash2 size={18} className="inline-block mr-3" />
                    Trash
                  </MobileNavLink>
                )}
                {user && (
                  <MobileNavLink onClick={() => { (window as any).setView?.('settings'); setIsMenuOpen(false); }} active={currentView === 'settings'}>
                    <Settings size={18} className="inline-block mr-3" />
                    Settings
                  </MobileNavLink>
                )}
                {(user as any)?.role === 'admin' && <MobileNavLink onClick={() => { (window as any).setView?.('admin'); setIsMenuOpen(false); }} active={currentView === 'admin'}>Admin</MobileNavLink>}
                {user && (
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-6 py-4 text-base font-medium text-white hover:text-red-400 rounded-xl transition-colors bg-transparent"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-noir-border/20 py-12 sm:py-16 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-cyan border border-noir-border/20">
                <BookOpen size={20} />
              </div>
              <span className="text-lg font-serif font-bold text-zinc-400">EasyAssess</span>
            </div>
            <div className="flex gap-10 text-sm text-zinc-400 font-medium">
              <a href="#" className="hover:text-cyan transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-cyan transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-noir-border/20 text-center text-xs text-white uppercase tracking-widest">
            © 2026 EasyAssess Quality Platform. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
});

const UserDropdown = React.memo(({ user, onLogout, currentView }: { user: UserProfile; onLogout?: () => void; currentView?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2 pl-4 border-l border-zinc-800" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-2 py-1.5 rounded-xl border border-transparent hover:border-zinc-800 bg-black/20 transition-all font-medium"
      >
        <div className="h-9 w-9 rounded-full bg-transparent flex items-center justify-center border border-zinc-700 overflow-hidden shadow-inner group-hover:border-cyan/40 transition-colors">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={16} className="text-zinc-400 group-hover:text-cyan transition-colors" />
          )}
        </div>
        <div className="flex flex-col text-left hidden lg:flex">
          <span className="text-white font-medium leading-none text-sm group-hover:text-cyan transition-colors">{user.displayName || user.email || user.phoneNumber}</span>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
            <ShieldCheck size={10} className="text-cyan/60" />
            {(user as any)?.role === 'admin' ? 'Admin' : 'Evaluator'}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-zinc-500 group-hover:text-cyan hidden lg:block"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-zinc-800 bg-[#080808]/95 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60]"
          >
            <div className="px-4 py-3 mb-2 border-b border-zinc-800/50">
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">{user.email || user.displayName}</p>
            </div>

            <div className="space-y-1">
              <DropdownItem 
                icon={<User size={16} />} 
                label="Profile" 
                onClick={() => { (window as any).setView?.('profile'); setIsOpen(false); }}
                active={currentView === 'profile'}
              />
              <DropdownItem 
                icon={<Settings size={16} />} 
                label="Settings" 
                onClick={() => { (window as any).setView?.('settings'); setIsOpen(false); }}
                active={currentView === 'settings'}
              />
              <div className="my-1 border-t border-zinc-800/50" />
              <DropdownItem 
                icon={<LogOut size={16} />} 
                label="Logout" 
                onClick={() => { onLogout?.(); setIsOpen(false); }}
                variant="danger"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const DropdownItem = ({ icon, label, onClick, active, variant = 'default' }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; variant?: 'default' | 'danger' }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
      variant === 'danger' 
        ? "text-zinc-400 hover:text-red-400 hover:bg-red-500/10" 
        : active 
          ? "bg-cyan/10 text-cyan" 
          : "text-zinc-400 hover:text-white hover:bg-white/5"
    )}
  >
    <span className={cn("transition-colors", variant === 'danger' ? "" : active ? "text-cyan" : "group-hover:text-white")}>
      {icon}
    </span>
    {label}
  </button>
);

const NavLink = React.memo(({ href, children, onClick, active }: { href?: string; children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center px-3 xl:px-4 py-2.5 text-[11px] font-bold transition-all uppercase tracking-widest rounded-xl border",
      active 
        ? "text-cyan border-cyan/20 shadow-[0_0_20px_rgba(8,145,178,0.15)] bg-black/40" 
        : "text-zinc-400 border-transparent hover:text-white hover:border-zinc-800 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] bg-black/20"
    )}
  >
    {children}
  </button>
));

const MobileNavLink = React.memo(({ href, children, onClick, active }: { href?: string; children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "block w-full text-left rounded-2xl px-4 py-4 text-sm font-bold transition-all uppercase tracking-widest bg-black/20",
      active ? "text-cyan bg-black/40" : "text-zinc-400 hover:text-cyan hover:bg-black/40"
    )}
  >
    {children}
  </button>
));

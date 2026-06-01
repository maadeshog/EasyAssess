import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, User, LogOut, Menu, X, ShieldCheck, Trash2, Settings, Home, LayoutDashboard, Zap, Bot, ChevronDown, Download, Info, Sparkles, CheckCircle, Wifi, Sun, Moon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: UserProfile | null;
  onLogout?: () => void;
  onHome?: () => void;
  currentView?: string;
  isInstallable: boolean;
  onInstall: () => void;
  onNavigate?: (view: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Sleek Dynamic Bottom Island Button Component
const TabButton = React.memo(({ active, icon: Icon, label, onClick, delay = 0 }: { active: boolean; icon: any; label: string; onClick: () => void; delay?: number }) => {
  return (
    <motion.button
      onClick={onClick}
      variants={{
        hovered: { scale: 1.05, y: -2 }
      }}
      whileHover="hovered"
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 350, damping: 20 }}
      className={cn(
        "relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 focus:outline-none bg-transparent select-none group min-h-[52px] sm:min-h-[44px]",
        active ? "text-cyan" : "text-zinc-500 hover:text-zinc-200"
      )}
    >
      {/* Sliding Active Backdrop with sophisticated cyan neon glow */}
      {active && (
        <motion.div
          layoutId="activeTabPill"
          className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-sky-500/5 border border-cyan/40 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.25)]"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      
      {/* Icon with interactive scaling and state change */}
      <motion.div
        animate={active ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="relative z-10"
      >
        <Icon size={16} className={cn("sm:w-[18px] sm:h-[18px] transition-colors duration-300", active ? "text-cyan" : "text-zinc-400 group-hover:text-white")} />
      </motion.div>
      
      {/* Label - Now always visible with unique styling */}
      <span className={cn(
        "relative z-10 text-[7px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-wider leading-none transition-all duration-300",
        active ? "text-cyan translate-y-0" : "text-zinc-500 group-hover:text-zinc-200"
      )}>
        {label}
      </span>
    </motion.button>
  );
});

export const Layout: React.FC<LayoutProps> = React.memo(({ children, user, onLogout, onHome, currentView, isInstallable, onInstall, onNavigate, theme, onToggleTheme }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isIslandExpanded, setIsIslandExpanded] = React.useState(false);
  const [latency, setLatency] = React.useState<number | null>(null);

  // Measure latency to show in the Dynamic Island status notification
  React.useEffect(() => {
    const start = performance.now();
    fetch('/logo.svg', { method: 'HEAD' })
      .then(() => {
        setLatency(Math.round(performance.now() - start));
      })
      .catch(() => setLatency(24));
  }, []);

  // Track scrolling to shrink the Top Dynamic Island
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans text-white selection:bg-cyan/30 selection:text-white flex flex-col pb-28 sm:pb-36">
      {/* Sleek Top Shimmering Performance Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-50">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="h-full w-full bg-gradient-to-r from-transparent via-cyan to-transparent opacity-60"
        />
      </div>

      {/* Floating Dynamic Top Header Island (iPhone Inspired Capsule) */}
      <div className="fixed top-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none select-none">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            width: isScrolled ? "320px" : "95%",
            maxWidth: isScrolled ? "320px" : "1200px"
          }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-zinc-950/95 via-black/98 to-zinc-950/95 backdrop-blur-3xl border transition-all duration-300 shadow-2xl",
            isScrolled 
              ? "border-cyan/40 hover:border-cyan/60 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(8,145,178,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_35px_rgba(8,145,178,0.45)] py-1.5 mt-1" 
              : "border-white/10 hover:border-cyan/35 shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(8,145,178,0.15)] mt-0"
          )}
        >
          {/* Brand/Logo Section */}
          <button 
            onClick={onHome} 
            className="flex items-center gap-2 group transition-all hover:opacity-90 active:scale-95"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 6],
                filter: ["drop-shadow(0 0 5px rgba(8,145,178,0.1))", "drop-shadow(0 0 15px rgba(8,145,178,0.3))"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut" 
              }}
              className="flex h-8 w-8 items-center justify-center rounded-[24%] bg-black border border-white/10 overflow-hidden shadow-[0_2px_8px_rgba(8,145,178,0.25)]"
            >
              <img src="/logo.svg" alt="EasyAssess Logo" className="h-6 w-6 object-contain" />
            </motion.div>
            
            {/* Smooth transition from brand text to compact badge */}
            <AnimatePresence mode="wait">
              {!isScrolled ? (
                <motion.span 
                  itemProp="name"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-lg font-serif font-black tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#0ea5e9,45%,#fff,55%,#0ea5e9)] bg-[length:200%_100%] animate-shimmer"
                >
                  EasyAssess
                </motion.span>
              ) : (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-[10px] font-mono font-black tracking-widest text-cyan uppercase ml-1"
                >
                  ACTIVE
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Dynamic Island Status Widget & Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Miniature System Healthy Capsule */}
            <motion.button 
              onClick={() => setIsIslandExpanded(!isIslandExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-400 font-bold transition-all"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Node: {latency !== null ? `${latency}ms` : 'calculating'}</span>
              <span className="sm:hidden inline">Live</span>
            </motion.button>

            {onToggleTheme && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleTheme}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/10 dark:border-white/10 bg-zinc-900/60 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-400 hover:text-cyan dark:hover:text-cyan hover:border-cyan/40 dark:hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(8,145,178,0.25)] transition-all cursor-pointer select-none"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun size={14} className="text-amber-400" />
                ) : (
                  <Moon size={14} className="text-cyan" />
                )}
              </motion.button>
            )}

            {isInstallable && !isScrolled && (
              <button
                onClick={onInstall}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-[10px] font-black uppercase tracking-wider hover:bg-cyan/15 hover:border-cyan/40 transition-all font-mono"
              >
                <Download size={11} />
                <span>Install</span>
              </button>
            )}

            {user && (
              <UserDropdown 
                user={user} 
                onLogout={onLogout} 
                currentView={currentView}
                isInstallable={isInstallable}
                onInstall={onInstall}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </motion.header>
      </div>

      {/* System Status Expanded Dynamic Overlay */}
      <AnimatePresence>
        {isIslandExpanded && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none select-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="pointer-events-auto w-80 rounded-2xl bg-black/95 backdrop-blur-xl border border-cyan/30 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(8,145,178,0.2)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wifi size={14} className="text-cyan animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">EasyAssess Engine</span>
                </div>
                <button 
                  onClick={() => setIsIslandExpanded(false)} 
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 font-mono">
                  <span className="text-zinc-500">Database Connection</span>
                  <span className="text-cyan flex items-center gap-1">
                    <CheckCircle size={11} /> Normal
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 font-mono">
                  <span className="text-zinc-500">AI Grading Assistant</span>
                  <span className="text-cyan flex items-center gap-1">
                    <Sparkles size={11} /> Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 font-mono">
                  <span className="text-zinc-500">Local Response Time</span>
                  <span className="text-zinc-300 font-bold">{latency !== null ? `${latency} ms` : 'Evaluating...'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 sm:pt-24 min-h-0">
        {children}
      </main>

      {/* Floating Dynamic Bottom Island Navigation (Sleek Apple Bar) */}
      {user && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-2 sm:px-4 select-none">
          <motion.div
            initial={{ y: 90, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-4 px-2 sm:px-6 py-2 sm:py-3 rounded-full bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(8,145,178,0.18)] max-w-[98vw] sm:max-w-2xl"
          >
            {/* Home Tab */}
            <TabButton 
              active={currentView === 'landing' || currentView === undefined} 
              icon={Home} 
              label="Home" 
              delay={0.05}
              onClick={() => { onNavigate?.('landing'); }} 
            />
            
            {/* Dashboard Tab */}
            <TabButton 
              active={currentView === 'dashboard'} 
              icon={LayoutDashboard} 
              label="Dashboard" 
              delay={0.1}
              onClick={() => { onNavigate?.('dashboard'); }} 
            />
            
            {/* AI Chatbot Tab */}
            <TabButton 
              active={currentView === 'chat'} 
              icon={Bot} 
              label="AI Chat" 
              delay={0.15}
              onClick={() => { onNavigate?.('chat'); }} 
            />
            
            {/* Settings Tab */}
            <TabButton 
              active={currentView === 'settings'} 
              icon={Settings} 
              label="Settings" 
              delay={0.2}
              onClick={() => { onNavigate?.('settings'); }} 
            />
            
            {/* Profile Tab */}
            <TabButton 
              active={currentView === 'profile'} 
              icon={User} 
              label="Profile" 
              delay={0.25}
              onClick={() => { onNavigate?.('profile'); }} 
            />
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-16 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[24%] bg-black border border-white/10 overflow-hidden p-1 shadow-[0_3px_10px_rgba(8,145,178,0.2)]">
                <img src="/logo.svg" alt="EasyAssess Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-serif font-black text-zinc-400">EasyAssess</span>
            </div>
            <div className="flex gap-10 text-sm text-zinc-400 font-medium font-sans">
              <a href="#" className="hover:text-cyan transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-cyan transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-white uppercase tracking-widest font-mono">
            © 2026 EasyAssess Quality Platform. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
});

const UserDropdown = React.memo(({ user, onLogout, currentView, isInstallable, onInstall, onNavigate }: { 
  user: UserProfile; 
  onLogout?: () => void; 
  currentView?: string;
  isInstallable: boolean;
  onInstall: () => void;
  onNavigate?: (view: string) => void;
}) => {
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
    <div className="relative pl-3 border-l border-zinc-800" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-1.5 py-1 rounded-full border border-transparent hover:border-zinc-800 bg-white/5 hover:bg-white/10 transition-all font-medium font-sans"
      >
        <div className="h-7 w-7 rounded-full bg-transparent flex items-center justify-center border border-zinc-700 overflow-hidden shadow-inner group-hover:border-cyan/40 transition-colors">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={14} className="text-zinc-400 group-hover:text-cyan transition-colors" />
          )}
        </div>
        <div className="flex flex-col text-left hidden lg:flex pr-1.5">
          <span className="text-white font-medium leading-none text-xs group-hover:text-cyan transition-colors">{user.displayName || user.email || user.phoneNumber}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-zinc-500 group-hover:text-cyan hidden lg:block mr-1"
        >
          <ChevronDown size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-60 origin-top-right rounded-2xl border border-zinc-800 bg-[#080808]/95 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] font-sans"
          >
            <div className="px-3 py-2.5 mb-1.5 border-b border-zinc-800/50">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-0.5">Signed in as</p>
              <p className="text-xs font-medium text-white truncate">{user.email || user.displayName}</p>
            </div>

            <div className="space-y-1">
              <DropdownItem 
                icon={<User size={15} />} 
                label="Profile" 
                onClick={() => { onNavigate?.('profile'); setIsOpen(false); }}
                active={currentView === 'profile'}
              />
              <DropdownItem 
                icon={<Settings size={15} />} 
                label="Settings" 
                onClick={() => { onNavigate?.('settings'); setIsOpen(false); }}
                active={currentView === 'settings'}
              />
              {user && (user as any).role === 'admin' && (
                <DropdownItem 
                  icon={<ShieldCheck size={15} />} 
                  label="Admin Panel" 
                  onClick={() => { onNavigate?.('admin'); setIsOpen(false); }}
                  active={currentView === 'admin'}
                />
              )}
              {user && (
                <DropdownItem 
                  icon={<Trash2 size={15} />} 
                  label="Trash Bin" 
                  onClick={() => { onNavigate?.('trash'); setIsOpen(false); }}
                  active={currentView === 'trash'}
                />
              )}
              {isInstallable && (
                <DropdownItem 
                  icon={<Download size={15} className="text-cyan" />} 
                  label="Download App" 
                  onClick={() => { onInstall(); setIsOpen(false); }}
                />
              )}
              <div className="my-1 border-t border-zinc-800/50" />
              <DropdownItem 
                icon={<LogOut size={15} />} 
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
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all font-sans",
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

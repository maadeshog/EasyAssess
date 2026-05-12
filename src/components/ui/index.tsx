import React from 'react';
import { cn } from '@/src/lib/utils';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
  }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'cyan-gradient text-white font-bold shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_50px_rgba(8,145,178,0.4)] hover:opacity-90 active:scale-95',
    outline: 'border border-noir-border/40 bg-black/40 text-cyan-100 hover:bg-black/60 hover:text-white active:scale-95',
    ghost: 'bg-transparent text-zinc-400 hover:bg-black/60 hover:text-white active:scale-95',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs uppercase tracking-widest',
    md: 'px-6 py-3 text-sm uppercase tracking-widest',
    lg: 'px-10 py-4 text-base uppercase tracking-widest',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-2xl border border-noir-border/40 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-noir-border/40 transition-all backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
});

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('glass-panel rounded-[32px] p-8', className)}>
    {children}
  </div>
);

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest', className)}>
    {children}
  </span>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('relative bg-noir-border/5 overflow-hidden rounded-md isolate', className)}>
    <div className="absolute inset-0 -z-10 bg-noir-border/10 animate-pulse-opacity" />
    <div className="absolute inset-0 z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-fast" />
  </div>
);

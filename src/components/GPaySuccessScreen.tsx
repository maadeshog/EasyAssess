import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, ArrowRight, Sparkles, Hash } from 'lucide-react';

interface GPaySuccessScreenProps {
  title: string;
  subtitle: string;
  details?: { label: string; value: string | number }[];
  onDone: () => void;
}

export const playGPayChime = () => {
  // Run asynchronously after the page paints to avoid blocking the critical entry keyframes
  setTimeout(async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      
      // Low pass filter to make it sound premium and soft, not harsh
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);
      filter.connect(ctx.destination);

      const playTone = (freq: number, startTime: number, duration: number, gainVal: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine'; // Pure sweet bell-like tone
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Google Pay dual bell chime has a slight frequency glide for natural warmth
        osc.frequency.exponentialRampToValueAtTime(freq * 1.002, startTime + duration);
        
        gainNode.gain.setValueAtTime(0.01, startTime);
        gainNode.gain.linearRampToValueAtTime(gainVal, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(filter);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // GPay chime arpeggio (E-flat major arpeggio, beautiful resolution):
      const now = ctx.currentTime;
      playTone(587.33, now, 0.45, 0.12);                  // D5
      playTone(784.00, now + 0.08, 0.55, 0.18);            // G5
      playTone(1046.50, now + 0.16, 0.70, 0.24);           // C6
      
      // Add sub-bass warmth to feel extremely tactile
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(261.63, now + 0.08); // C4 soft sub bass
      subGain.gain.setValueAtTime(0.01, now + 0.08);
      subGain.gain.linearRampToValueAtTime(0.05, now + 0.12);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      subOsc.connect(subGain);
      subGain.connect(filter);
      subOsc.start(now + 0.08);
      subOsc.stop(now + 0.65);

    } catch (err) {
      console.warn("Audio Context failed to start:", err);
    }
  }, 100);
};

export const GPaySuccessScreen: React.FC<GPaySuccessScreenProps> = ({
  title,
  subtitle,
  details = [],
  onDone
}) => {
  useEffect(() => {
    // Play the GPay success melody instantly as the component mounts
    playGPayChime();
  }, []);

  // Unique reference ID matching GPay transactions
  const txRef = React.useMemo(() => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return 'ASU-' + Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, []);

  const formattedDate = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 px-4 py-8 overflow-y-auto custom-scrollbar gpu-accelerated">
      {/* Background Ambience / Hardware-accelerated gradients */}
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-green-950/20 via-green-950/10 to-transparent pointer-events-none transform-gpu" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] rounded-full blur-[140px] bg-green-500/5 mix-blend-screen pointer-events-none transform-gpu" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[25rem] h-[25rem] rounded-full blur-[120px] bg-green-500/10 mix-blend-screen pointer-events-none transform-gpu" />

      <div className="w-full max-w-md flex flex-col items-center select-none relative z-10 space-y-8 py-8 gpu-accelerated">
        
        {/* Ring & Circle Success Hub - Cyber Green Ripple Style */}
        <div className="relative w-80 h-80 flex items-center justify-center transform-gpu">
          
          {/* Constantly expanding energy ripples from the video */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ripple-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 2], opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
              className="absolute inset-0 border-[2px] border-green-500/30 rounded-full blur-[2px] transform-gpu"
            />
          ))}

          {/* Intense "Shockwave" Energy surge matching the video's peak pulses */}
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1.1],
              opacity: [0, 0.3, 0],
              filter: ["brightness(1) blur(0px)", "brightness(2) blur(4px)", "brightness(1) blur(0px)"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-[12px] border-green-400/10 rounded-full transform-gpu"
          />
          
          {/* Animated Halo Rings */}
          <motion.div 
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.4, opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 1 }}
            className="absolute w-48 h-48 rounded-full border border-green-400/40 transform-gpu"
          />

          {/* Central Cyber Green Hub */}
          <motion.div 
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100, duration: 0.6 }}
            className="relative z-10 w-44 h-44 rounded-full bg-green-500 p-[4px] shadow-[0_0_60px_rgba(34,197,94,0.5)] flex items-center justify-center transform-gpu"
          >
            <div className="w-full h-full rounded-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden transform-gpu">
              {/* Inner ambient ring with high glow */}
              <div className="absolute inset-0 rounded-full border-[8px] border-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.4)] pointer-events-none" />
              
              {/* Central Checkmark - Bold Neon Green Drawing Action */}
              <svg className="w-24 h-24 text-green-500 overflow-visible drop-shadow-[0_0_20px_rgba(34,197,94,0.95)]" viewBox="0 0 100 100">
                <motion.path
                  d="M30 52 L44 66 L72 38"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ strokeDasharray: '80', strokeDashoffset: '80' }}
                  animate={{ strokeDashoffset: '0' }}
                  transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Shooting Green Sparklers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const distance = 120; // Radius distance
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                animate={{ 
                  x: targetX, 
                  y: targetY, 
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1.2, 0.9, 0.4] 
                }}
                transition={{ 
                  delay: 0.35, 
                  duration: 1.1, 
                  ease: [0.19, 1, 0.22, 1] 
                }}
                className={`absolute w-3 h-3 rounded-full flex items-center justify-center ${
                  i % 2 === 0 
                    ? 'bg-green-400 text-green-200' 
                    : 'bg-emerald-400 text-emerald-200'
                }`}
              >
                {i % 2 === 0 ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                ) : (
                  <Sparkles size={8} className="text-current shadow-sm" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Text Header with neat typography and spring fade-in */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center space-y-2 px-6"
        >
          <h3 className="text-3xl font-serif font-black text-white leading-tight tracking-tight">
            {title}
          </h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Cyber Green Style Detailed Transaction Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="w-full bg-zinc-900/60 border border-green-500/10 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle Cyber-style receipt top edge */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500/20 via-green-400/40 to-green-500/20" />

          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Verified & active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <Calendar size={10} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="grid gap-4">
            {details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 min-w-[100px]">{detail.label}</span>
                <span className="text-xs font-bold text-white text-right leading-snug">{detail.value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center gap-4 pt-2 border-t border-zinc-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Receipt Ref</span>
              <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1">
                <Hash size={10} className="text-green-500/40" />
                {txRef}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Success Confirmation Done Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-full pt-4"
        >
          <button
            id="gpay-success-done"
            onClick={onDone}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black text-base shadow-[0_0_35px_rgba(34,197,94,0.25)] hover:shadow-[0_0_50px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
          >
            {/* Gloss shine effect on hover */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
            
            <span>Return to Archive</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

      </div>
    </div>
  );
};

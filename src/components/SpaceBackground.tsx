import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const SpaceBackground: React.FC = React.memo(() => {
  // Generate a stable list of aesthetic drifting ambient particles
  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x-axis
      y: Math.random() * 100, // percentage y-axis
      size: Math.random() * 3 + 1, // width/height in px
      duration: Math.random() * 15 + 15, // float duration
      delay: Math.random() * -20, // negative delay so animations start mid-way
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020202] select-none pointer-events-none">
      {/* Dynamic Cosmic Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#0e749015_0%,_#020617_70%,_#000000_100%)]" />

      {/* Aesthetic Breathing Aurora Blobs (Slow, organic, hardware-accelerated orbits) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[8%] w-[25rem] sm:w-[35rem] h-[25rem] sm:h-[35rem] rounded-full blur-[120px] mix-blend-screen pointer-events-none bg-cyan-950/20"
      />
      
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] right-[8%] w-[30rem] sm:w-[45rem] h-[30rem] sm:h-[45rem] rounded-full blur-[140px] mix-blend-screen pointer-events-none bg-purple-950/15"
      />

      <motion.div
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] sm:w-[60rem] h-[45rem] sm:h-[60rem] rounded-full blur-[160px] mix-blend-screen pointer-events-none bg-emerald-950/10"
      />

      {/* Floating Micro-Bioluminescent Particles (Aesthetic representing ASU natural element energy) */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: `${p.y}%`, x: `${p.x}%` }}
            animate={{
              y: [`${p.y}%`, `${p.y - 15 < 0 ? p.y + 85 : p.y - 15}%`],
              opacity: [0, p.opacity, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.id % 2 === 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(16, 185, 129, 0.4)', // Cyan vs Emerald accents
              boxShadow: p.id % 2 === 0 
                ? '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4)' 
                : '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          />
        ))}
      </div>

      {/* Subtle overlay texture path grid lines */}
      <div className="absolute inset-0 bg-[#020202] opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:100px_100px]" />
    </div>
  );
});

SpaceBackground.displayName = 'SpaceBackground';

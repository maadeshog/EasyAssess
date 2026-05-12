import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const SpaceBackground: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#000000] bg-[radial-gradient(ellipse_at_center,_#0ea5e920_0%,_#000000_100%)] select-none pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 bg-slate-50 opacity-100 dark:opacity-0 transition-opacity duration-1000" />
      
      {/* Optimized Atmospheric Backgrounds (Reduced complexity, no JS animation) */}
      <div
        className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] rounded-full blur-[100px] mix-blend-screen pointer-events-none bg-cyan-900/15"
      />
      
      <div
        className="absolute bottom-[15%] right-[5%] w-[40rem] h-[40rem] rounded-full blur-[120px] mix-blend-screen pointer-events-none bg-cyan-900/10"
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[55rem] rounded-full blur-[150px] mix-blend-screen pointer-events-none bg-cyan-800/5"
      />
    </div>
  );
});

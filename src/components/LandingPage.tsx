import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, Star, ShieldCheck, ArrowRight, Zap, Layers, Globe, Award, Home, Download } from 'lucide-react';
import { Button } from './ui';
import { FeedbackSection } from './FeedbackSection';

export const LandingPage: React.FC<{ 
  onGetStarted: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}> = React.memo(({ onGetStarted, isInstallable, onInstall }) => {
  return (
    <div className="relative space-y-32 pb-32">
      {/* Decorative Background Icon */}
      <div className="fixed -bottom-24 -left-24 text-zinc-900/10 pointer-events-none z-0 overflow-hidden hidden sm:block">
        <motion.div
          animate={{ 
            rotate: [0, 8],
            scale: [1, 1.05],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "linear" 
          }}
          style={{ willChange: 'transform' }}
          className="opacity-10 grayscale"
        >
          <img src="/logo.svg" alt="" className="w-[600px] h-[600px] object-contain" />
        </motion.div>
      </div>

      <div className="fixed -bottom-10 -left-10 text-zinc-900/5 pointer-events-none z-0 overflow-hidden sm:hidden">
        <img src="/logo.svg" alt="" className="w-[250px] h-[250px] object-contain opacity-10 grayscale" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-20">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-noir-border/10 blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-noir-border/10 blur-[150px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 flex flex-col items-center text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-black/60 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
              <ShieldCheck size={14} />
              Verified Academic Standards
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-serif font-bold tracking-tight text-white leading-[1.1] max-w-4xl">
              <span 
                className="inline-block text-transparent bg-clip-text bg-[linear-gradient(110deg,#0891b2,45%,#ffffff,55%,#0891b2)] bg-[length:200%_100%] animate-shimmer italic pb-2 md:pb-0"
              >
                EasyAssess
              </span> supports fast review of the book <span className="text-white">Quality</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-xl leading-relaxed text-zinc-400 font-light mx-auto">
              EasyAssess provides a prestigious framework for the rigorous evaluation of textbooks and academic resources. 
              Powered by verified peer-review metrics and global pedagogical standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2">
              <Button 
                size="lg" 
                onClick={onGetStarted} 
                className="relative group h-14 sm:h-16 px-10 sm:px-14 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 bg-black border border-cyan/40 shadow-[0_0_25px_rgba(8,145,178,0.25)] hover:shadow-[0_0_45px_rgba(8,145,178,0.73)]"
              >
                {/* Outer Glow Overlay */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-cyan-600/20 blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                
                <span className="relative z-10 flex items-center gap-3 text-white font-bold text-sm sm:text-lg tracking-wide uppercase">
                  Get Started
                  <ArrowRight size={20} className="transition-transform duration-500 group-hover:translate-x-2" />
                </span>
              </Button>

              {isInstallable && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onInstall}
                  className="relative group h-14 sm:h-16 px-8 sm:px-12 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 border-zinc-800 bg-black/40 hover:border-cyan/50 backdrop-blur-xl"
                >
                  <span className="relative z-10 flex items-center gap-3 text-zinc-300 font-bold text-sm sm:text-lg tracking-wide group-hover:text-cyan transition-colors">
                    <Download size={20} />
                    Install Platform
                  </span>
                </Button>
              )}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-full max-w-4xl mx-auto"
          >
            <div className="relative z-10 overflow-hidden rounded-[32px] sm:rounded-[40px] bg-black/60 p-2 sm:p-3 shadow-2xl shadow-cyan-950/80">
              <img
                src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=100&w=3840&auto=format&fit=crop"
                alt="Stack of antique books"
                loading="eager"
                decoding="async"
                className="rounded-[24px] sm:rounded-[32px] object-cover w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[750px] opacity-100 brightness-[0.92] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              
              {/* Floating Quality Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-12 right-12 glass-panel p-6 rounded-3xl"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-cyan">Quality Index</div>
                    <div className="text-3xl font-serif font-bold text-white">9.84</div>
                  </div>
                  <div className="h-12 w-12 rounded-full cyan-gradient flex items-center justify-center text-white">
                    <Award size={24} />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-noir-border/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full cyan-gradient"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 lg:px-12 py-12">
        <div className="space-y-16 max-w-5xl mx-auto">
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Rigorous Methodology</h2>
            <p className="text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Advanced evaluation systems for the modern academic era
            </p>
          </div>
          
          <div className="grid gap-10 md:grid-cols-3">
            <FeaturePoint
              icon={<Zap size={24} />}
              title="Real-time Metrics"
              description="Our proprietary scoring engine provides instantaneous feedback against 50+ pedagogical data points."
            />
            <FeaturePoint
              icon={<Layers size={24} />}
              title="Peer Verification"
              description="Every assessment undergoes a multi-stage verification process by certified academic evaluators."
            />
            <FeaturePoint
              icon={<Globe size={24} />}
              title="Global Compliance"
              description="Fully aligned with international educational frameworks and accessibility standards."
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 space-y-32 relative">
        {/* Central Spine Connection (Desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-48 bottom-48 w-px bg-gradient-to-b from-transparent via-cyan/20 to-transparent -translate-x-1/2 z-0" />

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-xs font-bold text-cyan uppercase tracking-widest mb-4"
          >
            <Zap size={14} className="animate-pulse" />
            Optimized Logic
          </motion.div>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">The Structural Path</h2>
          <p className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-white leading-none">
            Architectural <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-cyan to-white">Flow</span>
          </p>
          <p className="text-zinc-500 font-light text-lg max-w-2xl mx-auto">
            Our assessment framework operates as a modular ecosystem, ensuring every manuscript is polished to global academic perfection.
          </p>
        </div>

        <div className="relative space-y-24 md:space-y-0">
          {/* Workflow Steps with Staggered Positioning */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 relative z-10">
            {/* Step 1: Left Top */}
            <div className="lg:col-span-5 lg:translate-x-4">
              <WorkflowStep 
                number="1"
                title="Submission"
                description="Publishers submit books and e-books into our encrypted pedagogical sandbox."
                icon={<Layers size={24} />}
                imageUrl="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop"
                alignment="right"
              />
            </div>

            {/* Step 2: Right Middle (Offset Down) */}
            <div className="lg:col-span-5 lg:col-start-8 lg:translate-y-20 lg:-translate-x-4">
              <WorkflowStep 
                number="2"
                title="Automated Screening"
                description="AI-driven protocols analyze linguistic patterns and formatting adherence."
                icon={<ShieldCheck size={24} />}
                imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
                alignment="left"
              />
            </div>

            {/* Step 3: Left Bottom (Offset Down Further) */}
            <div className="lg:col-span-5 lg:translate-y-40 lg:translate-x-8">
              <WorkflowStep 
                number="3"
                title="Expert Review"
                description="Double-blind evaluation by tenured faculty and subject-matter pioneers."
                icon={<Star size={24} />}
                imageUrl="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop"
                alignment="right"
              />
            </div>

            {/* Step 4: Right Very Bottom */}
            <div className="lg:col-span-5 lg:col-start-8 lg:translate-y-60 lg:-translate-x-8">
              <WorkflowStep 
                number="4"
                title="Final Verification"
                description="Final recursive audit before archiving into the Global Academic Repository."
                icon={<CheckCircle2 size={24} />}
                imageUrl="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=800&auto=format&fit=crop"
                alignment="left"
              />
            </div>
          </div>

          {/* Decorative Interconnecting Paths (SVG) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-20 z-0 overflow-visible">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1200 1200" fill="none">
              <motion.path
                d="M500 150 Q 600 200, 700 350"
                stroke="url(#cyan-grad)"
                strokeWidth="2"
                strokeDasharray="10 20"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: -100 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M700 450 Q 600 550, 500 650"
                stroke="url(#cyan-grad)"
                strokeWidth="2"
                strokeDasharray="10 20"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: -100 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M500 750 Q 600 850, 700 950"
                stroke="url(#cyan-grad)"
                strokeWidth="2"
                strokeDasharray="10 20"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: -100 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <defs>
                <linearGradient id="cyan-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        {/* Spacer for staggered layout overlap */}
        <div className="hidden lg:block h-[300px]" />
      </section>

      {/* Trust Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="rounded-[32px] sm:rounded-[40px] glass-panel p-6 sm:p-16 text-center space-y-8 sm:space-y-12">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Trusted by Leading Institutions</h3>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="text-xl sm:text-3xl font-serif font-bold text-white">OXFORD</div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-white">CAMBRIDGE</div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-white">HARVARD</div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-white">STANFORD</div>
          </div>
        </div>
      </section>
      
      {/* Feedback System */}
      <FeedbackSection />

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 pb-10 sm:pb-20">
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] cyan-gradient p-6 sm:p-16 text-center space-y-8 sm:space-y-10 shadow-[0_0_50px_rgba(8,145,178,0.15)]">
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-serif font-bold text-white sm:text-4xl md:text-6xl">Ready to set the standard?</h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-lg text-zinc-400 font-light">
              Join our global network of verified academic evaluators and contribute to the most prestigious resource archive in the world.
            </p>
            <div className="pt-4 sm:pt-6">
              <Button 
                size="lg" 
                onClick={onGetStarted} 
                className="relative group h-14 sm:h-16 px-8 sm:px-12 rounded-full overflow-hidden bg-noir-border transition-all duration-500 hover:scale-105 active:scale-95"
              >
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-noir-border/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Outer Glow */}
                <div className="absolute -inset-2 bg-noir-border/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <span className="relative z-10 text-white font-bold text-sm sm:text-lg">
                  Join the Archive
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

const FeaturePoint = React.memo(({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="flex items-start gap-6 group"
  >
    <div className="relative flex-shrink-0">
      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-cyan/[0.03] flex items-center justify-center text-cyan group-hover:bg-cyan/10 transition-all">
        {icon}
      </div>
      {/* Animating Arrow */}
      <motion.div 
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 text-cyan opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ArrowRight size={24} />
      </motion.div>
    </div>
    <div className="space-y-1">
      <h3 className="text-xl font-serif font-bold text-white group-hover:text-cyan transition-colors">{title}</h3>
      <p className="text-zinc-500 font-light leading-relaxed max-w-lg text-sm">{description}</p>
    </div>
  </motion.div>
));

const WorkflowStep = React.memo(({ number, title, description, icon, imageUrl, alignment }: { number: string; title: string; description: string; icon: React.ReactNode; imageUrl: string; alignment?: 'left' | 'right' }) => (
  <motion.div 
    initial="rest"
    whileHover="hover"
    variants={{
      rest: { y: 0, scale: 1 },
      hover: { y: -12, scale: 1.02 }
    }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`group relative rounded-[32px] overflow-hidden bg-transparent h-full min-h-[300px] p-[1px] flex flex-col justify-end isolate cursor-pointer shadow-2xl ${alignment === 'right' ? 'lg:rounded-tr-none lg:rounded-bl-none' : 'lg:rounded-tl-none lg:rounded-br-none'}`}
    style={{ willChange: 'transform' }}
  >
    {/* Modular Corner Accents */}
    <div className={`absolute top-0 ${alignment === 'right' ? 'right-0' : 'left-0'} h-12 w-12 border-t-2 border-${alignment === 'right' ? 'r' : 'l'}-2 border-cyan/40 z-30 transition-transform duration-500 group-hover:scale-125`} />
    <div className={`absolute bottom-0 ${alignment === 'right' ? 'left-0' : 'right-0'} h-12 w-12 border-b-2 border-${alignment === 'right' ? 'l' : 'r'}-2 border-cyan/40 z-30 transition-transform duration-500 group-hover:scale-125`} />

    {/* Animated Border Sweep */}
    <motion.div
      className="absolute inset-[-100%] z-0 opacity-20 group-hover:opacity-100 transition-opacity duration-700"
      style={{ backgroundImage: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(8,145,178,1) 360deg)' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
    {/* Static Inner Border Background */}
    <div className="absolute inset-0 z-0 bg-white/5 rounded-[32px]" />

    {/* Inner Card Container */}
    <div className="relative z-10 flex flex-col justify-end w-full h-full bg-[#080808] rounded-[31px] p-8 overflow-hidden group-hover:bg-[#0a0a0a] transition-colors duration-500">
      
      {/* Dynamic Image Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[31px] overflow-hidden">
        <motion.img 
          variants={{
            rest: { scale: 1.0, opacity: 0.85, filter: "grayscale(40%) brightness(1.1)" },
            hover: { scale: 1.15, opacity: 1.0, filter: "grayscale(0%) brightness(1.3)" }
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover mix-blend-screen" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent group-hover:via-[#080808]/30 transition-colors duration-1000" />
      </div>

      {/* Floating Glow Orb inside */}
      <motion.div 
        variants={{
          rest: { opacity: 0, scale: 0.8 },
          hover: { opacity: 1, scale: 1 }
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -top-1/4 -right-1/4 h-64 w-64 bg-cyan/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen"
      />

      {/* Content wrapper */}
      <motion.div 
        variants={{
          rest: { y: 10, opacity: 0.8 },
          hover: { y: 0, opacity: 1 }
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 space-y-6 text-left"
      >
        <div className={`flex items-center justify-between ${alignment === 'right' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="relative h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan group-hover:bg-cyan group-hover:text-white group-hover:border-cyan group-hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] transition-all duration-700 overflow-hidden backdrop-blur-xl">
            <motion.div 
              variants={{ rest: { scale: 0.9, rotate: 0 }, hover: { scale: 1.2, rotate: 5 } }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="relative z-10"
            >
              {icon}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
          <motion.div 
            variants={{
              rest: { rotate: 0, scale: 1, opacity: 0.1 },
              hover: { rotate: alignment === 'right' ? -12 : 12, scale: 1.2, opacity: 0.3 }
            }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 15 }}
            className={`text-8xl font-serif font-black text-cyan transition-all duration-700 select-none`}
          >
            {number}
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.h4 
            variants={{
              rest: { x: 0 },
              hover: { x: alignment === 'right' ? 10 : -10 }
            }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-serif font-bold text-white group-hover:text-cyan transition-colors"
          >
            {title}
          </motion.h4>
          <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-light transition-colors duration-500 max-w-[90%]">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  </motion.div>
));

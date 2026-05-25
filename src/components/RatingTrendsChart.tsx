import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Award, BookOpen, Sparkles, Star, Lightbulb, BarChart3, HelpCircle } from 'lucide-react';
import { Book, Assessment } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Button } from './ui';

interface RatingTrendsChartProps {
  books: Book[];
  assessments: Assessment[];
}

type MetricKey = 'overall' | 'contentAccuracy' | 'readability' | 'pedagogy' | 'visualDesign' | 'relevance';

interface MetricMeta {
  key: MetricKey;
  label: string;
  color: string;
  gradient: string;
}

const METRICS_META: MetricMeta[] = [
  { key: 'overall', label: 'Overall Quality', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500' }, // Cyan
  { key: 'contentAccuracy', label: 'Content Accuracy', color: '#10b981', gradient: 'from-emerald-500 to-teal-500' }, // Emerald
  { key: 'readability', label: 'Readability', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' }, // Amber
  { key: 'pedagogy', label: 'Pedagogy', color: '#6366f1', gradient: 'from-indigo-500 to-purple-500' }, // Indigo
  { key: 'visualDesign', label: 'Visual Design', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' }, // Pink
  { key: 'relevance', label: 'Relevance', color: '#14b8a6', gradient: 'from-teal-500 to-emerald-400' }, // Teal
];

// High-quality mockup data in case the user has not created any real assessments yet
const DEMO_ASSESSMENTS = [
  {
    id: 'demo-1',
    bookId: 'b1',
    userId: 'u1',
    userName: 'Prof. Sarah Lin',
    scores: { contentAccuracy: 4.8, readability: 4.0, pedagogy: 4.5, visualDesign: 3.8, relevance: 4.6 },
    comments: 'Superb pedagogical alignment, although visuals could be more contemporary.',
    recommendation: 'highly-recommended',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    status: 'active'
  },
  {
    id: 'demo-2',
    bookId: 'b2',
    userId: 'u2',
    userName: 'Dr. James Carter',
    scores: { contentAccuracy: 4.2, readability: 4.5, pedagogy: 3.8, visualDesign: 4.2, relevance: 4.0 },
    comments: 'Excellent layout and graphics make this very readable for beginners.',
    recommendation: 'recommended',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
    status: 'active'
  },
  {
    id: 'demo-3',
    bookId: 'b3',
    userId: 'u3',
    userName: 'Prof. Elena Rostova',
    scores: { contentAccuracy: 4.5, readability: 3.8, pedagogy: 4.2, visualDesign: 4.5, relevance: 4.8 },
    comments: 'Stellar coverage of theoretical foundations. Heavy focus on equations.',
    recommendation: 'highly-recommended',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    status: 'active'
  },
  {
    id: 'demo-4',
    bookId: 'b1',
    userId: 'u4',
    userName: 'Marcus Aurelius',
    scores: { contentAccuracy: 3.8, readability: 4.2, pedagogy: 4.6, visualDesign: 4.0, relevance: 3.5 },
    comments: 'Good reference list but some content seems slightly dated for secondary schools.',
    recommendation: 'neutral',
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    status: 'active'
  },
  {
    id: 'demo-5',
    bookId: 'b4',
    userId: 'u1',
    userName: 'Prof. Sarah Lin',
    scores: { contentAccuracy: 4.7, readability: 4.6, pedagogy: 4.8, visualDesign: 4.6, relevance: 4.7 },
    comments: 'Incredible work. The visual structures are absolutely unmatched.',
    recommendation: 'highly-recommended',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    status: 'active'
  }
];

const DEMO_BOOKS = [
  { id: 'b1', title: 'Foundations of Modern Pedagogy' },
  { id: 'b2', title: 'Visual Learning Paradigms' },
  { id: 'b3', title: 'Advanced Electromagnetic Theory' },
  { id: 'b4', title: 'Quantitative Reasoning for Leaders' }
];

export const RatingTrendsChart: React.FC<RatingTrendsChartProps> = ({ books, assessments }) => {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('overall');
  const [useDemoData, setUseDemoData] = React.useState<boolean>(false);

  // Determine whether to use real database assessments or demo data
  const actualActiveAssessments = React.useMemo(() => {
    return assessments.filter(a => a.status === 'active' || !a.status);
  }, [assessments]);

  const activeDataIsDemo = useDemoData || actualActiveAssessments.length === 0;
  const targetAssessments = activeDataIsDemo ? DEMO_ASSESSMENTS : actualActiveAssessments;
  const targetBooks = activeDataIsDemo ? DEMO_BOOKS : books;

  // Compute stats and average values for each metric tab
  const metricStats = React.useMemo(() => {
    const defaultStats = {
      overall: 0,
      contentAccuracy: 0,
      readability: 0,
      pedagogy: 0,
      visualDesign: 0,
      relevance: 0,
    };
    if (targetAssessments.length === 0) return defaultStats;

    const sums = { ...defaultStats };
    targetAssessments.forEach(ass => {
      sums.contentAccuracy += ass.scores.contentAccuracy;
      sums.readability += ass.scores.readability;
      sums.pedagogy += ass.scores.pedagogy;
      sums.visualDesign += ass.scores.visualDesign;
      sums.relevance += ass.scores.relevance;
      
      const overall = (
        ass.scores.contentAccuracy +
        ass.scores.readability +
        ass.scores.pedagogy +
        ass.scores.visualDesign +
        ass.scores.relevance
      ) / 5;
      sums.overall += overall;
    });

    const count = targetAssessments.length;
    return {
      overall: parseFloat((sums.overall / count).toFixed(1)),
      contentAccuracy: parseFloat((sums.contentAccuracy / count).toFixed(1)),
      readability: parseFloat((sums.readability / count).toFixed(1)),
      pedagogy: parseFloat((sums.pedagogy / count).toFixed(1)),
      visualDesign: parseFloat((sums.visualDesign / count).toFixed(1)),
      relevance: parseFloat((sums.relevance / count).toFixed(1)),
    };
  }, [targetAssessments]);

  // Format assessments sorted chronologically for charting
  const sortedChartData = React.useMemo(() => {
    const list = [...targetAssessments].sort((a, b) => a.createdAt - b.createdAt);
    
    let cumulativeSum = 0;
    let cumulativeCount = 0;

    return list.map((ass, i) => {
      const parentBook = targetBooks.find(b => b.id === ass.bookId);
      
      const overall = (
        ass.scores.contentAccuracy +
        ass.scores.readability +
        ass.scores.pedagogy +
        ass.scores.visualDesign +
        ass.scores.relevance
      ) / 5;

      cumulativeSum += overall;
      cumulativeCount += 1;
      const runningAvg = parseFloat((cumulativeSum / cumulativeCount).toFixed(2));

      return {
        id: ass.id,
        index: i + 1,
        date: new Date(ass.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dateFull: new Date(ass.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        overall: parseFloat(overall.toFixed(1)),
        runningAverage: runningAvg,
        contentAccuracy: ass.scores.contentAccuracy,
        readability: ass.scores.readability,
        pedagogy: ass.scores.pedagogy,
        visualDesign: ass.scores.visualDesign,
        relevance: ass.scores.relevance,
        bookTitle: parentBook?.title || 'Unknown Resource',
        evaluator: ass.userName,
      };
    });
  }, [targetAssessments, targetBooks]);

  // Determine the highest performing vector/category
  const highestMetric = React.useMemo(() => {
    let highestKey: MetricKey = 'contentAccuracy';
    let highestValue = 0;

    METRICS_META.forEach(meta => {
      if (meta.key !== 'overall') {
        const val = metricStats[meta.key];
        if (val > highestValue) {
          highestValue = val;
          highestKey = meta.key;
        }
      }
    });

    return METRICS_META.find(m => m.key === highestKey);
  }, [metricStats]);

  // Safe rendering fallback during development / empty data
  if (books.length === 0 && actualActiveAssessments.length === 0 && !activeDataIsDemo) {
    return (
      <div className="glass-panel rounded-[32px] p-8 text-center space-y-4 border border-noir-border/25">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-noir-border/10 flex items-center justify-center text-zinc-500">
          <BarChart3 size={24} />
        </div>
        <h4 className="text-lg font-serif font-bold text-white">Interactive Trajectories</h4>
        <p className="text-zinc-500 font-light text-sm max-w-md mx-auto">
          Add publications and document standard peer evaluations to observe peer quality ratings trend visually.
        </p>
      </div>
    );
  }

  // Define colors based on active selection
  const activeMeta = METRICS_META.find(m => m.key === selectedMetric) || METRICS_META[0];

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/95 backdrop-blur-xl p-4 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.8)] text-xs space-y-2 pointer-events-none">
          <div className="font-serif font-bold text-white tracking-wide border-b border-white/15 pb-1 max-w-[220px] truncate">
            {data.bookTitle}
          </div>
          <div className="space-y-1 text-zinc-400 mt-1">
            <p>Evaluator: <span className="text-zinc-200 font-medium">{data.evaluator}</span></p>
            <p>Evaluation Date: <span className="text-zinc-200 font-medium">{data.dateFull}</span></p>
          </div>
          <div className="h-0.5" />
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 font-bold text-cyan">
              <span>Overall Average:</span>
              <span>{data.overall} / 5</span>
            </div>
            {selectedMetric !== 'overall' ? (
              <div className="flex items-center justify-between gap-4 font-bold" style={{ color: activeMeta.color }}>
                <span>{activeMeta.label}:</span>
                <span>{data[selectedMetric]} / 5</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 font-bold text-zinc-500">
                <span>Running Avg:</span>
                <span>{data.runningAverage} / 5</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="glass-panel rounded-[32px] p-6 sm:p-8 space-y-8 border-[0.5px] border-white/5 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Header section with toggle for Demo Data */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-cyan shadow-inner select-none">
            <TrendingUp size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">Academic Rating Trajectories</h3>
              {activeDataIsDemo && (
                <span className="text-[9px] font-bold text-cyan bg-cyan/10 border border-cyan/35 px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Simulation Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-light mt-0.5">Chronological trends compiled across criteria vectors</p>
          </div>
        </div>

        {/* Demo Data view toggler in case collection is empty */}
        {actualActiveAssessments.length === 0 ? (
          <div className="text-[10px] text-zinc-500 italic bg-noir-border/10 rounded-2xl px-3 py-1 border border-noir-border/20 self-start sm:self-center">
            Awaiting evaluations. Showing default peer database simulation.
          </div>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-zinc-400 font-medium">Demo Trajectory</span>
            <button
              onClick={() => setUseDemoData(!useDemoData)}
              className={cn(
                "w-12 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none border border-white/10",
                useDemoData ? "bg-cyan" : "bg-black"
              )}
              title="Toggle simulated data to view charts behavior"
            >
              <motion.div
                layout
                className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                animate={{ x: useDemoData ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </button>
          </div>
        )}
      </div>

      {/* Stats Indicators / Metrics pills tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 relative z-10 select-none">
        {METRICS_META.map((meta) => {
          const isActive = selectedMetric === meta.key;
          const value = metricStats[meta.key];

          return (
            <button
              key={meta.key}
              onClick={() => setSelectedMetric(meta.key)}
              className={cn(
                "relative group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 pointer-events-auto cursor-pointer outline-none",
                isActive 
                  ? "bg-black/80 border-cyan/50 shadow-[0_8px_20px_-6px_rgba(8,145,178,0.2)]" 
                  : "bg-black/20 border-white/5 hover:border-white/15 hover:bg-black/40"
              )}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider leading-none transition-colors",
                  isActive ? "text-cyan" : "text-zinc-500 group-hover:text-zinc-300"
                )}>
                  {meta.label.split(' ')[0]}
                </span>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-cyan" : "bg-zinc-700 group-hover:bg-zinc-500"
                )} />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
                  {value || '0.0'}
                </span>
                <span className="text-[10px] text-zinc-600 font-serif">/5</span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeMetricGlowLine"
                  className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan to-sky-500" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Graph Canvas */}
      <div className="h-64 sm:h-80 md:h-96 w-full relative z-10 bg-black/40 rounded-[24px] border border-white/5 p-4 sm:p-6 flex items-center justify-center">
        {sortedChartData.length < 2 ? (
          // Better visualization if there's only 1 point
          <div className="text-center space-y-2 py-12">
            <Award className="mx-auto text-cyan h-10 w-10 animate-pulse" />
            <p className="text-zinc-400 font-medium text-sm">Accumulating peer metric dimensions...</p>
            <p className="text-zinc-600 text-[11px] max-w-xs mx-auto font-light">
              We require at least two distinct evaluations to plot rating trajectories. Currently loaded evaluation: {sortedChartData[0]?.bookTitle || "None"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedChartData}
              margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.03)" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                domain={[1, 5]} 
                tickCount={5} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                dx={-10}
              />
              <Tooltip 
                content={<CustomChartTooltip />}
                cursor={{ stroke: 'rgba(255,225,255,0.06)', strokeWidth: 1.5 }}
              />
              
              {/* Reference Baseline representing average target score (e.g. 4.0) */}
              <ReferenceLine 
                y={4.0} 
                stroke="rgba(8,145,178,0.12)" 
                strokeDasharray="4 4"
                label={{ value: 'Gold Standard', fill: 'rgba(8,145,178,0.3)', fontSize: 9, position: 'insideBottomRight', fontWeight: 700 }} 
              />

              {/* Main Selection Metric Line */}
              <Line
                key={`main-${selectedMetric}-${activeDataIsDemo ? 'demo' : 'real'}`}
                name={activeMeta.label}
                type="monotone"
                dataKey={selectedMetric}
                stroke={activeMeta.color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, stroke: activeMeta.color, fill: '#000000' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: activeMeta.color }}
                isAnimationActive={true}
                animationDuration={805}
                animationEasing="ease-out"
              />

              {/* Keep a soft overall/running average background context line for reference */}
              {selectedMetric !== 'overall' && (
                <Line
                  key={`avg-${selectedMetric}-${activeDataIsDemo ? 'demo' : 'real'}`}
                  name="Overall Running Avg"
                  type="monotone"
                  dataKey="runningAverage"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={805}
                  animationEasing="ease-out"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Trend Insights / Analytics Footer card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5 relative z-10 text-xs text-zinc-500">
        <div className="flex items-start gap-3 bg-black/15 rounded-2xl p-4 border border-white/[0.03]">
          <div className="h-8 w-8 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={16} />
          </div>
          <div>
            <span className="font-serif font-black text-white block mb-0.5">Trend Insight</span>
            <p className="font-light leading-relaxed text-[11px] text-zinc-400">
              The highest scoring vector across reviews is <span className="text-cyan font-bold uppercase tracking-wider">{highestMetric?.label}</span> at <span className="text-white font-medium">{metricStats[highestMetric?.key as MetricKey] || 'N/A'} / 5.0</span> average. This indicates stellar academic alignment.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 bg-black/15 rounded-2xl p-4 border border-white/[0.03]">
          <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="font-serif font-black text-white block mb-0.5">Academic Quality Score</span>
            <p className="font-light leading-relaxed text-[11px] text-zinc-400">
              Current overall peer benchmark stands at <span className="text-indigo-400 font-bold">{metricStats.overall} / 5.0</span>. Evaluations show consistent high accuracy and strong pedagogical frameworks for curated materials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

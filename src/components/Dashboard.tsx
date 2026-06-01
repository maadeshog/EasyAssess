import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, BookOpen, Search, Filter, Plus, ShieldCheck, ArrowUpDown, X, Zap, LayoutDashboard, Home, Star, ArrowLeft, Globe, Layers } from 'lucide-react';
import { Book, Assessment, UserProfile } from '@/src/types';
import { BookCard } from './BookCard';
import { Button, Input, Card, Skeleton } from './ui';
import { cn } from '@/src/lib/utils';
import { RatingTrendsChart } from './RatingTrendsChart';

interface DashboardProps {
  books: Book[];
  assessments: Assessment[];
  onAssess: (book: Book) => void;
  onAddBook: () => void;
  onViewBook: (book: Book) => void;
  onDeleteBook?: (bookId: string) => void;
  onBulkDelete?: (bookIds: string[]) => void;
  onBack?: () => void;
  currentUser?: UserProfile | null;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({ books, assessments, onAssess, onAddBook, onViewBook, onDeleteBook, onBulkDelete, onBack, currentUser, isLoading }) => {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'textbook' | 'reference' | 'ebook'>('all');
  const [langFilter, setLangFilter] = React.useState<string>('all');
  const [systemFilter, setSystemFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'newest' | 'rating' | 'title' | 'year-asc' | 'year-desc'>('newest');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);

  // Pre-calculate ratings for faster sorting and rendering
  const bookRatings = React.useMemo(() => {
    const ratings: Record<string, number> = {};
    books.forEach(book => {
      const bookAssessments = assessments.filter(a => a.bookId === book.id && (a.status === 'active' || !a.status));
      if (bookAssessments.length === 0) {
        ratings[book.id] = 0;
      } else {
        const total = bookAssessments.reduce((acc, curr) => {
          const avg = (curr.scores.contentAccuracy + curr.scores.readability + curr.scores.pedagogy + curr.scores.visualDesign + curr.scores.relevance) / 5;
          return acc + avg;
        }, 0);
        ratings[book.id] = total / bookAssessments.length;
      }
    });
    return ratings;
  }, [books, assessments]);

  const availableLanguages = React.useMemo(() => {
    const langs = new Set<string>();
    books.forEach(book => {
      if (book.language) {
        langs.add(book.language);
      }
    });
    return Array.from(langs).sort();
  }, [books]);

  const filteredBooks = React.useMemo(() => books
    .filter(book => book.status === 'active' || !book.status) // Fallback for old books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                           book.author.toLowerCase().includes(search.toLowerCase()) ||
                           book.isbn.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || book.type === filter;
      const matchesLang = langFilter === 'all' || book.language === langFilter;
      const matchesSystem = systemFilter === 'all' || book.system === systemFilter;
      return matchesSearch && matchesFilter && matchesLang && matchesSystem;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year-asc') return a.year - b.year;
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'rating') {
        return bookRatings[b.id] - bookRatings[a.id];
      }
      return 0;
    }), [books, search, filter, langFilter, systemFilter, sortBy, bookRatings]);

  const isFiltered = search !== '' || filter !== 'all' || langFilter !== 'all' || systemFilter !== 'all';

  const toggleSelection = React.useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleBulkDeleteAction = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Move ${selectedIds.length} selected resources to the trash?`)) {
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 space-y-12 sm:space-y-16 pb-32">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="rounded-full h-12 w-12 border border-noir-border/20 text-zinc-500 hover:text-cyan hover:border-cyan/40 transition-all bg-black/20"
          title="Back to Home"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="h-px flex-1 border-b border-noir-border/10"></div>
        <div className="flex items-center gap-3 text-white">
          <LayoutDashboard size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Resource Command</h2>
        </div>
      </div>
      {/* Decorative Background Icon */}
      <div className="fixed -bottom-32 -left-32 text-zinc-900/10 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 100, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ willChange: 'transform' }}
          className="hidden sm:block"
        >
          <BarChart3 size={700} strokeWidth={0.5} />
        </motion.div>
        <div className="sm:hidden">
          <BarChart3 size={300} strokeWidth={0.5} />
        </div>
      </div>

      <div className="fixed -top-32 -right-32 text-zinc-900/10 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, 40],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut" 
          }}
          style={{ willChange: 'transform' }}
          className="hidden sm:block"
        >
          <LayoutDashboard size={600} strokeWidth={0.5} />
        </motion.div>
        <div className="sm:hidden">
          <LayoutDashboard size={250} strokeWidth={0.5} />
        </div>
      </div>

      {/* Stats Overview */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex items-center gap-4 sm:gap-6"
            >
              <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            </motion.div>
          ))
        ) : (
          <>
            <StatCard 
              icon={<img src="/logo.svg" alt="Books" className="h-6 w-6 object-contain" />} 
              label="Total Books" 
              value={books.length} 
            />
            <StatCard icon={<TrendingUp size={24} />} label="Assessments" value={assessments.length} />
            <StatCard icon={<Users size={24} />} label="Evaluators" value={React.useMemo(() => new Set(assessments.map(a => a.userId)).size, [assessments])} />
            <StatCard icon={<ShieldCheck size={24} />} label="Security Level" value="Verified" />
          </>
        )}
      </section>

      {/* Workflow Progress Indicator */}
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl cyan-gradient flex items-center justify-center text-white shadow-lg">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Smart Assessment Workflow</h3>
              <p className="text-xs text-zinc-500">Streamlining quality education materials</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <WorkflowIndicator step="1" label="Submission" active />
            <div className="hidden sm:block h-px w-8 bg-noir-border/20"></div>
            <WorkflowIndicator step="2" label="Screening" active />
            <div className="hidden sm:block h-px w-8 bg-noir-border/20"></div>
            <WorkflowIndicator step="3" label="Expert Review" active />
            <div className="hidden sm:block h-px w-8 bg-noir-border/20"></div>
            <WorkflowIndicator step="4" label="Reporting" active />
          </div>
        </div>
      </section>

      {/* Evaluation Rating Trends */}
      <RatingTrendsChart books={books} assessments={assessments} />

      {/* Recent Assessments List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-noir-border/10 flex items-center justify-center text-cyan border border-noir-border/20">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Recent Expert Evaluations</h3>
          </div>
        </div>
        
        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 w-full">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
              </div>
            ))
          ) : assessments.length > 0 ? (
            assessments.slice(0, 3).map((assessment) => {
              const book = books.find(b => b.id === assessment.bookId);
              return (
                <motion.div 
                  key={assessment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-noir-border/5 transition-colors cursor-pointer"
                  onClick={() => book && onViewBook(book)}
                >
                  <div className="h-12 w-12 rounded-full bg-black/60 flex items-center justify-center text-cyan border border-noir-border/40 shrink-0">
                    <Users size={20} />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="font-bold text-white truncate">{book?.title || 'Unknown Resource'}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      <span className="text-cyan font-medium">{assessment.userName}</span> • {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-noir-border/20">
                    <Star size={14} className="text-cyan fill-cyan" />
                    <span className="font-serif font-bold text-white">
                      {((assessment.scores.contentAccuracy + assessment.scores.readability + assessment.scores.pedagogy + assessment.scores.visualDesign + assessment.scores.relevance) / 5).toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-noir-border/10">
              <p className="text-zinc-500 italic">No recent evaluations recorded.</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between w-full">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white">Resource Archive</h2>
            <p className="text-zinc-400 font-light text-xs sm:text-base">Curated academic materials for professional assessment</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <Input
                placeholder="Search..."
                className="pl-12 h-12 sm:h-14 bg-transparent border-noir-border/30 hover:border-cyan/40 text-white placeholder:text-zinc-500 rounded-2xl focus:ring-noir-border/50 transition-all font-medium text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }} 
                className={cn(
                  "h-12 sm:h-14 px-4 sm:px-6 rounded-2xl border-noir-border/40 transition-all text-xs sm:text-sm font-bold flex-1 sm:flex-initial",
                  isSelectionMode ? "bg-noir-border/40 border-noir-border text-white" : "text-zinc-500 hover:bg-black/60"
                )}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </Button>
              {isSelectionMode && selectedIds.length > 0 && (
                <Button 
                  variant="danger" 
                  onClick={handleBulkDeleteAction}
                  className="h-12 sm:h-14 px-4 rounded-2xl text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-right-4 flex-1 sm:flex-initial"
                >
                  Trash ({selectedIds.length})
                </Button>
              )}
              <Button onClick={onAddBook} className="h-12 sm:h-14 px-4 sm:px-8 cyan-gradient text-white font-bold rounded-2xl gap-2 shadow-lg text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
                <Plus size={18} />
                Add Resource
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-y border-noir-border/20 py-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mr-2">
              <Filter size={12} />
              Filter By
            </div>
            {(['all', 'textbook', 'reference', 'ebook'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-3 sm:px-6 py-2 sm:py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border",
                  filter === f
                    ? "bg-noir-border text-white border-noir-border shadow-[0_0_20px_rgba(8,145,178,0.15)]"
                    : "bg-transparent text-zinc-400 border-noir-border/20 hover:border-cyan/40 hover:text-white transition-all"
                )}
              >
                {f}
              </button>
            ))}
            {isFiltered && (
              <button 
                onClick={() => { setSearch(''); setFilter('all'); setLangFilter('all'); setSystemFilter('all'); }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <Globe size={12} className="text-cyan animate-pulse" />
                Language
              </div>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="h-11 rounded-xl border border-noir-border/20 bg-black/40 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 outline-none focus:ring-1 focus:ring-noir-border/50 hover:border-cyan/40 transition-all cursor-pointer"
              >
                <option value="all" className="bg-dark-surface text-white">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang} className="bg-dark-surface text-white">{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <Layers size={12} className="text-purple-400" />
                ASU System
              </div>
              <select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="h-11 rounded-xl border border-noir-border/20 bg-black/40 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 outline-none focus:ring-1 focus:ring-noir-border/50 hover:border-cyan/40 transition-all cursor-pointer"
              >
                <option value="all" className="bg-dark-surface text-white">All ASU Systems</option>
                <option value="Ayurveda" className="bg-dark-surface text-white">Ayurveda System</option>
                <option value="Unani" className="bg-dark-surface text-white">Unani System</option>
                <option value="Siddha" className="bg-dark-surface text-white">Siddha System</option>
                <option value="General" className="bg-dark-surface text-white">General / Other</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <ArrowUpDown size={12} />
                Sort By
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 rounded-xl border border-noir-border/20 bg-black/40 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 outline-none focus:ring-1 focus:ring-noir-border/50 hover:border-cyan/40 transition-all cursor-pointer"
              >
                <option value="newest" className="bg-dark-surface text-white">Newest First</option>
                <option value="rating" className="bg-dark-surface text-white">Highest Rated</option>
                <option value="title" className="bg-dark-surface text-white">Title A-Z</option>
                <option value="year-asc" className="bg-dark-surface text-white">Year (Oldest)</option>
                <option value="year-desc" className="bg-dark-surface text-white">Year (Newest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-[40px] p-8 space-y-6">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-noir-border/10">
                  <Skeleton className="h-8 w-24 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid gap-6 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAssess={onAssess}
                onView={onViewBook}
                onDelete={onDeleteBook}
                canDelete={currentUser?.role === 'admin'}
                averageRating={bookRatings[book.id]}
                isSelected={selectedIds.includes(book.id)}
                onSelect={() => toggleSelection(book.id)}
                isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-noir-border/20 bg-noir-border/[0.05] py-32 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-black/60 text-zinc-700">
              <Search size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">No resources found</h3>
            <p className="mt-3 text-zinc-400 font-light">Refine your search parameters to find the desired material</p>
            <Button variant="outline" className="mt-10 border-noir-border/40 text-zinc-500 hover:bg-black/60" onClick={() => { setSearch(''); setFilter('all'); }}>
              Reset Archive
            </Button>
          </div>
        )}
      </section>
    </div>
  );
});

const StatCard = React.memo(({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="glass-panel rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex items-center gap-4 sm:gap-6 transition-all hover:scale-[1.02] hover:bg-black/80 hover:shadow-[0_20px_40px_rgba(8,145,178,0.05)]">
    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-black/80 shadow-inner border border-noir-border/20 shrink-0 text-cyan-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] truncate">{label}</div>
      <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-0.5 sm:mt-1">{value}</div>
    </div>
  </div>
));

const WorkflowIndicator = React.memo(({ step, label, active }: { step: string; label: string; active?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className={cn(
      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
      active ? "cyan-gradient text-white border-transparent" : "bg-black/60 text-zinc-600 border-noir-border/40"
    )}>
      {step}
    </div>
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-widest",
      active ? "text-white" : "text-zinc-600"
    )}>
      {label}
    </span>
  </div>
));

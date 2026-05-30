import React from 'react';
import { motion } from 'motion/react';
import { Book as BookIcon, User, Calendar, Tag, Star, ArrowLeft, MessageSquare, CheckCircle2, AlertCircle, Award, ShieldCheck, Trash2, Globe } from 'lucide-react';
import { Book, Assessment, UserProfile } from '../types';
import { Badge, Button, Card } from './ui';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

interface BookDetailsProps {
  book: Book;
  assessments: Assessment[];
  onBack: () => void;
  onAssess: (book: Book) => void;
  onDeleteBook?: (id: string) => void;
  onDeleteAssessment?: (id: string) => void;
  currentUser?: UserProfile | null;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, assessments, onBack, onAssess, onDeleteBook, onDeleteAssessment, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = onDeleteBook && isAdmin;

  const userLang = currentUser?.language || 'English';
  const bookLang = book.language || 'English';
  const isMatch = userLang.toLowerCase().trim() === bookLang.toLowerCase().trim();

  const handleDelete = () => {
    if (window.confirm('Move this resource to the trash? You can restore it later from the Resource Recovery Vault.')) {
      onDeleteBook?.(book.id);
      onBack();
    }
  };
  const activeAssessments = assessments.filter(a => a.status === 'active' || !a.status);
  const averageScores = activeAssessments.length > 0 ? {
    contentAccuracy: activeAssessments.reduce((acc, curr) => acc + curr.scores.contentAccuracy, 0) / activeAssessments.length,
    readability: activeAssessments.reduce((acc, curr) => acc + curr.scores.readability, 0) / activeAssessments.length,
    pedagogy: activeAssessments.reduce((acc, curr) => acc + curr.scores.pedagogy, 0) / activeAssessments.length,
    visualDesign: activeAssessments.reduce((acc, curr) => acc + curr.scores.visualDesign, 0) / activeAssessments.length,
    relevance: activeAssessments.reduce((acc, curr) => acc + curr.scores.relevance, 0) / activeAssessments.length,
  } : null;

  const overallAvg = averageScores ? (Object.values(averageScores).reduce((a, b) => a + b, 0) / 5).toFixed(1) : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 space-y-12 sm:space-y-16 pb-32"
    >
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="rounded-full h-12 w-12 border border-noir-border/20 text-zinc-500 hover:text-cyan hover:border-cyan/40 transition-all bg-black/20"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="h-px flex-1 border-b border-noir-border/10"></div>
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">Resource Dossier</h2>
        {canDelete && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="h-12 px-6 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
          >
            <Trash2 size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Remove Resource</span>
          </Button>
        )}
      </div>

      <div className="grid gap-12 lg:gap-20 lg:grid-cols-12">
        {/* Left Column: Book Info */}
        <div className="space-y-8 sm:space-y-10 lg:col-span-5 order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[40px] border border-noir-border/40 bg-black/40 p-4 shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                loading="lazy"
                decoding="async"
                className="rounded-[32px] object-cover w-full aspect-[3/4] opacity-80 hover:opacity-100 transition-opacity duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[32px] bg-black/60 text-zinc-800">
                <BookIcon size={120} strokeWidth={1} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

            <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-noir-border/10 border border-noir-border/40 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan">
                  {book.type}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  <ShieldCheck size={12} />
                  Verified Entry
                </div>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">{book.title}</h1>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 text-base sm:text-xl font-medium text-zinc-500">
                  <User size={18} className="text-cyan" />
                  <span>{book.author}</span>
                </div>
                {/* Smart Language-Match Indicator */}
                <div>
                  {isMatch ? (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Fluent Match ({userLang})</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse">
                      <AlertCircle size={14} className="text-amber-500" />
                      <span>Secondary Language: {bookLang} (Preferred: {userLang})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-8 py-6 sm:py-8 border-y border-noir-border/20">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Publication</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm sm:text-base">
                  <Calendar size={16} className="text-cyan/50" />
                  <span>{book.year}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Publisher</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm sm:text-base">
                  <Tag size={16} className="text-cyan/50" />
                  <span>{book.publisher}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Acquisition Source</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm sm:text-base">
                  <ShieldCheck size={16} className="text-cyan/50" />
                  <span>{book.source || "Verified Archive"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-cyan">Abstract</h4>
              <p className="text-zinc-500 leading-relaxed font-light text-sm sm:text-lg italic">"{book.description || "No description provided."}"</p>
            </div>

            <Button size="lg" className="w-full h-14 sm:h-16 rounded-2xl cyan-gradient text-white font-bold text-sm sm:text-lg shadow-xl" onClick={() => onAssess(book)}>
              Initiate Quality Assessment
            </Button>
          </div>
        </div>

        {/* Right Column: Assessment Results */}
        <div className="space-y-16 lg:col-span-7 order-1 lg:order-2">
          {/* Quality Metrics */}
          <section className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-3xl font-bold text-white">Quality Index</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {assessments.length > 0 
                    ? `Based on ${assessments.length} verified peer review${assessments.length === 1 ? '' : 's'}` 
                    : 'No reviews yet'}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-noir-border/[0.08] border border-noir-border/[0.08] px-6 py-3 text-white backdrop-blur-md w-fit">
                <Star size={20} className="fill-noir-border text-cyan" />
                <span className="text-3xl font-serif font-bold text-white">{overallAvg}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">/ 10.0</span>
              </div>
            </div>

            {averageScores ? (
              <div className="grid gap-10 sm:grid-cols-2">
                <MetricBar label="Content Accuracy" value={averageScores.contentAccuracy} color="cyan-gradient" />
                <MetricBar label="Readability" value={averageScores.readability} color="cyan-gradient" />
                <MetricBar label="Pedagogy" value={averageScores.pedagogy} color="cyan-gradient" />
                <MetricBar label="Visual Design" value={averageScores.visualDesign} color="cyan-gradient" />
                <MetricBar label="Relevance" value={averageScores.relevance} color="cyan-gradient" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-noir-border/20 bg-noir-border/[0.05] py-20 text-center">
                <AlertCircle size={48} className="mb-6 text-zinc-700" />
                <p className="text-xl font-serif font-bold text-zinc-500">Awaiting Peer Review</p>
                <p className="text-sm text-zinc-500 mt-2">Become the first verified evaluator for this resource.</p>
              </div>
            )}
          </section>

          {/* Recent Evaluations */}
          <section className="space-y-10">
            <h3 className="font-serif text-3xl font-bold text-white">Verified Peer Reviews</h3>
            <div className="space-y-6">
              {activeAssessments.length > 0 ? (
                activeAssessments.sort((a, b) => b.createdAt - a.createdAt).map((assessment) => (
                  <div key={assessment.id} className="glass-panel rounded-[32px] p-8 space-y-6 transition-all hover:bg-noir-border/[0.15]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-cyan border border-noir-border/40">
                          <User size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            {assessment.userName}
                            <ShieldCheck size={14} className="text-emerald-500" />
                          </div>
                          <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{format(assessment.createdAt, 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {(assessment.userId === currentUser?.uid || isAdmin) && onDeleteAssessment && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete your review?')) {
                                onDeleteAssessment(assessment.id);
                              }
                            }}
                            className="rounded-full p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            title="Delete Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className={cn(
                          "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest border",
                          assessment.recommendation === 'highly-recommended' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          assessment.recommendation === 'not-recommended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-black/60 text-zinc-500 border-noir-border/40'
                        )}>
                          {assessment.recommendation.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-6 border-y border-noir-border/20">
                      {Object.entries(assessment.scores).map(([key, val]) => (
                        <SmallMetricBar key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={val} />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan uppercase tracking-widest">
                        <MessageSquare size={14} />
                        Evaluator Feedback
                      </div>
                      <p className="text-zinc-500 leading-relaxed font-light italic text-lg">"{assessment.comments}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-zinc-500 font-medium italic">No verified reviews recorded in the archive.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 uppercase tracking-[0.3em] text-[10px] font-bold">{label}</span>
      <span className="text-white font-serif font-bold text-lg">{value.toFixed(1)}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-noir-border/20">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={cn("h-full rounded-full shadow-[0_0_15px_rgba(8,145,178,0.15)]", color)}
      />
    </div>
  </div>
);

const SmallMetricBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="text-xs font-serif font-bold text-cyan">{value.toFixed(1)}</span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/60">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full cyan-gradient"
      />
    </div>
  </div>
);

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Book as BookIcon, 
  User, 
  Calendar, 
  Tag, 
  Star, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ShieldCheck, 
  Trash2, 
  Globe, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Book, Assessment, UserProfile } from '../types';
import { Badge, Button } from './ui';
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
  onUpdateBook?: (bookId: string, updatedFields: Partial<Book>) => Promise<void>;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ 
  book, 
  assessments, 
  onBack, 
  onAssess, 
  onDeleteBook, 
  onDeleteAssessment, 
  currentUser,
  onUpdateBook 
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = onDeleteBook && isAdmin;

  const userLang = currentUser?.language || 'English';
  const bookLang = book.language || 'English';
  const isMatch = userLang.toLowerCase().trim() === bookLang.toLowerCase().trim();

  // State hooks for ASU/NCISM executive summarization & decisions
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [committeeDecisionForm, setCommitteeDecisionForm] = useState({
    decision: book.committeeDecision || 'pending',
    summary: book.committeeSummary || '',
    authorizedBy: book.committeeDecisionBy || (currentUser?.displayName ? `${currentUser.displayName}` : 'Board of Governors')
  });

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

  // Auto-Draft Dossier Heuristic
  const autoDraftDossier = () => {
    if (activeAssessments.length === 0) {
      alert("Need reviews from countrywide subject specialists before a consensus report can be compiled.");
      return;
    }
    const count = activeAssessments.length;
    const avgScore = parseFloat(overallAvg);
    const positiveRemarks: string[] = [];
    const criticalRemarks: string[] = [];
    let highlyRecommendedCount = 0;
    let notRecommendedCount = 0;

    activeAssessments.forEach(a => {
      if (a.recommendation === 'highly-recommended') highlyRecommendedCount++;
      if (a.recommendation === 'not-recommended') notRecommendedCount++;
      
      if (a.scores.contentAccuracy >= 8 || a.scores.relevance >= 8) {
        positiveRemarks.push(a.comments.trim());
      } else if (a.scores.contentAccuracy <= 5 || a.scores.relevance <= 5) {
        criticalRemarks.push(a.comments.trim());
      }
    });

    let draft = `EXECUTIVE DOSSIER REPORT SUMMARY FOR AYUSH / NCISM COMMISSION\n`;
    draft += `Subject Discipline: ${book.subject || 'Core Curriculum'}. system: ${book.system || 'ASU System'}.\n`;
    draft += `Validated evaluation metrics on this textbook from ${count} active nationwide subject assessors yield a consensus benchmark quotient of ${avgScore}/10.0.\n\n`;
    
    if (notRecommendedCount > 0) {
      draft += `CRITICAL NOTE: At least ${notRecommendedCount} regional evaluator rejected standard licensing, citing poor accuracy or vested non-academic publishing bias. `;
    } else if (highlyRecommendedCount >= 2) {
      draft += `CONSENSUS APPROVAL: Evaluators show overwhelming alignment on standard integration, praising the book as fully compatible with core CCIM syllabi. `;
    } else {
      draft += `CONSENSUS STANDING: General reviewer standing is adequate; textbook is certified for reference use. `;
    }

    if (positiveRemarks.length > 0) {
      draft += `Observed strengths focus on: "${positiveRemarks[0].substring(0, 150)}${positiveRemarks[0].length > 150 ? '...' : ''}" `;
    }
    if (criticalRemarks.length > 0) {
      draft += `Indentified correctives specify: "${criticalRemarks[0].substring(0, 150)}${criticalRemarks[0].length > 150 ? '...' : ''}"`;
    }

    setCommitteeDecisionForm(prev => ({
      ...prev,
      summary: draft
    }));
  };

  // Compile Consensus & Publish Heuristic Summary
  const generateHeuristicConsensusSummary = async () => {
    setIsGeneratingSummary(true);
    
    try {
      // Simulate active AI/heuristic synthesising lag
      await new Promise(r => setTimeout(r, 1200));
      
      const count = activeAssessments.length;
      if (count === 0) {
        alert("Need countrywide subject-wise peer reviews first to build a consensus report.");
        setIsGeneratingSummary(false);
        return;
      }

      const score = parseFloat(overallAvg);
      const topComments = activeAssessments.map(a => a.comments).slice(0, 2).join("; ");
      
      let finalDecision: Book['committeeDecision'] = 'pending';
      if (score >= 8.0) {
        finalDecision = 'recommended';
      } else if (score >= 5.0) {
        finalDecision = 'revision-requested';
      } else {
        finalDecision = 'flagged-substandard';
      }

      const systemClaim = book.syllabusCompliance 
        ? "Formally aligns with recommended NCISM/CCIM syllabi rules." 
        : "Evaluation has identified curriculum variances with the CCIM directive.";

      const autoSummary = `Consensus synthesized from ${count} nation-wide reviewer dossiers for the textbook "${book.title}" in the ${book.system || 'ASU'} system (${book.subject || 'Specialty'} discipline). Peer review averages score a ${score}/10.0. Key expert feedback shows: "${topComments.substring(0, 200)}...". ${systemClaim} The NCISM expert panel assigns the syllabus status of: ${finalDecision.toUpperCase().replace('-', ' ')}.`;

      if (onUpdateBook) {
        await onUpdateBook(book.id, {
          committeeDecision: finalDecision,
          committeeSummary: autoSummary,
          committeeDecisionAt: Date.now(),
          committeeDecisionBy: 'Commission Secretariat (Digital Consensus Heuristic)'
        });
        
        setCommitteeDecisionForm(prev => ({
          ...prev,
          decision: finalDecision!,
          summary: autoSummary,
          authorizedBy: 'Commission Secretariat (Digital Consensus Heuristic)'
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Publish Admin Committee Decision
  const saveCommitteeDecision = async () => {
    if (!onUpdateBook) return;
    setIsSavingDecision(true);
    try {
      await onUpdateBook(book.id, {
        committeeDecision: committeeDecisionForm.decision as any,
        committeeSummary: committeeDecisionForm.summary,
        committeeDecisionBy: committeeDecisionForm.authorizedBy,
        committeeDecisionAt: Date.now()
      });
      alert("AYUSH/NCISM Expert Committee verification saved and officially signed.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit Commission authorized update to Firestore.");
    } finally {
      setIsSavingDecision(false);
    }
  };

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
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">NCISM ASU Dossier</h2>
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
        {/* Left Column: Resource Metadata & Details */}
        <div className="space-y-8 sm:space-y-10 lg:col-span-5 order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[40px] border border-noir-border/40 bg-black/40 p-4 shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                loading="lazy"
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
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-noir-border/10 border border-noir-border/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan">
                  {book.type}
                </div>
                {book.system && (
                  <div className="flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    <Globe size={10} />
                    {book.system} Medicine
                  </div>
                )}
                {book.syllabusCompliance ? (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <ShieldCheck size={10} />
                    CCIM / NCISM Compliant
                  </div>
                ) : (
                  <div className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Unverified Syllabus
                  </div>
                )}
              </div>
              
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {book.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 text-base sm:text-xl font-medium text-zinc-500">
                  <User size={18} className="text-cyan" />
                  <span>{book.author}</span>
                </div>
                <div>
                  {isMatch ? (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Fluent Match ({userLang})</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                      <AlertCircle size={14} className="text-amber-500" />
                      <span>Language: {bookLang} (Preferred: {userLang})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 py-6 sm:py-8 border-y border-noir-border/20">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Publication Year</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <Calendar size={16} className="text-cyan/50" />
                  <span>{book.year}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Publisher</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <Tag size={16} className="text-cyan/50" />
                  <span>{book.publisher}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Discipline Specialty</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <Layers size={16} className="text-cyan/50" />
                  <span>{book.subject || "Not Classified"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Acquisition Source</div>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <ShieldCheck size={16} className="text-cyan/50" />
                  <span>{book.source || "NCISM Central Repository"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-cyan">Abstract / Description</h4>
              <p className="text-zinc-500 leading-relaxed font-light text-sm italic">
                "{book.description || "No textbook description provided."}"
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 sm:h-16 rounded-2xl cyan-gradient text-white font-bold text-sm sm:test-lg shadow-xl" 
              onClick={() => onAssess(book)}
            >
              Submit Medical Review
            </Button>
          </div>
        </div>

        {/* Right Column: NCISM Review Scale & Peer Evaluations */}
        <div className="space-y-12 lg:col-span-7 order-1 lg:order-2">
          {/* Quality Metrics */}
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-3xl font-bold text-white">Quality Index</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {activeAssessments.length > 0 
                    ? `Based on ${activeAssessments.length} verified subject evaluation${activeAssessments.length === 1 ? '' : 's'}` 
                    : 'No evaluations submitted yet countrywide.'}
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
                <MetricBar label="Pedagogy & Structure" value={averageScores.pedagogy} color="cyan-gradient" />
                <MetricBar label="Visual Design" value={averageScores.visualDesign} color="cyan-gradient" />
                <MetricBar label="Curriculum Relevance" value={averageScores.relevance} color="cyan-gradient" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-noir-border/20 bg-noir-border/[0.05] py-20 text-center">
                <AlertCircle size={48} className="mb-6 text-zinc-700" />
                <p className="text-xl font-serif font-bold text-zinc-500">Awaiting Representative Reviews</p>
                <p className="text-sm text-zinc-500 mt-2">No regional Ayurveda, Unani, or Siddha reviewer has published validation scores yet.</p>
              </div>
            )}
          </section>

          {/* NCISM 3-Reviewer Scale Tracker & Executive Decision Panel */}
          <section className="glass-panel rounded-[32px] p-6 sm:p-8 space-y-8 border-noir-border/30 bg-black/40 shadow-xl border">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="text-purple-400" size={20} />
                  NCISM Curriculum Status Scale
                </h3>
                <p className="text-xs text-zinc-500">National Reviewer Quorum & Expert Committee Decision Directives</p>
              </div>
              <div className={cn(
                "rounded-full text-[10px] font-bold uppercase tracking-widest py-1 px-3 border shrink-0",
                book.committeeDecision === 'recommended' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                book.committeeDecision === 'revision-requested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                book.committeeDecision === 'flagged-substandard' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              )}>
                Committee: {book.committeeDecision ? book.committeeDecision.replace('-', ' ') : 'Pending Consensus'}
              </div>
            </div>

            {/* Quorum Progress (Three independent reviewers needed) */}
            <div className="rounded-2xl bg-black/30 p-4 border border-noir-border/15">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">National Evaluator Quorum Progress</span>
                <span className="text-xs font-mono font-bold text-cyan">{activeAssessments.length}/3 Reviews Logged</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[1, 2, 3].map((reviewerIndex) => {
                  const reviewerSubmitted = activeAssessments.length >= reviewerIndex;
                  const assessment = activeAssessments[reviewerIndex - 1];
                  return (
                    <div key={reviewerIndex} className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                      reviewerSubmitted 
                        ? 'bg-cyan-500/[0.04] border-cyan-500/20 text-cyan-400' 
                        : 'bg-black/40 border-noir-border/10 text-zinc-600'
                    )}>
                      <User size={16} className={cn("mb-1", reviewerSubmitted ? "text-cyan" : "text-zinc-700")} />
                      <div className="text-[9px] font-bold uppercase tracking-widest">Reviewer {reviewerIndex}</div>
                      <div className="text-[8px] mt-0.5 text-zinc-500 truncate max-w-full font-light">
                        {reviewerSubmitted ? assessment.userName.split(' ')[0] : 'Awaiting Peer'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeAssessments.length < 3 && (
                <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1.5 font-light leading-relaxed">
                  <AlertCircle size={12} className="text-amber-500 shrink-0" />
                  At least 3 subject-wise reviews are recommended under the NCISM syllabus guidelines to prevent skewed reviews or substandard selections.
                </p>
              )}
            </div>

            {/* Substandard Content Flag Indicator */}
            {activeAssessments.some(a => a.recommendation === 'not-recommended' || a.scores.contentAccuracy <= 5) && (
              <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">Conflict / Substandard Alert</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
                    Potential substandard quality flags, syllabus mismatch claims, or vested marketing interests caught by nationwide reviewers' evaluations. Recommend immediate expert audit.
                  </p>
                </div>
              </div>
            )}

            {/* Official Executive Committee Synthesis */}
            <div className="space-y-4 pt-4 border-t border-noir-border/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-cyan flex items-center gap-2">
                  <Activity size={14} />
                  Expert Consensus Dossier Report
                </h4>
                {activeAssessments.length > 0 && (
                  <Button 
                    onClick={generateHeuristicConsensusSummary} 
                    className="h-8 px-3 rounded-lg border border-noir-border/20 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-cyan hover:border-cyan/40 bg-black/20 gap-1"
                    disabled={isGeneratingSummary}
                  >
                    <Sparkles size={11} className={cn(isGeneratingSummary && "animate-spin")} />
                    {isGeneratingSummary ? 'Synthesizing...' : 'Summarize Reviews Consensus'}
                  </Button>
                )}
              </div>

              {book.committeeDecision && book.committeeDecision !== 'pending' ? (
                <div className="rounded-[24px] bg-noir-border/[0.04] border border-noir-border/10 p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-noir-border/10 pb-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Official Directive Decree</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <CheckCircle2 className="text-emerald-500 animate-pulse" size={14} />
                        NCISM CURRICULUM ORDER
                      </div>
                    </div>
                    {book.committeeDecisionAt && (
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                        Certified: {format(book.committeeDecisionAt, 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed italic font-light">
                    "{book.committeeSummary || 'Consensus summary being synthesized by Secretary.'}"
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-t border-noir-border/[0.05]">
                    <span>AUTHORIZED BOARD:</span>
                    <span className="text-cyan font-mono">{book.committeeDecisionBy || 'Expert Committee Panel'}</span>
                    <span className="text-emerald-500/80 ml-auto border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-full font-mono">NCISM VERIFIED</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-noir-border/20 p-6 text-center bg-black/20">
                  <p className="text-xs text-zinc-500 italic font-light">
                    No official committee rating declaration published yet. Run the reviews summarization above or let an authorized admin publish the executive directive below.
                  </p>
                </div>
              )}
            </div>

            {/* Admin-Only Control Form */}
            {isAdmin && onUpdateBook && (
              <div className="space-y-6 pt-6 border-t border-noir-border/10 bg-noir-border/[0.02] p-4 sm:p-6 rounded-[24px] border border-noir-border/10">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                    <ShieldCheck size={14} />
                    Commission Executive Directive Board
                  </h4>
                  <p className="text-[10px] text-zinc-500">Submit the final NCISM syllabus sanction and curriculum rating.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Syllabus Status Action</label>
                    <select
                      value={committeeDecisionForm.decision}
                      onChange={(e: any) => setCommitteeDecisionForm(prev => ({ ...prev, decision: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-noir-border/30 bg-black/60 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 focus:ring-1 focus:ring-purple-500/50 outline-none"
                    >
                      <option value="pending">Authorize Decision (Pending)</option>
                      <option value="recommended">Highly Recommended (AYUSH/NCISM Standard)</option>
                      <option value="revision-requested">Revisions Demanded (Needs Review Alignment)</option>
                      <option value="flagged-substandard">Censured (Substandard / Vested Interest Flags)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Authorizing Body Signatory</label>
                    <Input
                      value={committeeDecisionForm.authorizedBy}
                      onChange={(e: any) => setCommitteeDecisionForm(prev => ({ ...prev, authorizedBy: e.target.value }))}
                      placeholder="e.g. NCISM Curriculum Governors"
                      className="h-10 text-xs text-white border-noir-border/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Executive remarks & Assessment Synthesis directive</label>
                  <textarea
                    value={committeeDecisionForm.summary}
                    onChange={(e: any) => setCommitteeDecisionForm(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Input detailed NCISM decision remarks. Address whether standard requirements are fulfilled or how formatting/accuracy was analyzed to bypass vested publisher biases."
                    className="w-full min-h-[110px] rounded-2xl border border-noir-border/30 bg-black/60 p-4 text-xs text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500/40 outline-none hover:border-purple-500/20 focus:border-purple-500/30 transition-all font-light leading-relaxed font-mono"
                  />
                  <div className="flex gap-2 justify-end pt-2 flex-wrap">
                    {activeAssessments.length > 0 && (
                      <Button 
                        onClick={autoDraftDossier}
                        className="h-10 px-4 rounded-xl border border-noir-border/20 text-[9px] font-bold uppercase tracking-widest text-purple-400 hover:bg-purple-500/10 bg-black/40"
                      >
                        Auto-Draft Synthesis Dossier
                      </Button>
                    )}
                    <Button
                      onClick={saveCommitteeDecision}
                      disabled={isSavingDecision}
                      className="h-10 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      {isSavingDecision ? 'Saving...' : 'Sign and Authorize Decision'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Peer Reviews Listing */}
          <section className="space-y-10">
            <h3 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={24} className="text-cyan/80" />
              Verified Nationwide Peer Reviews
            </h3>
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
                          <div className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                            {assessment.userName}
                            <ShieldCheck size={14} className="text-emerald-500" />
                          </div>
                          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{format(assessment.createdAt, 'MMM d, yyyy')}</div>
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
                      <p className="text-zinc-500 leading-relaxed font-light italic text-sm">"{assessment.comments}"</p>
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

// Fallback Input Component to ensure independent rendering of strings
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "flex w-full rounded-2xl border border-noir-border/20 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan/40 focus:border-cyan/40 transition-all",
      className
    )}
  />
);

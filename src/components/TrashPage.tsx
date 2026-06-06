import React from 'react';
import { motion } from 'motion/react';
import { Trash2, RotateCcw, ArrowLeft, ShieldAlert, BookOpen, Star, Clock } from 'lucide-react';
import { Book, Assessment } from '../types';
import { Button } from './ui';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

import { UserProfile } from '../types';

interface TrashPageProps {
  books: Book[];
  assessments: Assessment[];
  onBack: () => void;
  onRestoreBook: (id: string) => void;
  onPermanentDeleteBook: (id: string) => void;
  onRestoreAssessment: (id: string) => void;
  onPermanentDeleteAssessment: (id: string) => void;
  currentUser: UserProfile;
}

export const TrashPage: React.FC<TrashPageProps> = ({ 
  books, 
  assessments, 
  onBack, 
  onRestoreBook, 
  onPermanentDeleteBook,
  onRestoreAssessment,
  onPermanentDeleteAssessment,
  currentUser 
}) => {
  const isAdmin = currentUser.role === 'admin';
  const trashedBooks = books.filter(b => b.status === 'trashed' && isAdmin);
  const trashedAssessments = assessments.filter(a => a.status === 'trashed' && (isAdmin || a.userId === currentUser.uid));

  return (
    <div className="relative">
      {/* Decorative Background Icon */}
      <div className="fixed -bottom-32 -right-32 text-zinc-900/10 pointer-events-none z-0">
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            type: "tween",
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Trash2 size={700} strokeWidth={0.5} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-12 space-y-8 sm:space-y-12 pb-32"
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
        <div className="flex items-center gap-3 text-white">
          <ShieldAlert size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Resource Recovery Vault</h2>
        </div>
      </div>

      <div className="grid gap-8 lg:gap-16 grid-cols-1 lg:grid-cols-2">
        {/* Trashed Books */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <img src="/app-logo.png" alt="" className="h-6 w-6 object-contain" />
              Trashed Resources
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
              {trashedBooks.length} Items
            </span>
          </div>

          <div className="space-y-4">
            {trashedBooks.length > 0 ? (
              trashedBooks.map(book => (
                <div key={book.id} className="glass-panel rounded-3xl p-6 space-y-4 border-noir-border/20 hover:border-noir-border/40 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-cyan uppercase tracking-widest">{book.type}</div>
                      <div className="text-white font-medium text-lg leading-tight">{book.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest">
                        <Clock size={12} />
                        Deleted {book.deletedAt ? format(book.deletedAt, 'MMM d, yyyy HH:mm') : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onRestoreBook(book.id)}
                      className="flex-1 rounded-xl border-noir-border/40 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 gap-2"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => {
                        if (window.confirm('Permanently purge this resource? This cannot be undone.')) {
                          onPermanentDeleteBook(book.id);
                        }
                      }}
                      className="flex-1 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
                    >
                      <Trash2 size={14} />
                      Purge
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 rounded-[32px] border border-dashed border-noir-border/20 bg-noir-border/[0.05] text-zinc-500 italic">
                The resource vault is empty.
              </div>
            )}
          </div>
        </div>

        {/* Trashed Assessments */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Star className="text-cyan" size={24} />
              Trashed Reviews
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
              {trashedAssessments.length} Items
            </span>
          </div>

          <div className="space-y-4">
            {trashedAssessments.length > 0 ? (
              trashedAssessments.map(assessment => {
                const book = books.find(b => b.id === assessment.bookId);
                return (
                  <div key={assessment.id} className="glass-panel rounded-3xl p-6 space-y-4 border-noir-border/20 hover:border-noir-border/40 transition-all">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-cyan uppercase tracking-widest">Review for</div>
                      <div className="text-white font-medium leading-tight">{book?.title || 'Unknown Resource'}</div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest">
                        <Clock size={12} />
                        Deleted {assessment.deletedAt ? format(assessment.deletedAt, 'MMM d, yyyy HH:mm') : 'Recently'}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onRestoreAssessment(assessment.id)}
                        className="flex-1 rounded-xl border-noir-border/40 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 gap-2"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm('Permanently purge this review? This cannot be undone.')) {
                            onPermanentDeleteAssessment(assessment.id);
                          }
                        }}
                        className="flex-1 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
                      >
                        <Trash2 size={14} />
                        Purge
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 rounded-[32px] border border-dashed border-noir-border/20 bg-noir-border/[0.05] text-zinc-500 italic">
                No trashed reviews found.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

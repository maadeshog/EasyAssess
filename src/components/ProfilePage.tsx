import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, ShieldCheck, BookOpen, Star, ArrowLeft, Trash2 } from 'lucide-react';
import { UserProfile, Book, Assessment } from '../types';
import { Button } from './ui';
import { format } from 'date-fns';

interface ProfilePageProps {
  user: UserProfile;
  books: Book[];
  assessments: Assessment[];
  onBack: () => void;
  onDeleteBook?: (id: string) => void;
  onDeleteAssessment?: (id: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, books, assessments, onBack, onDeleteBook, onDeleteAssessment }) => {
  const userBooks = books.filter(b => b.createdBy === user.uid && (b.status === 'active' || !b.status));
  const userAssessments = assessments.filter(a => a.userId === user.uid && (a.status === 'active' || !a.status));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 space-y-8 sm:space-y-12 pb-32"
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
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">Evaluator Profile</h2>
      </div>

      <div className="glass-panel rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 space-y-8 sm:space-y-12">
        <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10">
          <div className="relative">
            <div className="h-32 w-32 rounded-full cyan-gradient p-1">
              <div className="h-full w-full rounded-full bg-black/60 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={64} className="text-cyan" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-noir-border shadow-lg">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl font-serif font-bold text-white">{user.displayName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-zinc-500 font-light">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-cyan/50" />
                <span>{user.email || user.phoneNumber || 'No contact info'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-cyan/50" />
                <span>Joined {format(user.createdAt, 'MMMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500/50" />
                <span className="capitalize">{user.role} Status</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-black/60 p-8 border border-noir-border/20 space-y-2">
            <div className="flex items-center gap-3 text-cyan">
              <img src="/app-logo.png" alt="Books" className="h-5 w-5 object-contain" />
              <span className="text-xs font-bold uppercase tracking-widest">Resources Contributed</span>
            </div>
            <div className="text-4xl font-serif font-bold text-white">{userBooks.length}</div>
          </div>
          <div className="rounded-3xl bg-black/60 p-8 border border-noir-border/20 space-y-2">
            <div className="flex items-center gap-3 text-cyan">
              <Star size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Assessments Completed</span>
            </div>
            <div className="text-4xl font-serif font-bold text-white">{userAssessments.length}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:gap-12 grid-cols-1 md:grid-cols-2">
        <div className="space-y-8">
          <h3 className="text-2xl font-serif font-bold text-white">Recent Activity</h3>
          <div className="space-y-4">
            {userAssessments.length > 0 ? (
              userAssessments.slice(0, 5).map(assessment => {
                const book = books.find(b => b.id === assessment.bookId);
                return (
                  <div key={assessment.id} className="glass-panel rounded-3xl p-6 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-cyan uppercase tracking-widest">Assessment Submitted</div>
                      <div className="text-white font-medium">{book?.title || 'Unknown Resource'}</div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{format(assessment.createdAt, 'MMM d, yyyy')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-full bg-noir-border/10 border border-noir-border/40 px-3 py-1 text-xs font-bold text-cyan">
                        <Star size={12} className="fill-noir-border" />
                        {(Object.values(assessment.scores).reduce((a, b) => a + b, 0) / 5).toFixed(1)}
                      </div>
                      {onDeleteAssessment && (
                        <button
                          onClick={() => {
                            if (window.confirm('Move this review to the trash?')) {
                              onDeleteAssessment(assessment.id);
                            }
                          }}
                          className="text-red-500/50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-500 italic">No recent activity recorded.</div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-serif font-bold text-white">Contributed Resources</h3>
          <div className="space-y-4">
            {userBooks.length > 0 ? (
              userBooks.map(book => (
                <div key={book.id} className="glass-panel rounded-3xl p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-cyan uppercase tracking-widest">{book.type}</div>
                    <div className="text-white font-medium">{book.title}</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{format(book.createdAt, 'MMM d, yyyy')}</div>
                  </div>
                  {user.role === 'admin' && onDeleteBook && (
                    <button
                      onClick={() => {
                        if (window.confirm('Move this resource to the trash?')) {
                          onDeleteBook(book.id);
                        }
                      }}
                      className="text-red-500/50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-500 italic">No resources contributed yet.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

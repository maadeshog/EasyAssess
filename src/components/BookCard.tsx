import React from 'react';
import { motion } from 'motion/react';
import { Book as BookIcon, User, Calendar, Tag, Star, ChevronRight, Award, Trash2, Hash, ShieldCheck, Globe } from 'lucide-react';
import { Book } from '@/src/types';
import { Button } from './ui';
import { cn } from '@/src/lib/utils';

interface BookCardProps {
  book: Book;
  onAssess: (book: Book) => void;
  onView: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  canDelete?: boolean;
  averageRating?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  isSelectionMode?: boolean;
}

export const BookCard: React.FC<BookCardProps> = React.memo(({ 
  book, 
  onAssess, 
  onView, 
  onDelete, 
  canDelete, 
  averageRating,
  isSelected,
  onSelect,
  isSelectionMode
}) => {
  return (
    <motion.div
      whileHover={isSelectionMode ? { scale: 1.005 } : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }} // Snappier timing
      onClick={isSelectionMode ? onSelect : undefined}
      className={cn(isSelectionMode && "cursor-pointer")}
    >
      <div className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[32px] border transition-all duration-300",
        isSelectionMode 
          ? isSelected 
            ? "border-noir-border bg-black/60 shadow-[0_0_30px_rgba(8,145,178,0.1)]" 
            : "border-noir-border/40 bg-black/40 hover:border-noir-border/60 hover:bg-black/50 hover:shadow-[0_0_20px_rgba(8,145,178,0.05)]"
          : "border-noir-border/40 bg-black/40 hover:border-noir-border/80 hover:bg-black/60 hover:shadow-[0_10px_40px_rgba(8,145,178,0.08)]"
      )}>
        <div className="relative aspect-[2/3] overflow-hidden bg-black/60 transition-all duration-300 ring-0 ring-cyan-500/0 group-hover:ring-2 group-hover:ring-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]">
          {isSelectionMode && (
            <div className="absolute left-6 top-6 z-20">
              <div className={cn(
                "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-noir-border border-noir-border text-white" 
                  : "bg-black/40 border-noir-border/40"
              )}>
                {isSelected && <ShieldCheck size={14} />}
              </div>
            </div>
          )}
          
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-700">
              <BookIcon size={80} strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          <div className="absolute left-6 top-6 flex flex-col gap-2">
            {!isSelectionMode && (
              <div className="rounded-full bg-black/40 border border-noir-border/40 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {book.type}
              </div>
            )}
            {canDelete && onDelete && !isSelectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Move this resource to the trash? You can restore it later from the Resource Recovery Vault.')) {
                    onDelete(book.id);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/30 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          {averageRating && averageRating > 0 && (
            <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-noir-border px-3 py-1 text-xs font-black text-white shadow-lg">
              <Star size={12} className="fill-noir-border" />
              {averageRating.toFixed(1)}
            </div>
          )}

          {/* Smart Assessment Badge */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
            <div className="rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck size={10} />
              Screened
            </div>
            {book.language && (
              <div className="rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Globe size={10} />
                {book.language}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-8">
          <div className="mb-4 sm:mb-6 space-y-2">
            <h3 className="line-clamp-2 font-serif text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-white transition-colors">
              {book.title}
            </h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <User size={14} className="text-cyan/40" />
                <span>{book.author}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <Hash size={10} className="text-cyan/20" />
                <span>ISBN: {book.isbn}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>{book.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={12} />
                <span>{book.publisher}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-[2] h-12 rounded-2xl cyan-gradient text-white font-bold gap-2 border-none hover:shadow-[0_0_20px_rgba(8,145,178,0.2)] transition-all"
                onClick={() => onAssess(book)}
                aria-label={`Assess ${book.title}`}
              >
                Assess
                <ChevronRight size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-12 rounded-2xl border-noir-border/60 text-white hover:bg-noir-border/20 hover:border-noir-border/40 transition-all font-bold"
                onClick={() => onView(book)}
                aria-label={`View details for ${book.title}`}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

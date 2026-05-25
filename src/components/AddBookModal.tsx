import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Image as ImageIcon, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input } from './ui';
import { motion, AnimatePresence } from 'motion/react';

const isValidISBN = (isbn: string) => {
  const clean = isbn.replace(/[-\s]/g, '');
  
  if (clean.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(clean[i]);
      if (isNaN(digit)) return false;
      sum += (10 - i) * digit;
    }
    const last = clean[9].toUpperCase();
    if (last === 'X') {
      sum += 10;
    } else {
      const lastDigit = parseInt(last);
      if (isNaN(lastDigit)) return false;
      sum += lastDigit;
    }
    return sum % 11 === 0;
  } else if (clean.length === 13) {
    if (!clean.startsWith('978') && !clean.startsWith('979')) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(clean[i]);
      if (isNaN(digit)) return false;
      sum += (i % 2 === 0 ? 1 : 3) * digit;
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(clean[12]);
  }
  return false;
};

const bookSchema = z.object({
  title: z.string().min(2, "Title is too short").max(200),
  author: z.string().min(2, "Author name is too short").max(100),
  isbn: z.string().refine(isValidISBN, {
    message: "Invalid ISBN format or checksum. Please provide a valid ISBN-10 or ISBN-13."
  }),
  year: z.number().min(1800).max(new Date().getFullYear()),
  publisher: z.string().min(2, "Publisher name is too short").max(100),
  type: z.enum(['textbook', 'reference', 'ebook']),
  source: z.string().min(2, "Source is required").max(200),
  description: z.string().max(1000).optional(),
  coverUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: BookFormValues) => void;
}

type ModalStep = 'entry' | 'screening' | 'success';

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = React.useState<ModalStep>('entry');
  const [screeningProgress, setScreeningProgress] = React.useState(0);
  const [screeningStatus, setScreeningStatus] = React.useState('Initializing...');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, trigger } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      type: 'textbook',
      year: new Date().getFullYear(),
      isbn: '',
    }
  });

  const onSubmit = async (data: BookFormValues) => {
    setStep('screening');
    
    // Simulate Automated Screening as per the workflow image
    const statuses = [
      'Performing Plagiarism Check...',
      'Verifying Formatting Standards...',
      'Validating ISBN Checksum...',
      'Cross-referencing Academic Databases...',
      'Finalizing Automated Report...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setScreeningStatus(statuses[i]);
      // Progress increments
      for (let p = 0; p < 20; p++) {
        setScreeningProgress(prev => Math.min(prev + 1, (i + 1) * 20));
        await new Promise(r => setTimeout(r, 30));
      }
    }

    await new Promise(r => setTimeout(r, 500));
    onAdd(data);
    setStep('success');
  };

  const handleClose = () => {
    setStep('entry');
    setScreeningProgress(0);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-[24px] sm:rounded-[40px] border border-noir-border/40 bg-black/40 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-noir-border/20 p-4 sm:p-8 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  <ShieldCheck size={12} />
                  {step === 'entry' ? '1. Submission' : step === 'screening' ? '2. Automated Screening' : 'Submission Complete'}
                </div>
                <h2 className="font-serif text-xl sm:text-3xl font-bold text-white">
                  {step === 'entry' ? 'Add New Resource' : step === 'screening' ? 'Smart Assessment' : 'Resource Verified'}
                </h2>
              </div>
              <button onClick={handleClose} className="rounded-full p-2 text-zinc-400 hover:bg-black/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {step === 'entry' && (
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-8 space-y-4 sm:space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Resource Title</label>
                      <Input {...register('title')} placeholder="e.g. Principles of Quantum Mechanics" className="h-10 sm:h-12 text-sm" />
                      {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Lead Author</label>
                      <Input {...register('author')} placeholder="e.g. Dr. Richard Feynman" className="h-10 sm:h-12 text-sm" />
                      {errors.author && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.author.message}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">ISBN Number</label>
                      <Input {...register('isbn')} placeholder="e.g. 978-0-13-110362-7" className="h-10 sm:h-12 text-sm" />
                      {errors.isbn && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.isbn.message}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Publication Year</label>
                      <Input type="number" {...register('year', { valueAsNumber: true })} className="h-10 sm:h-12 text-sm" />
                      {errors.year && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.year.message}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Publisher</label>
                      <Input {...register('publisher')} placeholder="e.g. Oxford University Press" className="h-10 sm:h-12 text-sm" />
                      {errors.publisher && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.publisher.message}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Acquisition Source</label>
                      <Input {...register('source')} placeholder="e.g. University Library, Open Access, etc." className="h-10 sm:h-12 text-sm" />
                      {errors.source && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.source.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Resource Type</label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {(['textbook', 'reference', 'ebook'] as const).map((type) => (
                        <label key={type} className="relative cursor-pointer group">
                          <input type="radio" value={type} {...register('type')} className="peer sr-only" />
                          <div className="flex h-10 sm:h-12 items-center justify-center rounded-2xl border border-noir-border/40 bg-black/60 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-all peer-checked:border-noir-border peer-checked:bg-noir-border peer-checked:text-white group-hover:border-noir-border/80">
                            {type}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Cover Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <Input {...register('coverUrl')} className="pl-12 h-10 sm:h-12 text-sm" placeholder="https://example.com/cover.jpg" />
                    </div>
                    {errors.coverUrl && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.coverUrl.message}</p>}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Short Abstract</label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full rounded-2xl border border-noir-border/40 bg-black/60 p-3 text-sm text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-noir-border/50 outline-none transition-all"
                      placeholder="Provide a brief overview of the resource's academic scope..."
                    />
                  </div>

                  <div className="flex gap-2 sm:gap-4 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-12 sm:h-14 rounded-2xl border-noir-border/40 text-zinc-500 text-xs sm:text-sm font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 sm:h-14 rounded-2xl cyan-gradient text-white font-bold shadow-lg text-xs sm:text-sm">
                      {isSubmitting ? 'Registering...' : 'Initiate Submission'}
                    </Button>
                  </div>
                </form>
              )}

              {step === 'screening' && (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-10 min-h-[400px]">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="h-32 w-32 rounded-full border-4 border-noir-border/40 border-t-cyan-400"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={48} className="text-cyan animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-cyan">
                      <span>{screeningStatus}</span>
                      <span>{screeningProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-noir-border/20">
                      <motion.div 
                        className="h-full cyan-gradient"
                        initial={{ width: 0 }}
                        animate={{ width: `${screeningProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 font-light italic">
                    Our smart assessment engine is currently performing a rigorous plagiarism and formatting check to ensure quality standards.
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
                  <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Plus size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif font-bold text-white">Resource Registered</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">
                      Submission successful. The resource has passed automated screening and is now ready for <strong>3. Expert Review</strong>.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="px-12 h-14 rounded-2xl cyan-gradient text-white font-bold shadow-lg">
                    Return to Archive
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

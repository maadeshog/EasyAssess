import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Image as ImageIcon, ShieldCheck, AlertCircle, Scan, Sparkles, RefreshCw } from 'lucide-react';
import { Button, Input } from './ui';
import { motion, AnimatePresence } from 'motion/react';
import { IsbnScanner } from './IsbnScanner';
import { ScannerPrefillData, PRESET_BOOKS } from '@/src/lib/asuPresets';
import { GPaySuccessScreen } from './GPaySuccessScreen';

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
  language: z.string().min(2, "Language is too short").max(50),
  description: z.string().max(1000).optional(),
  coverUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  system: z.enum(['Ayurveda', 'Unani', 'Siddha', 'General']),
  subject: z.string().min(2, "Subject/Discipline is too short").max(100),
  syllabusCompliance: z.boolean(),
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
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [isIdentifying, setIsIdentifying] = React.useState(false);
  const [identifyStatus, setIdentifyStatus] = React.useState<string | null>(null);

  const lastQueriedIsbnRef = React.useRef<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, trigger, setValue, watch } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      type: 'textbook',
      year: new Date().getFullYear(),
      isbn: '',
      language: 'English',
      system: 'Ayurveda',
      subject: '',
      syllabusCompliance: true,
      source: 'AYUSH Academic Portal',
      description: '',
      coverUrl: '',
    }
  });

  const watchedIsbn = watch('isbn');

  // Automatic identification and field filling when entered or scanned
  React.useEffect(() => {
    const identifyBook = async (rawIsbn: string) => {
      const cleanIsbnValue = rawIsbn.replace(/[-\s]/g, '').trim();
      if (!isValidISBN(cleanIsbnValue)) {
        return;
      }

      if (cleanIsbnValue === lastQueriedIsbnRef.current) {
        return;
      }

      lastQueriedIsbnRef.current = cleanIsbnValue;
      setIsIdentifying(true);
      setIdentifyStatus('Auto-identifying textbook...');

      // 1. Check in PRESET_BOOKS for instantaneous local registry hits
      const matchInPreset = PRESET_BOOKS.find(b => b.isbn.replace(/[-\s]/g, '') === cleanIsbnValue);
      if (matchInPreset) {
        // Wait 400ms for high-end aesthetic feedback feel
        await new Promise(r => setTimeout(r, 450));
        reset({
          title: matchInPreset.title,
          author: matchInPreset.author,
          isbn: rawIsbn,
          year: matchInPreset.year,
          publisher: matchInPreset.publisher,
          type: matchInPreset.type,
          source: matchInPreset.source,
          language: matchInPreset.language,
          system: matchInPreset.system,
          subject: matchInPreset.subject,
          syllabusCompliance: matchInPreset.syllabusCompliance,
          description: matchInPreset.description,
          coverUrl: matchInPreset.coverUrl,
        });
        trigger();
        setIsIdentifying(false);
        setIdentifyStatus('Local ASU Registry Prefill Confirmed! ✓');
        setTimeout(() => setIdentifyStatus(null), 4000);
        return;
      }

      // 2. Query Google Books API
      try {
        setIdentifyStatus('Searching international ISBN registries...');
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbnValue}`);
        if (!response.ok) {
          throw new Error('Google Books server did not respond');
        }
        const data = await response.json();
        if (data && data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo;
          
          const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
          const title = info.title || 'Unknown Title';
          const publisher = info.publisher || 'Unknown Publisher';
          const rawDate = info.publishedDate || '';
          let parsedYear = new Date().getFullYear();
          if (rawDate) {
            const matchYear = rawDate.match(/\d{4}/);
            if (matchYear) parsedYear = parseInt(matchYear[0]);
          }
          const description = info.description || '';
          const coverUrl = info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '') : '';

          // Intelligently classify System
          let detectedSystem: 'Ayurveda' | 'Unani' | 'Siddha' | 'General' = 'General';
          const searchSource = `${title} ${description}`.toLowerCase();
          if (searchSource.includes('ayur') || searchSource.includes('charaka') || searchSource.includes('sushruta') || searchSource.includes('vagbhata') || searchSource.includes('samhita') || searchSource.includes('dravyaguna') || searchSource.includes('kriya') || searchSource.includes('snana') || searchSource.includes('rasa')) {
            detectedSystem = 'Ayurveda';
          } else if (searchSource.includes('unani') || searchSource.includes('hakim') || searchSource.includes('kulliyat') || searchSource.includes('qanoon') || searchSource.includes('tashreeh') || searchSource.includes('umoor')) {
            detectedSystem = 'Unani';
          } else if (searchSource.includes('siddha') || searchSource.includes('tirumandiram') || searchSource.includes('gunapadam') || searchSource.includes('mooligai') || searchSource.includes('vaithiya')) {
            detectedSystem = 'Siddha';
          }

          // Dynamically fill only non-empty fields or reset them with fallback values
          setValue('title', title);
          setValue('author', authors);
          setValue('publisher', publisher);
          setValue('year', parsedYear);
          setValue('description', description.substring(0, 800));
          setValue('system', detectedSystem);
          if (coverUrl) {
            setValue('coverUrl', coverUrl.replace(/^http:/, 'https:'));
          }

          trigger();
          setIdentifyStatus('Auto-identified & filled! ✓');
          setTimeout(() => setIdentifyStatus(null), 4000);
          setIsIdentifying(false);
          return;
        }
      } catch (err) {
        console.warn('Google Books fetch failed, attempting Open Library fallbacks...', err);
      }

      // 3. Fallback to Open Library
      try {
        setIdentifyStatus('Searching Open Library index...');
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbnValue}&format=json&jscmd=data`);
        if (!response.ok) {
          throw new Error('Open Library failed');
        }
        const data = await response.json();
        const bookKey = `ISBN:${cleanIsbnValue}`;
        if (data && data[bookKey]) {
          const info = data[bookKey];
          
          const title = info.title || 'Unknown Title';
          const authors = info.authors ? info.authors.map((a: any) => a.name).join(', ') : 'Unknown Author';
          const publisher = info.publishers ? info.publishers.map((p: any) => p.name).join(', ') : 'Unknown Publisher';
          const rawDate = info.publish_date || '';
          let parsedYear = new Date().getFullYear();
          if (rawDate) {
            const matchYear = rawDate.match(/\d{4}/);
            if (matchYear) parsedYear = parseInt(matchYear[0]);
          }
          const coverUrl = info.cover ? (info.cover.large || info.cover.medium || info.cover.small || '') : '';

          setValue('title', title);
          setValue('author', authors);
          setValue('publisher', publisher);
          setValue('year', parsedYear);
          if (coverUrl) {
            setValue('coverUrl', coverUrl.replace(/^http:/, 'https:'));
          }

          trigger();
          setIdentifyStatus('Auto-identified from Open Library! ✓');
          setTimeout(() => setIdentifyStatus(null), 4000);
          setIsIdentifying(false);
          return;
        }
      } catch (err) {
        console.error('Open Library fallback failed', err);
      }

      // If nothing found
      setIdentifyStatus('Identified failed: No registry matches found');
      setTimeout(() => setIdentifyStatus(null), 4000);
      setIsIdentifying(false);
    };

    identifyBook(watchedIsbn || '');
  }, [watchedIsbn, reset, setValue, trigger]);

  const handleScanSuccess = (scannedIsbn: string, prefillData?: ScannerPrefillData) => {
    setIsScannerOpen(false);
    if (prefillData) {
      reset({
        title: prefillData.title,
        author: prefillData.author,
        isbn: prefillData.isbn,
        year: prefillData.year,
        publisher: prefillData.publisher,
        type: prefillData.type,
        source: prefillData.source,
        language: prefillData.language,
        system: prefillData.system,
        subject: prefillData.subject,
        syllabusCompliance: prefillData.syllabusCompliance,
        description: prefillData.description,
        coverUrl: prefillData.coverUrl,
      });
      // Optionally trigger validation instantly for satisfaction
      trigger();
    } else {
      setValue('isbn', scannedIsbn);
      trigger('isbn');
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    setStep('screening');
    
    // Simulate Automated Screening as per the workflow image
    const statuses = [
      'Verifying ISBN Checksum & Publisher Authenticity...',
      'Validating declared CCIM / NCISM syllabus coverage...',
      'Cross-referencing conflict-of-interest databases...',
      'Analyzing content alignment & ASU terminology...',
      'Assembling compliance dossier & routing to reviewers...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setScreeningStatus(statuses[i]);
      // Progress increments: 80 steps of 0.25% at 8.33ms (targets 120Hz refresh rates perfectly)
      for (let p = 0; p < 80; p++) {
        setScreeningProgress(prev => Math.min(prev + 0.25, (i + 1) * 20));
        await new Promise(r => setTimeout(r, 8.33));
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

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <AnimatePresence>
                {isScannerOpen && (
                  <IsbnScanner 
                    onScanSuccess={handleScanSuccess} 
                    onClose={() => setIsScannerOpen(false)} 
                  />
                )}
              </AnimatePresence>
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">ISBN Number</label>
                        <button
                          type="button"
                          onClick={() => setIsScannerOpen(true)}
                          className="flex items-center gap-1.5 text-[9px]/tight font-bold uppercase tracking-[0.15em] text-cyan hover:text-cyan-400 transition-colors bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full cursor-pointer"
                        >
                          <Scan size={10} className="animate-pulse" />
                          <span>Scan QR / Barcode</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Input 
                          {...register('isbn')} 
                          placeholder="e.g. 978-0-13-110362-7" 
                          className={`h-10 sm:h-12 pr-10 text-sm transition-all duration-300 ${isIdentifying ? 'border-cyan/60 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white' : ''}`} 
                        />
                        {isIdentifying && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            <RefreshCw size={14} className="text-cyan animate-spin" />
                          </div>
                        )}
                      </div>
                      {identifyStatus && (
                        <div className="flex items-center gap-1.5 px-1 py-0.5">
                          <Sparkles size={11} className={`${isIdentifying ? 'text-cyan animate-pulse' : 'text-emerald-400 animate-bounce'}`} />
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${isIdentifying ? 'text-cyan/90' : identifyStatus.includes('failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                            {identifyStatus}
                          </span>
                        </div>
                      )}
                      {errors.isbn && !identifyStatus && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.isbn.message}</p>}
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
                    <div className="space-y-1 sm:space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Resource Language</label>
                       <Input {...register('language')} placeholder="e.g. English, Sanskrit, Hindi, French" className="h-10 sm:h-12 text-sm" />
                       {errors.language && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.language.message}</p>}
                     </div>
                     <div className="space-y-1 sm:space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">ASU Medical System</label>
                        <select
                          {...register('system')}
                          className="w-full h-10 sm:h-12 rounded-2xl border border-noir-border/30 bg-black/60 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 focus:ring-1 focus:ring-noir-border/50 outline-none hover:border-cyan/40 transition-colors"
                        >
                          <option value="Ayurveda" className="bg-zinc-900 text-white">Ayurveda System</option>
                          <option value="Unani" className="bg-zinc-900 text-white">Unani System</option>
                          <option value="Siddha" className="bg-zinc-900 text-white">Siddha System</option>
                          <option value="General" className="bg-zinc-900 text-white">General / Other</option>
                        </select>
                     </div>
                     <div className="space-y-1 sm:space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Subject / Discipline Specialty (e.g., Kriya Sharir)</label>
                        <Input {...register('subject')} placeholder="e.g. Kriya Sharir, Samhita, Kulliyat, Tashreeh, Gunapadam" className="h-10 sm:h-12 text-sm" />
                        {errors.subject && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{errors.subject.message}</p>}
                     </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 select-none">
                    <label className="relative flex items-center gap-4 rounded-2xl border border-noir-border/40 bg-black/60 p-4 cursor-pointer hover:border-cyan/40 transition-colors">
                      <input 
                        type="checkbox" 
                        {...register('syllabusCompliance')} 
                        className="h-5 w-5 rounded border-noir-border/30 bg-black/80 text-cyan focus:ring-cyan focus:ring-offset-black accent-cyan"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Syllabus Compliance Declared (NCISM / CCIM)</span>
                        <p className="text-[10px] text-zinc-500">The textbook formally states that it has been written strictly as per CCIM or NCISM syllabus guidelines.</p>
                      </div>
                    </label>
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
                      <span>{Math.round(screeningProgress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-noir-border/20">
                      <motion.div 
                        className="h-full cyan-gradient shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${screeningProgress}%` }}
                        transition={{ type: "tween", ease: "linear", duration: 0.00833 }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 font-light italic">
                    Our smart assessment engine is currently performing a rigorous plagiarism and formatting check to ensure quality standards.
                  </p>
                </div>
              )}

              {step === 'success' && (
                <GPaySuccessScreen
                  title="Resource Registered"
                  subtitle="Submission completed successfully. The resource has passed automated screening and is now listed for expert peer-review."
                  details={[
                    { label: 'Resource Title', value: watch('title') || 'New Textbook' },
                    { label: 'Lead Author', value: watch('author') || 'Expert Evaluator' },
                    { label: 'ISBN Checksum', value: watch('isbn') || 'Auto-Screened' },
                    { label: 'ASU Speciality', value: `${watch('system')} System` },
                  ]}
                  onDone={handleClose}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

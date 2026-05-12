import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { cn } from '@/src/lib/utils';
import confetti from 'canvas-confetti';

const assessmentSchema = z.object({
  scores: z.object({
    contentAccuracy: z.number().min(1).max(10),
    readability: z.number().min(1).max(10),
    pedagogy: z.number().min(1).max(10),
    visualDesign: z.number().min(1).max(10),
    relevance: z.number().min(1).max(10),
  }),
  comments: z.string().min(10, "Comment must be at least 10 characters").max(5000),
  recommendation: z.enum(['highly-recommended', 'recommended', 'neutral', 'not-recommended']),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

interface BookAssessmentFormProps {
  bookTitle: string;
  onSubmit: (data: AssessmentFormValues) => void;
  onCancel: () => void;
}

export const BookAssessmentForm: React.FC<BookAssessmentFormProps> = ({ bookTitle, onSubmit, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      scores: {
        contentAccuracy: 5,
        readability: 5,
        pedagogy: 5,
        visualDesign: 5,
        relevance: 5,
      },
      recommendation: 'recommended',
    }
  });

  const scores = watch('scores');

  const handleFormSubmit = async (data: AssessmentFormValues) => {
    try {
      await onSubmit(data);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#f8fafc', '#cbd5e1'],
        disableForReducedMotion: true
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 space-y-8 sm:space-y-12 pb-32">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel} 
          className="rounded-full h-12 w-12 border border-noir-border/20 text-zinc-500 hover:text-cyan hover:border-cyan/40 transition-all bg-black/20"
          title="Back to Home"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="h-px flex-1 border-b border-noir-border/10"></div>
        <div className="flex items-center gap-3 text-white">
          <ShieldCheck size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Evaluation Protocol</h2>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan">
          <ShieldCheck size={14} />
          Verified Evaluation Protocol
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">Quality Assessment</h2>
        <p className="text-zinc-400 font-light text-base sm:text-lg">Evaluating: <span className="text-zinc-400 font-medium italic">"{bookTitle}"</span></p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          <RatingSlider label="Content Accuracy" value={scores.contentAccuracy} onChange={(val) => setValue('scores.contentAccuracy', val)} />
          <RatingSlider label="Readability" value={scores.readability} onChange={(val) => setValue('scores.readability', val)} />
          <RatingSlider label="Pedagogy" value={scores.pedagogy} onChange={(val) => setValue('scores.pedagogy', val)} />
          <RatingSlider label="Visual Design" value={scores.visualDesign} onChange={(val) => setValue('scores.visualDesign', val)} />
          <RatingSlider label="Relevance" value={scores.relevance} onChange={(val) => setValue('scores.relevance', val)} />
          
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommendation</label>
            <select
              {...register('recommendation')}
              className="w-full h-14 rounded-2xl border border-noir-border/40 bg-black/60 px-4 text-white focus:ring-2 focus:ring-noir-border/50 outline-none appearance-none"
            >
              <option value="highly-recommended" className="bg-black/40">Highly Recommended</option>
              <option value="recommended" className="bg-black/40">Recommended</option>
              <option value="neutral" className="bg-black/40">Neutral</option>
              <option value="not-recommended" className="bg-black/40">Not Recommended</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Evaluator Comments</label>
          <textarea
            {...register('comments')}
            rows={6}
            placeholder="Provide a detailed academic critique..."
            className="w-full rounded-[32px] border border-noir-border/40 bg-black/60 p-8 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-noir-border/50 outline-none transition-all"
          />
          {errors.comments && <p className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={12} /> {errors.comments.message}</p>}
        </div>

        <div className="flex gap-6 pt-8">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-16 rounded-2xl border-noir-border/40 text-zinc-500 hover:bg-black/60">
            Discard Assessment
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 rounded-2xl cyan-gradient text-white font-bold text-lg shadow-xl gap-3">
            <Send size={20} />
            {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const RatingSlider = ({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) => (
  <div className="glass-panel rounded-[32px] p-8 space-y-6 transition-all hover:bg-black/80">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</span>
      <span className="text-3xl font-serif font-bold text-white">{value}</span>
    </div>
    <div className="relative flex items-center">
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-black/80 rounded-full appearance-none cursor-pointer accent-noir-border hover:accent-noir-border/80 transition-all"
      />
    </div>
    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
      <span>Novice</span>
      <span>Master</span>
    </div>
  </div>
);

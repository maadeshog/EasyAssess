import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button, Input } from './ui';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const FeedbackSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || rating === 0) {
      setError('Please provide at least a rating and a message.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const feedbackData: any = {
        rating,
        message,
        createdAt: Date.now(),
      };

      if (auth.currentUser) {
        feedbackData.userId = auth.currentUser.uid;
        feedbackData.name = auth.currentUser.displayName || name;
        feedbackData.email = auth.currentUser.email || email;
      } else {
        if (name) feedbackData.name = name;
        if (email) feedbackData.email = email;
      }

      await addDoc(collection(db, 'feedback'), feedbackData);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 text-center space-y-6 rounded-[32px]"
        >
          <div className="h-20 w-20 rounded-full cyan-gradient mx-auto flex items-center justify-center text-white">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">Thank You for Your Feedback!</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Your insights help us maintain the highest academic standards. We appreciate your contribution to the EasyAssess community.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setIsSubmitted(false)}
            className="rounded-full px-8 text-white border-noir-border/40"
          >
            Submit another
          </Button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="feedback" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 py-20">
      <div className="text-center space-y-6 mb-12">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Community Voice</h2>
        <p className="text-4xl font-serif font-bold text-white">Share Your Experience</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-8 sm:p-12 rounded-[32px] border border-noir-border/20"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {!auth.currentUser && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Your Name</label>
                  <Input 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/40 border-noir-border/20 text-white rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/40 border-noir-border/20 text-white rounded-2xl h-14"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Rating</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                    rating >= s 
                      ? 'cyan-gradient text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]' 
                      : 'bg-black/40 text-zinc-600 border border-noir-border/20 hover:border-cyan/40'
                  }`}
                >
                  <Star size={20} fill={rating >= s ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Your Message</label>
            <div className="relative">
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we improve the academic assessment process?"
                className="w-full bg-black/40 border border-noir-border/20 text-white rounded-2xl p-4 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all resize-none outline-none"
              />
              <MessageSquare className="absolute right-4 bottom-4 text-white/10" size={20} />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 rounded-2xl cyan-gradient text-white font-bold text-lg shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_50px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
               <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             >
               <Send size={24} />
             </motion.div>
            ) : (
              <>
                <Send size={20} />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </section>
  );
};

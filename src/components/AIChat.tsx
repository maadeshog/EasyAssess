import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, BookOpen, Trash2, Mic, MicOff, Search, X, ArrowLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button, Input } from './ui';
import { cn } from '@/src/lib/utils';
import { Book, Assessment } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  books: Book[];
  assessments: Assessment[];
  onBack: () => void;
}

export const AIChat: React.FC<AIChatProps> = React.memo(({ books, assessments, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your EasyAssess AI assistant. I can help you analyze academic resources, summarize assessments, or answer questions about your archive. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev.trim()} ${transcript}` : transcript);
        setIsListening(false);
        setVoiceError(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone access denied. Please enable permissions in your browser.");
        } else {
          setVoiceError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    setVoiceError(null);
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition start error:", error);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const context = `
        You are the EasyAssess AI Assistant. You have access to the user's academic archive.
        Current Stats:
        - Total Books: ${books.length}
        - Total Assessments: ${assessments.length}
        
        Archive Contents:
        ${books.map(b => `- ${b.title} by ${b.author} (${b.type})`).join('\n')}
        
        Recent Assessments:
        ${assessments.slice(0, 5).map(a => {
          const book = books.find(b => b.id === a.bookId);
          return `- Assessment for "${book?.title}" by ${a.userName}: ${a.recommendation}`;
        }).join('\n')}

        Be professional, academic, and helpful. If asked about a specific book, use this context.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: "You are the EasyAssess AI Assistant. Provide professional guidance on academic resources and assessment results.",
        }
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request."
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error while processing your request. Please ensure the archive is accessible and try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-cyan/30 text-white rounded px-0.5">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 h-[calc(100vh-12rem)] flex flex-col space-y-8">
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
          <Bot size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">AI Support System</h2>
        </div>
      </div>

      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl cyan-gradient flex items-center justify-center text-white shadow-lg animate-pulse">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
              AI Assistant
              <Sparkles className="text-cyan animate-pulse" size={20} />
            </h1>
            <p className="text-zinc-500 text-sm">Intelligent archive analysis & support</p>
          </div>
        </div>
        <div className="flex gap-3">
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="h-12 pl-10 pr-4 bg-black/40 border-noir-border/40 rounded-2xl text-xs"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={cn(
              "h-12 w-12 rounded-2xl border-noir-border/40 p-0",
              showSearch ? "bg-cyan/10 text-cyan border-cyan/30" : "text-zinc-500 hover:text-cyan"
            )}
            title="Search Messages"
          >
            {showSearch ? <X size={20} /> : <Search size={20} />}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMessages([{ role: 'assistant', content: "Chat cleared. How else can I help?" }])}
            className="h-12 rounded-2xl border-noir-border/40 text-zinc-500 hover:text-red-400"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass-panel rounded-[32px] border border-noir-border/20 bg-black/40 flex flex-col overflow-hidden">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {filteredMessages.length === 0 && searchQuery && (
            <div className="text-center py-20">
              <Search className="mx-auto text-zinc-700 mb-4" size={40} />
              <p className="text-zinc-500">No messages found matching "{searchQuery}"</p>
            </div>
          )}
          {filteredMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg border",
                msg.role === 'user' 
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300" 
                  : "cyan-gradient border-cyan/20 text-white"
              )}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50" 
                  : "bg-noir-border/10 text-zinc-200 border border-noir-border/20"
              )}>
                {highlightMatches(msg.content, searchQuery)}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl cyan-gradient flex items-center justify-center text-white shadow-lg border border-cyan/20">
                <Loader2 size={18} className="animate-spin" />
              </div>
              <div className="bg-noir-border/10 rounded-2xl p-4 border border-noir-border/20">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-cyan" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-noir-border/10 bg-black/20 shrink-0">
          <AnimatePresence>
            {voiceError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
              >
                {voiceError}
              </motion.div>
            )}
          </AnimatePresence>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3"
          >
            <div className="group relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about your academic archive..."}
                disabled={isLoading}
                className={cn(
                  "h-14 pl-6 pr-24 bg-black/40 border-noir-border/20 text-white placeholder:text-zinc-600 focus:ring-noir-border/40 rounded-2xl transition-all",
                  isListening && "border-cyan/50 ring-1 ring-cyan/20 bg-cyan/5"
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    isListening 
                      ? "bg-cyan/20 text-cyan animate-pulse border border-cyan/30" 
                      : "text-zinc-600 hover:text-cyan hover:bg-noir-border/10"
                  )}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {recognitionRef.current ? (
                    isListening ? <Mic size={18} /> : <Mic size={18} />
                  ) : (
                    <MicOff size={18} className="opacity-30" />
                  )}
                </button>
                <div className="h-6 w-px bg-noir-border/20" />
                <BookOpen size={16} className="text-zinc-700" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-14 w-14 rounded-2xl cyan-gradient text-white flex items-center justify-center shadow-lg shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
});


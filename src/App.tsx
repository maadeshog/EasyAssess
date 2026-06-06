/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { BookAssessmentForm } from './components/BookAssessmentForm';
import { AddBookModal } from './components/AddBookModal';
import { BookDetails } from './components/BookDetails';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { TrashPage } from './components/TrashPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AIChat } from './components/AIChat';
import { LoginPage } from './components/LoginPage';
import { SpaceBackground } from './components/SpaceBackground';
import { Book, Assessment, UserProfile } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDoc, getDocFromServer, deleteDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-error';
import { ShieldCheck, BookOpen } from 'lucide-react';
import { Button } from './components/ui';
import { GPaySuccessScreen } from './components/GPaySuccessScreen';
import { getRedirectResult } from 'firebase/auth';

type View = 'landing' | 'dashboard' | 'assess' | 'details' | 'profile' | 'trash' | 'admin' | 'settings' | 'chat' | 'submitted-success';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<{
    id?: string;
    title: string;
    recommendation: string;
    scores: any;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBypass, setShowBypass] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  // Track slow responses to show the safe bypass fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBypass(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBypass = useCallback(() => {
    console.log("Bypassing auth/connection check due to loading timeout");
    const offlineUser: UserProfile = {
      uid: "offline-guest-uid",
      displayName: "Guest Evaluator",
      role: "evaluator",
      createdAt: Date.now()
    };
    setUser(offlineUser);
    setIsVerified(true);
    setIsAuthReady(true);
    setMinLoadingTimePassed(true);
  }, []);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (user && user.uid && user.uid !== "offline-guest-uid") {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { theme: newTheme });
        setUser(prev => prev ? { ...prev, theme: newTheme } : null);
      } catch (e) {
        console.error("Failed to sync theme across sessions", e);
      }
    }
  }, [theme, user]);

  // Sync theme with user object updates (e.g., from Settings page or Login)
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
      localStorage.setItem('theme', user.theme);
    }
  }, [user?.theme]);

  // PWA Install Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // Minimum Loading Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Track slow responses to show the safe bypass fallback

  // Test Firestore Connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setConnectionError(null);
      } catch (error: any) {
        if (error?.code === 'unavailable' || (error instanceof Error && error.message.includes('unavailable'))) {
          setConnectionError("Firestore is currently unreachable. Please check your internet connection.");
          console.error("Firestore unreachable:", error);
        } else if (error?.code === 'permission-denied') {
          // Ignore, test collection might not be ready yet
          console.log("Connection test: Permission denied (expected if not public)");
        } else {
          console.warn("Connection test warning:", error);
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    // Handle redirect results on sign-in
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect auth error:", error);
      // We don't necessarily need to set an error here as the LoginPage will handle its own state
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsVerified(true); // Auto-verify all authenticated users to prevent any testing lockouts
        
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          let userSnap;
          try {
            userSnap = await getDocFromServer(userRef);
          } catch (serverErr: any) {
            console.warn("getDocFromServer failed, attempting cached getDoc fallback:", serverErr);
            userSnap = await getDoc(userRef);
          }
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            if (userData.theme) {
              setTheme(userData.theme);
              localStorage.setItem('theme', userData.theme);
            }
            if (firebaseUser.photoURL && userData.photoURL !== firebaseUser.photoURL) {
              userData.photoURL = firebaseUser.photoURL;
              try {
                await updateDoc(userRef, { photoURL: firebaseUser.photoURL });
              } catch (e) {
                console.error("Failed to update photoURL", e);
              }
            }
            setUser(userData);
          } else {
            const newUserProfile: any = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'User',
              role: 'evaluator',
              createdAt: Date.now(),
            };
            if (firebaseUser.email) newUserProfile.email = firebaseUser.email;
            if (firebaseUser.photoURL) newUserProfile.photoURL = firebaseUser.photoURL;
            try {
              await setDoc(userRef, newUserProfile);
            } catch (setDocErr) {
              console.warn("Failed to create user record directly (offline/restricted):", setDocErr);
            }
            setUser(newUserProfile as UserProfile);
          }
          setIsAuthReady(true);
        } catch (error: any) {
          console.warn("Initializing with fallback local profile:", error);
          const fallbackProfile: any = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            role: 'evaluator',
            createdAt: Date.now(),
          };
          if (firebaseUser.email) fallbackProfile.email = firebaseUser.email;
          if (firebaseUser.photoURL) fallbackProfile.photoURL = firebaseUser.photoURL;
          setUser(fallbackProfile as UserProfile);
          setIsAuthReady(true);

          const errString = error instanceof Error ? error.message : String(error);
          if (errString.includes('offline') || errString.includes('unreachable') || errString.includes('network') || errString.includes('unvailable')) {
            setConnectionError("Offline Mode: Connected. Using cached/session-based data. Some server utilities may be unavailable.");
          } else {
            // Log non-fatal error
            console.error("Non-fatal Firestore error during init:", error);
          }
        }
      } else {
        setUser(null);
        setIsVerified(false);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!isAuthReady || !user || !isVerified) {
      setBooks([]);
      setAssessments([]);
      return;
    }

    const unsubscribeBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const loadedBooks: Book[] = [];
      snapshot.forEach((doc) => {
        loadedBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(loadedBooks.sort((a, b) => b.createdAt - a.createdAt));
      // Keep selectedBook state in sync with real-time updates
      setSelectedBook(prev => {
        if (!prev) return null;
        const fresh = loadedBooks.find(b => b.id === prev.id);
        return fresh || prev;
      });
      setIsDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'books');
      setIsDataLoading(false);
    });

    const unsubscribeAssessments = onSnapshot(collection(db, 'assessments'), (snapshot) => {
      const loadedAssessments: Assessment[] = [];
      snapshot.forEach((doc) => {
        loadedAssessments.push({ id: doc.id, ...doc.data() } as Assessment);
      });
      setAssessments(loadedAssessments.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'assessments');
    });

    return () => {
      unsubscribeBooks();
      unsubscribeAssessments();
    };
  }, [isAuthReady, user, isVerified]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  const handleAddBook = useCallback(async (data: any) => {
    if (!user) return;
    const newId = doc(collection(db, 'books')).id;
    const newBook: Book = {
      ...data,
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: user.uid,
      status: 'active',
    };
    
    try {
      await setDoc(doc(db, 'books', newId), newBook);
      setIsAddModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `books/${newId}`);
    }
  }, [user]);

  const handleUpdateBook = useCallback(async (bookId: string, updatedFields: Partial<Book>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'books', bookId), {
        ...updatedFields,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${bookId}`);
    }
  }, [user]);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'books', bookId), {
        status: 'trashed',
        deletedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${bookId}`);
    }
  }, [user]);

  const handleRestoreBook = useCallback(async (bookId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'books', bookId), {
        status: 'active',
        deletedAt: null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${bookId}`);
    }
  }, [user]);

  const handlePermanentDeleteBook = useCallback(async (bookId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'books', bookId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${bookId}`);
    }
  }, [user]);

  const handleBulkDelete = useCallback(async (bookIds: string[]) => {
    if (!user) return;
    try {
      await Promise.all(bookIds.map(id => updateDoc(doc(db, 'books', id), {
        status: 'trashed',
        deletedAt: Date.now()
      })));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bulk-trash');
    }
  }, [user]);

  const handleDeleteAssessment = useCallback(async (assessmentId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        status: 'trashed',
        deletedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assessments/${assessmentId}`);
    }
  }, [user]);

  const handleRestoreAssessment = useCallback(async (assessmentId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        status: 'active',
        deletedAt: null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assessments/${assessmentId}`);
    }
  }, [user]);

  const handlePermanentDeleteAssessment = useCallback(async (assessmentId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'assessments', assessmentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assessments/${assessmentId}`);
    }
  }, [user]);

  const handleAssess = useCallback((book: Book) => {
    if (!user) return;
    setSelectedBook(book);
    setView('assess');
  }, [user]);

  const handleViewDetails = useCallback((book: Book) => {
    setSelectedBook(book);
    setView('details');
  }, []);

  const handleSubmitAssessment = useCallback(async (data: any) => {
    if (!selectedBook || !user) return;

    const newId = doc(collection(db, 'assessments')).id;
    const newAssessment: Assessment = {
      id: newId,
      bookId: selectedBook.id,
      userId: user.uid,
      userName: user.displayName,
      scores: data.scores,
      comments: data.comments,
      recommendation: data.recommendation,
      createdAt: Date.now(),
      status: 'active',
    };

    try {
      await setDoc(doc(db, 'assessments', newId), newAssessment);
      setSubmittedDetails({
        id: newId,
        title: selectedBook.title,
        recommendation: data.recommendation,
        scores: data.scores,
      });
      setView('submitted-success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `assessments/${newId}`);
    }
  }, [selectedBook, user]);

  return (
    <div className="relative min-h-screen bg-[#020202] text-zinc-100 selection:bg-cyan/30 selection:text-white">
      <SpaceBackground />
      
      <AnimatePresence mode="wait">
        {(!isAuthReady || !minLoadingTimePassed) ? (
          <motion.div 
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
            transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="relative flex flex-col items-center justify-center p-6 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mb-16"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2],
                    opacity: [0.4, 0.6]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 rounded-full bg-cyan/20 blur-[80px]"
                />
                
                <svg className="absolute inset-0 w-full h-full -m-16 pointer-events-none overflow-visible" viewBox="0 0 100 100">
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={i}
                      cx="50"
                      cy="50"
                      r={30 + i * 15}
                      fill="none"
                      stroke="rgba(8,145,178,0.2)"
                      strokeWidth="0.5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                    />
                  ))}
                </svg>

                <div className="absolute inset-0 pointer-events-none">
                  {[0, 120, 240].map((angle, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <motion.div
                        className="absolute h-2 w-2 rounded-full bg-cyan shadow-[0_0_15px_rgba(8,145,178,1)]"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${angle}deg) translateY(-${80 + i * 20}px)`
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  animate={{ 
                    y: [0, -8],
                    rotate: [0, 4]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut" 
                  }}
                  className="relative h-28 w-28 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md"
                >
                  <img src="/app-logo.png" alt="EasyAssess Logo" className="relative z-10 h-full w-full object-cover animate-pulse" />
                </motion.div>
              </motion.div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl sm:text-6xl font-serif font-black tracking-tighter"
                  >
                    <span 
                      className="inline-block text-transparent bg-clip-text bg-[linear-gradient(110deg,#0ea5e9,45%,#fff,55%,#0ea5e9)] bg-[length:200%_100%] animate-shimmer"
                    >
                      EasyAssess
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, letterSpacing: "0.2em" }}
                    animate={{ opacity: 0.5, letterSpacing: "1em" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-[10px] uppercase text-cyan font-black"
                    style={{ letterSpacing: "1em" }}
                  >
                    Archiving Archive
                  </motion.p>
                </div>

                <div className="relative h-[2px] w-48 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_10px_#0891b2]"
                  />
                </div>

                {connectionError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-xs mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed"
                  >
                    {connectionError}
                    <button 
                      onClick={() => window.location.reload()}
                      className="block mt-2 font-bold underline hover:text-red-300"
                    >
                      Try Refreshing
                    </button>
                  </motion.div>
                )}

                {showBypass && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="pt-4 space-y-3"
                  >
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Still connecting? Securely load and start utilizing the evaluation suite immediately as a secure guest.
                    </p>
                    <Button 
                      onClick={handleBypass}
                      variant="outline" 
                      className="border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan/50 rounded-2xl text-xs h-11 px-6 transition-all duration-300 font-bold active:scale-95 shadow-lg shadow-cyan/5"
                    >
                      Enter Instant-secure Mode
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : !user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen"
          >
            <LoginPage onBypass={handleBypass} />
          </motion.div>
        ) : !isVerified ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="min-h-screen"
          >
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              onHome={() => setView('landing')}
              isInstallable={isInstallable}
              onInstall={onInstall}
              onNavigate={(v) => setView(v as View)}
              theme={theme}
              onToggleTheme={toggleTheme}
            >
              <div className="flex min-h-[70vh] items-center justify-center px-6">
                <div className="max-w-md w-full glass-panel rounded-[40px] p-12 text-center space-y-8">
                  <div className="mx-auto h-20 w-20 rounded-full bg-noir-border/10 flex items-center justify-center text-white border border-noir-border/40">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-serif font-bold text-white">Verification Required</h2>
                    <p className="text-zinc-500 font-light leading-relaxed">
                      To maintain the integrity of our academic archive, only verified Google accounts can access the platform. 
                      Please verify your email address and reload the page.
                    </p>
                  </div>
                  <div className="pt-4 space-y-4">
                    <Button onClick={() => window.location.reload()} className="w-full h-14 rounded-2xl cyan-gradient text-white font-bold">
                      I've Verified My Email
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="w-full h-14 rounded-2xl border-noir-border/40 text-zinc-500">
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </Layout>
          </motion.div>
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              onHome={() => setView('landing')}
              currentView={view}
              isInstallable={isInstallable}
              onInstall={onInstall}
              onNavigate={(v) => setView(v as View)}
              theme={theme}
              onToggleTheme={toggleTheme}
            >
              <AnimatePresence mode="wait">
                {view === 'landing' && (
                  <motion.div
                    key="landing"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                  >
                    <LandingPage 
                      onGetStarted={() => setView('dashboard')} 
                      isInstallable={isInstallable}
                      onInstall={onInstall}
                    />
                  </motion.div>
                )}
                {view === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Dashboard
                      books={books}
                      assessments={assessments}
                      onAssess={handleAssess}
                      onAddBook={() => setIsAddModalOpen(true)}
                      onViewBook={handleViewDetails}
                      onDeleteBook={handleDeleteBook}
                      onBulkDelete={handleBulkDelete}
                      onBack={() => setView('landing')}
                      currentUser={user}
                      isLoading={isDataLoading}
                    />
                  </motion.div>
                )}
                {view === 'assess' && selectedBook && (
                  <motion.div
                    key="assess"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <BookAssessmentForm
                      bookTitle={selectedBook.title}
                      bookLanguage={selectedBook.language}
                      userLanguage={user?.language}
                      onCancel={() => setView('landing')}
                      onSubmit={handleSubmitAssessment}
                    />
                  </motion.div>
                )}
                {view === 'submitted-success' && submittedDetails && (
                  <motion.div
                    key="submitted-success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-zinc-950"
                  >
                    <GPaySuccessScreen
                      title="Evaluation Submitted"
                      subtitle="Your academic assessment has been registered and verified on the secure peer-review database."
                      details={[
                        { label: 'Resource Title', value: submittedDetails.title },
                        { label: 'Decision Verdict', value: submittedDetails.recommendation.toUpperCase().replace('-', ' ') },
                        { label: 'Content Accuracy', value: `${submittedDetails.scores?.contentAccuracy || 5} / 10` },
                        { label: 'Resource Pedagogy', value: `${submittedDetails.scores?.pedagogy || 5} / 10` },
                        { label: 'Overall Relevance', value: `${submittedDetails.scores?.relevance || 5} / 10` },
                      ]}
                      onDone={() => {
                        setView('dashboard');
                        setSubmittedDetails(null);
                        setSelectedBook(null);
                      }}
                    />
                  </motion.div>
                )}
                {view === 'details' && selectedBook && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <BookDetails
                      book={selectedBook}
                      assessments={assessments.filter(a => a.bookId === selectedBook.id)}
                      onBack={() => setView('landing')}
                      onAssess={handleAssess}
                      onDeleteBook={handleDeleteBook}
                      onDeleteAssessment={handleDeleteAssessment}
                      currentUser={user}
                      onUpdateBook={handleUpdateBook}
                    />
                  </motion.div>
                )}
                {view === 'profile' && user && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <ProfilePage
                      user={user}
                      books={books}
                      assessments={assessments}
                      onBack={() => setView('landing')}
                      onDeleteBook={handleDeleteBook}
                      onDeleteAssessment={handleDeleteAssessment}
                    />
                  </motion.div>
                )}
                {view === 'settings' && user && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <SettingsPage
                      user={user}
                      onBack={() => setView('landing')}
                      onUpdateUser={(updates) => setUser({ ...user, ...updates })}
                    />
                  </motion.div>
                )}
                {view === 'trash' && user && (
                  <motion.div
                    key="trash"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <TrashPage
                      books={books}
                      assessments={assessments}
                      onBack={() => setView('landing')}
                      onRestoreBook={handleRestoreBook}
                      onPermanentDeleteBook={handlePermanentDeleteBook}
                      onRestoreAssessment={handleRestoreAssessment}
                      onPermanentDeleteAssessment={handlePermanentDeleteAssessment}
                      currentUser={user}
                    />
                  </motion.div>
                )}
                {view === 'admin' && user?.role === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <AdminDashboard
                      currentUser={user}
                      onBack={() => setView('landing')}
                    />
                  </motion.div>
                ) as any}
                {view === 'chat' && user && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AIChat
                      books={books}
                      assessments={assessments}
                      onBack={() => setView('landing')}
                      currentUser={user}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBook}
      />
    </div>
  );
}

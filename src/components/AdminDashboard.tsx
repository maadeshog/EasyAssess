import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, Trash2, ShieldAlert, ArrowLeft, BookOpen, Globe } from 'lucide-react';
import { UserProfile, Book } from '@/src/types';
import { Button } from './ui';
import { db } from '@/src/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-error';

interface AdminDashboardProps {
  currentUser: UserProfile;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const loadedUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        loadedUsers.push(doc.data() as UserProfile);
      });
      setUsers(loadedUsers.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    const unsubscribeBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const loadedBooks: Book[] = [];
      snapshot.forEach((doc) => {
        loadedBooks.push({ ...doc.data(), id: doc.id } as Book);
      });
      setBooks(loadedBooks.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'books');
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBooks();
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'evaluator') => {
    if (userId === currentUser.uid) {
      alert("You cannot change your own role.");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      }
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `books/${bookId}`);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 space-y-12 sm:space-y-16 pb-32">
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
          <ShieldAlert size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Administrative Console</h2>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white flex items-center gap-3">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-zinc-500 text-sm">Manage user roles, resource database, and view registration languages.</p>
        </div>
      </div>

      {/* Switchable Admin Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
            activeTab === 'users'
              ? 'bg-cyan/10 text-cyan border-cyan/30 shadow-[0_0_20px_rgba(8,145,178,0.1)]'
              : 'bg-transparent text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <User size={15} />
          Users Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
            activeTab === 'books'
              ? 'bg-cyan/10 text-cyan border-cyan/30 shadow-[0_0_20px_rgba(8,145,178,0.1)]'
              : 'bg-transparent text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <BookOpen size={15} />
          Book Catalog ({books.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-white/5 bg-black/40 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10">
          {activeTab === 'users' ? (
            <table className="w-full text-left text-sm text-zinc-500 whitespace-nowrap">
              <thead className="border-b border-white/5 bg-black/40 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Preferred Language</th>
                  <th className="px-8 py-5">System Role</th>
                  <th className="px-8 py-5 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-full bg-cyan/10 border border-cyan/20 text-cyan font-bold uppercase overflow-hidden shadow-[0_0_15px_rgba(8,145,178,0.2)]">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm tracking-widest">{user.displayName ? user.displayName.substring(0, 2) : <User size={16} />}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white text-base group-hover:text-cyan transition-colors">{user.displayName || 'Unknown User'}</span>
                          <span className="text-zinc-600 text-[11px] font-mono tracking-wider">ID: {user.uid.substring(0, 12)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-zinc-400 font-light">{user.email || user.phoneNumber || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-zinc-800/50 border border-white/10 text-zinc-200">
                        <Globe size={12} className="text-cyan animate-pulse" />
                        {user.language || 'English'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-cyan/10 border border-cyan/30 text-cyan shadow-[0_0_10px_rgba(8,145,178,0.2)]">
                          <ShieldCheck size={12} />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                          <User size={12} />
                          Evaluator
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.uid, e.target.value as 'admin' | 'evaluator')}
                            disabled={user.uid === currentUser.uid}
                            className="appearance-none rounded-xl border border-white/10 bg-black/60 px-4 py-2 pr-8 text-xs font-medium text-white hover:border-cyan/40 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <option value="evaluator">Make Evaluator</option>
                            <option value="admin">Make Administrator</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          disabled={user.uid === currentUser.uid}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-zinc-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-black/60 disabled:hover:text-zinc-500 transition-all cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500 font-light">
                      No users found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-zinc-500 whitespace-nowrap">
              <thead className="border-b border-white/5 bg-black/40 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-8 py-5">Book / Resource</th>
                  <th className="px-8 py-5">ISBN & Publisher</th>
                  <th className="px-8 py-5">Classification</th>
                  <th className="px-8 py-5">Language</th>
                  <th className="px-8 py-5 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20 text-cyan uppercase overflow-hidden font-mono text-xs shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={16} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white text-base group-hover:text-cyan transition-colors">{book.title || 'Untitled Resource'}</span>
                          <span className="text-zinc-650 text-[11px] font-mono tracking-wider">By {book.author || 'Unknown Author'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 font-light text-sm">{book.publisher || 'N/A'}</span>
                        <span className="text-zinc-600 font-mono text-[10px]">ISBN: {book.isbn || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                        {book.type} ({book.year})
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-cyan/10 border border-cyan/25 text-cyan shadow-[0_0_10px_rgba(8,145,178,0.1)]">
                        <Globe size={12} />
                        {book.language || 'English'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-zinc-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500 font-light">
                      No books or technical resources registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

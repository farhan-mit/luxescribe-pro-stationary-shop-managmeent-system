/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { ShieldAlert, KeyRound, ArrowRight, Chrome } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { ActiveUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user?: ActiveUser) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const correctPasscode = '1234';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      onLoginSuccess({
        name: 'Alex Mercer',
        email: 'alex.mercer@luxescribe.com',
        role: 'Store Manager',
        photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD5YsGKpJKTzuuh418xaKVew5XA0yOIx9GyXhIjmjXfVRBwAktCDA3-59nSWgBcHt632aT15i_u-HEDCgGtB5TNX6aldNyrBEbWte66BMKlb44bQu7ex8EzqHifrDyxfyMvcr71Z8wfbs-b8Ksh8dQzNhic1DWCrq87mVHL3MwOf-xEvHPTUTDGnhu6dKx91JenW-lPmAyopYhwntk7fZBBcV0ENjrEOCLSQ7TVavXBzd9bdvu7WNKxQjRWlCS9-hMrFdD6jxeQk0'
      });
    } else {
      setErrorMsg('Unauthorized passcode credentials. Hint: Enter 1234.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        onLoginSuccess({
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          role: 'Boutique Owner'
        });
      }
    } catch (err: any) {
      console.error("Google login failed", err);
      setErrorMsg(err.message || 'Google Auth flow was cancelled or blocked.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f8fafc] overflow-hidden select-none font-sans">
      
      {/* Decorative subtle ambient pattern */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-900/[0.02] rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main card box */}
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-none p-10 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Brand logo top wrapper */}
        <div className="inline-flex items-center justify-center w-14 h-14 border border-zinc-900 rounded-full mb-6">
          <div className="w-5 h-5 bg-zinc-900 rounded-none"></div>
        </div>

        <h1 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">LuxeScribe</h1>
        <p className="text-zinc-500 text-[10px] mt-2 font-semibold uppercase tracking-[0.2em]">Boutique Management Register</p>

        {/* Google Sign-In button container */}
        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-300 py-3.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
          >
            <Chrome className="w-4 h-4 text-rose-500" />
            {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
          <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mx-3 font-mono">Or Use passcode</span>
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
        </div>

        {/* Form entrance */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setErrorMsg('');
              }}
              placeholder="ENTER BOUTIQUE PASSCODE"
              className="w-full text-center bg-zinc-50 border border-zinc-200 rounded-none py-3 pl-10 pr-4 text-zinc-900 text-xs tracking-widest font-sans placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-900 transition-all font-semibold"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 justify-center text-red-650 text-[10px] uppercase tracking-wider py-2 px-2.5 rounded-none bg-red-50 border border-red-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-zinc-900 text-white hover:bg-zinc-850 border border-zinc-950 py-3.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-xl"
            >
              Unlock Terminal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick developer evaluation button */}
        <div className="mt-6 pt-6 border-t border-zinc-200 space-y-3 animate-pulse">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em] block">Developer Quick Bypass</span>
          <button
            onClick={() => {
              onLoginSuccess({
                name: 'Alex Mercer',
                email: 'alex.mercer@luxescribe.com',
                role: 'Store Manager',
                photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD5YsGKpJKTzuuh418xaKVew5XA0yOIx9GyXhIjmjXfVRBwAktCDA3-59nSWgBcHt632aT15i_u-HEDCgGtB5TNX6aldNyrBEbWte66BMKlb44bQu7ex8EzqHifrDyxfyMvcr71Z8wfbs-b8Ksh8dQzNhic1DWCrq87mVHL3MwOf-xEvHPTUTDGnhu6dKx91JenW-lPmAyopYhwntk7fZBBcV0ENjrEOCLSQ7TVavXBzd9bdvu7WNKxQjRWlCS9-hMrFdD6jxeQk0'
              });
            }}
            className="text-[9px] uppercase tracking-widest text-zinc-600 hover:text-zinc-900 font-semibold cursor-pointer py-2 px-4 rounded-none bg-zinc-100 border border-zinc-200 active:scale-95 transition-all inline-block"
          >
            Auto-Authorize (Code: 1234)
          </button>
        </div>
      </div>
    </div>
  );
}

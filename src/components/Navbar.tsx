import React from 'react';
import { Terminal, Download, Sparkles, Bookmark, Layers, LogIn, LogOut, Heart } from 'lucide-react';
import { User } from 'firebase/auth';
import { CartoonLogo } from './CartoonLogo';

interface NavbarProps {
  activeTab: 'builder' | 'terminal' | 'downloads' | 'presets' | 'extractors';
  setActiveTab: (activeTab: 'builder' | 'terminal' | 'downloads' | 'presets' | 'extractors') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  openAiModal: () => void;
  activeDownloadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  openAiModal,
  activeDownloadsCount,
}) => {
  return (
    <header className="border-b-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand with Cartoon Mascot */}
        <div
          className="flex items-center space-x-3 cursor-pointer group select-none"
          onClick={() => setActiveTab('builder')}
        >
          <CartoonLogo size={48} className="group-hover:scale-110 group-hover:rotate-6 transition-transform" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-amber-400 tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]">
                ToonTube<span className="text-emerald-400">DL</span>
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black border-2 border-black transform -rotate-3 shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.4)]">
                100% FREE!
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
              <span>By</span>
              <a
                href="https://apex-web-studio-india.web.app/frontend/index.html"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-zinc-200 hover:text-amber-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                title="Visit Apex Web Studio India"
              >
                <span>Apex Web Studio India</span>
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 inline" />
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Cartoon-Chic styling */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border-2 border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'builder'
                ? 'bg-emerald-500 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            🍿 Studio & Builder
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'terminal'
                ? 'bg-emerald-500 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive CLI</span>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all relative ${
              activeTab === 'downloads'
                ? 'bg-emerald-500 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Queue & Sync</span>
            {activeDownloadsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center animate-bounce border border-black">
                {activeDownloadsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-emerald-500 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
          <button
            onClick={() => setActiveTab('extractors')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'extractors'
                ? 'bg-emerald-500 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1,800+ Sites</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* CLI Syntax & Flags Guide */}
          <button
            onClick={openAiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 text-zinc-200 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] transition-all cursor-pointer hover:-translate-y-0.5"
            title="Search command line flags, syntax, and examples"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>CLI Guide</span>
          </button>

          {/* User Profile / Firebase Auth */}
          {user ? (
            <div className="flex items-center space-x-2 bg-zinc-900 border-2 border-zinc-800 rounded-xl p-1 pl-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
              <div className="flex items-center space-x-2 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-400 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-emerald-100 text-xs flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-zinc-300 hidden sm:inline font-bold text-xs max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 border-2 border-black text-black rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

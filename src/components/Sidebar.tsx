import React from "react";
import { BookOpen, PlayCircle, Download, BarChart3, Terminal, LogOut, CheckCircle } from "lucide-react";

interface SidebarProps {
  currentView: 'library' | 'active-course' | 'downloads' | 'analytics' | 'documentation';
  setView: (view: 'library' | 'active-course' | 'downloads' | 'analytics' | 'documentation') => void;
  nodeSynced: boolean;
}

export default function Sidebar({ currentView, setView, nodeSynced }: SidebarProps) {
  return (
    <aside id="sidebar-container" className="hidden md:flex h-screen w-64 fixed left-0 top-0 border-r border-border-stroke bg-surface-container flex-col py-8 z-50">
      {/* Brand Header */}
      <div id="sidebar-brand-box" className="px-6 mb-10">
        <h1 id="brand-logo-txt" className="font-mono text-base font-bold text-brand-neon uppercase tracking-widest flex items-center gap-2">
          CHAPTR
        </h1>
        <p id="brand-version-txt" className="font-mono text-[10px] text-text-secondary opacity-60 mt-1">
          v.0.4.2-stable
        </p>
      </div>

      {/* Navigation */}
      <nav id="sidebar-navigation" className="flex-1 space-y-1 px-3">
        {/* Library Tab */}
        <button
          id="tab-library"
          onClick={() => setView('library')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-all cursor-pointer group ${
            currentView === 'library'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
        >
          <BookOpen id="icon-library" className={`w-5 h-5 group-hover:scale-105 transition-transform ${currentView === 'library' ? 'text-brand-neon' : 'text-text-secondary'}`} />
          <span className="font-mono text-sm font-medium">Library</span>
        </button>

        {/* Active Course Tab */}
        <button
          id="tab-active"
          onClick={() => setView('active-course')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-all cursor-pointer group ${
            currentView === 'active-course'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
        >
          <PlayCircle id="icon-active" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-mono text-sm font-medium">Active Course</span>
        </button>

        {/* Downloads Tab */}
        <button
          id="tab-downloads"
          onClick={() => setView('downloads')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-all cursor-pointer group ${
            currentView === 'downloads'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
        >
          <Download id="icon-downloads" className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          <span className="font-mono text-sm font-medium">Downloads</span>
        </button>

        {/* Analytics Tab */}
        <button
          id="tab-analytics"
          onClick={() => setView('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-all cursor-pointer group ${
            currentView === 'analytics'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
        >
          <BarChart3 id="icon-analytics" className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          <span className="font-mono text-sm font-medium">Analytics</span>
        </button>
      </nav>

      {/* Sync Status & Footer Actions */}
      <div id="sidebar-footer-region" className="mt-auto px-4 space-y-3">
        {/* Storage Guard Box */}
        <div id="crypto-guard-banner" className="p-4 bg-surface-base rounded-lg border border-border-stroke">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${nodeSynced ? 'bg-brand-neon animate-pulse' : 'bg-yellow-500 animate-bounce'}`}></span>
            <span className="font-mono text-[10px] uppercase text-brand-neon font-semibold tracking-wider">
              {nodeSynced ? 'Local-First Sync' : 'Local Syncing'}
            </span>
          </div>
          <p className="font-mono text-[11px] text-text-secondary opacity-80 leading-relaxed">
            Decentralized storage active. Zero-Knowledge proofs verified.
          </p>
        </div>

        {/* Documentation Action */}
        <button
          id="sidebar-btn-docs"
          onClick={() => setView('documentation')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all cursor-pointer text-text-secondary hover:bg-surface-highest hover:text-white ${
            currentView === 'documentation' ? 'text-brand-neon bg-surface-highest' : ''
          }`}
        >
          <Terminal id="icon-docs" className="w-4.5 h-4.5" />
          <span className="font-mono text-xs font-semibold">Documentation</span>
        </button>

        {/* Log Out */}
        <button
          id="sidebar-btn-logout"
          onClick={() => {
            if (confirm("Your cryptography key pair is stored locally. Logging out will clear session cache. Proceed?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all cursor-pointer text-text-secondary hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut id="icon-logout" className="w-4.5 h-4.5" />
          <span className="font-mono text-xs font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );
}

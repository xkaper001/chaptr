import React from "react";
import { Home, BookOpen, BarChart3, Terminal, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  currentView: 'home' | 'library' | 'analytics' | 'documentation';
  setView: (view: 'home' | 'library' | 'analytics' | 'documentation') => void;
  nodeSynced: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentView, setView, nodeSynced, isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      id="sidebar-container"
      className={`hidden md:flex h-screen fixed left-0 top-0 border-r border-border-stroke bg-surface-container flex-col py-8 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div id="sidebar-brand-box" className={`px-4 mb-10 flex items-center ${isCollapsed ? "flex-col gap-4 justify-center" : "justify-between px-6"}`}>
        {!isCollapsed ? (
          <>
            <div>
              <h1 id="brand-logo-txt" className="font-mono text-base font-bold text-brand-neon uppercase tracking-widest flex items-center gap-2">
                CHAPTR
              </h1>
              <p id="brand-version-txt" className="font-mono text-[10px] text-text-secondary opacity-60 mt-1">
                v.0.4.2-stable
              </p>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded bg-surface-highest text-text-secondary hover:text-white border border-border-stroke/60 hover:border-brand-neon/40 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-base font-bold text-brand-neon uppercase tracking-widest">
              C
            </span>
            <button
              onClick={onToggle}
              className="p-1.5 rounded bg-surface-highest text-text-secondary hover:text-white border border-border-stroke/60 hover:border-brand-neon/40 transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav id="sidebar-navigation" className={`flex-1 space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}>
        {/* Home Tab */}
        <button
          id="tab-home"
          onClick={() => setView('home')}
          className={`w-full flex items-center rounded text-left transition-all cursor-pointer group ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          } ${
            currentView === 'home'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
          title={isCollapsed ? "Home" : undefined}
        >
          <Home id="icon-home" className={`w-5 h-5 group-hover:scale-105 transition-transform ${currentView === 'home' ? 'text-brand-neon' : 'text-text-secondary'}`} />
          {!isCollapsed && <span className="font-mono text-sm font-medium">Home</span>}
        </button>

        {/* Library Tab */}
        <button
          id="tab-library"
          onClick={() => setView('library')}
          className={`w-full flex items-center rounded text-left transition-all cursor-pointer group ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          } ${
            currentView === 'library'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
          title={isCollapsed ? "Library" : undefined}
        >
          <BookOpen id="icon-library" className={`w-5 h-5 group-hover:translate-x-0.5 transition-transform ${currentView === 'library' ? 'text-brand-neon' : 'text-text-secondary'}`} />
          {!isCollapsed && <span className="font-mono text-sm font-medium">Library</span>}
        </button>

        {/* Analytics Tab */}
        <button
          id="tab-analytics"
          onClick={() => setView('analytics')}
          className={`w-full flex items-center rounded text-left transition-all cursor-pointer group ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          } ${
            currentView === 'analytics'
              ? 'bg-surface-highest text-brand-neon border-l-4 border-brand-neon'
              : 'text-text-secondary hover:bg-surface-highest hover:text-white'
          }`}
          title={isCollapsed ? "Analytics" : undefined}
        >
          <BarChart3 id="icon-analytics" className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          {!isCollapsed && <span className="font-mono text-sm font-medium">Analytics</span>}
        </button>
      </nav>

      {/* Sync Status & Footer Actions */}
      <div id="sidebar-footer-region" className={`mt-auto space-y-3 ${isCollapsed ? "px-2" : "px-4"}`}>
        {/* Storage Guard Box */}
        {!isCollapsed ? (
          <div id="crypto-guard-banner" className="p-4 bg-surface-base rounded border border-border-stroke">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${nodeSynced ? 'bg-brand-neon animate-pulse' : 'bg-yellow-500 animate-bounce'}`}></span>
              <span className="font-mono text-[10px] uppercase text-brand-neon font-semibold tracking-wider">
                Local Storage Sync
              </span>
            </div>
            <p className="font-mono text-[11px] text-text-secondary opacity-80 leading-relaxed">
              All coursework is saved directly to your local file system and browser database.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Local Storage Sync Active">
            <span className={`w-2.5 h-2.5 rounded-full ${nodeSynced ? 'bg-brand-neon animate-pulse' : 'bg-yellow-500 animate-bounce'}`}></span>
          </div>
        )}

        {/* Documentation Action */}
        <button
          id="sidebar-btn-docs"
          onClick={() => setView('documentation')}
          className={`w-full flex items-center rounded text-left transition-all cursor-pointer text-text-secondary hover:bg-surface-highest hover:text-white ${
            isCollapsed ? "justify-center py-2.5" : "gap-3 px-4 py-2.5"
          } ${
            currentView === 'documentation' ? 'text-brand-neon bg-surface-highest' : ''
          }`}
          title={isCollapsed ? "Documentation" : undefined}
        >
          <Terminal id="icon-docs" className="w-4.5 h-4.5" />
          {!isCollapsed && <span className="font-mono text-xs font-semibold">Documentation</span>}
        </button>
      </div>
    </aside>
  );
}

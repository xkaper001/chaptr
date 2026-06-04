import React, { useState } from "react";
import { Home, HelpCircle, Menu, X, BookOpen, BarChart3, Terminal } from "lucide-react";

interface HeaderProps {
  currentView: 'home' | 'library' | 'analytics' | 'documentation';
  setView: (view: 'home' | 'library' | 'analytics' | 'documentation') => void;
  isSidebarCollapsed: boolean;
}

export default function Header({ currentView, setView, isSidebarCollapsed }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      id="header-bar"
      className={`fixed top-0 right-0 z-40 border-b border-border-stroke bg-surface-base/80 backdrop-blur-md flex justify-between items-center px-6 md:px-12 h-16 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
      }`}
    >
      {/* Mobile Menu Trigger & Logo */}
      <div id="mobile-branding-row" className="flex items-center gap-4">
        <button
          id="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white hover:text-brand-neon transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span
          id="branding-title"
          onClick={() => setView('home')}
          className="font-mono text-xl font-extrabold text-brand-neon tracking-tighter cursor-pointer"
        >
          Chaptr
        </span>
      </div>


      {/* Right Controls */}
      <div id="profile-controls-row" className="flex items-center gap-4 text-text-secondary">
        <button
          id="btn-nav-help"
          onClick={() => setView('documentation')}
          className="hover:text-brand-neon transition-colors duration-150 p-1 rounded-full cursor-pointer active:scale-95"
          title="Platform Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-surface-base border-t border-border-stroke z-30 flex flex-col p-6 animate-fade-in">
          <nav className="flex-1 space-y-4">
            <button
              onClick={() => {
                setView('home');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 text-left font-mono py-2 text-lg text-white font-medium"
            >
              <Home className="w-5 h-5 text-brand-neon" />
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                setView('library');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 text-left font-mono py-2 text-lg text-white font-medium"
            >
              <BookOpen className="w-5 h-5 text-brand-neon" />
              <span>Library</span>
            </button>
            <button
              onClick={() => {
                setView('analytics');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 text-left font-mono py-2 text-lg text-white font-medium"
            >
              <BarChart3 className="w-5 h-5 text-brand-neon" />
              <span>Analytics Stats</span>
            </button>
            <button
              onClick={() => {
                setView('documentation');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 text-left font-mono py-2 text-lg text-white font-medium"
            >
              <Terminal className="w-5 h-5 text-brand-neon" />
              <span>Documentation blueprints</span>
            </button>
          </nav>
          
          <div className="border-t border-border-stroke pt-6 mt-auto">
            <p className="font-mono text-xs text-text-secondary">Running entirely in local browser workspace.</p>
          </div>
        </div>
      )}
    </header>
  );
}

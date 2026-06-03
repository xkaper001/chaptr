import React, { useState, useEffect } from "react";
import { Shield, Settings, Key, Cpu, RefreshCw, X, Check, Shuffle, Award, PlayCircle, BookOpen, Terminal, BarChart3, Download } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LibraryView from "./components/LibraryView";
import CourseDetailView from "./components/CourseDetailView";
import AnalyticsView from "./components/AnalyticsView";
import DownloadsView from "./components/DownloadsView";
import DocumentationView from "./components/DocumentationView";
import { Playlist, Course, FolderProgress } from "./types";
import { saveProgressToFolder } from "./lib/scanner";

export default function App() {
  const [currentView, setView] = useState<'library' | 'active-course' | 'downloads' | 'analytics' | 'documentation'>('library');
  
  // Local-first loaded directory states
  const [loadedPlaylist, setLoadedPlaylist] = useState<Playlist | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Global gamified metadata stats (locally persisted in localStorage)
  const [userXP, setUserXP] = useState(100);
  const [streakDays, setStreakDays] = useState(1);
  const [nodeSynced, setNodeSynced] = useState(true);

  // Security & encryption configurations drawer state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cryptoAlgorithm, setCryptoAlgorithm] = useState("AES-256-GCM");
  const [entropyPool, setEntropyPool] = useState("0x4A6B");
  const [mnemonicPhrase, setMnemonicPhrase] = useState("");

  const USER_EMAIL = "sandbox-user@chaptr.local";

  useEffect(() => {
    // Load local metrics from localStorage if stored
    const savedXP = localStorage.getItem("chaptr_user_xp");
    const savedStreak = localStorage.getItem("chaptr_streak");

    if (savedXP) setUserXP(parseInt(savedXP, 10));
    if (savedStreak) setStreakDays(parseInt(savedStreak, 10));

    generateNewMnemonic();
  }, []);

  const generateNewMnemonic = () => {
    const seedWords = [
      "directory", "client", "sandbox", "token", "encryption", "entropy",
      "cipher", "sha256", "private", "access", "local", "indexeddb",
      "course", "playlist", "chapter", "tracker", "progress", "integrity"
    ];
    const sequence = Array.from({ length: 12 }, () => seedWords[Math.floor(Math.random() * seedWords.length)]);
    setMnemonicPhrase(sequence.join(" "));
    setEntropyPool("0x" + Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, "0"));
  };

  const handleSetView = (view: 'library' | 'active-course' | 'downloads' | 'analytics' | 'documentation') => {
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mount/select course from Library indexers
  const handleSelectCourse = (course: Course, parentPlaylist: Playlist | null) => {
    setActiveCourse(course);
    setLoadedPlaylist(parentPlaylist);
    handleSetView('active-course');
  };

  // Mount/select a multi-course playlist from Library indexers
  const handleSelectPlaylist = (playlist: Playlist) => {
    setLoadedPlaylist(playlist);
    if (playlist.courses.length > 0) {
      setActiveCourse(playlist.courses[0]);
    }
    handleSetView('active-course');
  };

  // Manage course completions and track progress.json changes
  const handleUpdateProgress = async (
    courseId: string, 
    filePath: string, 
    completed: boolean, 
    isLastOpenedOnly: boolean = false
  ) => {
    let targetCourse: Course | null = null;
    let xpGain = 0;

    // 1. If currently inside a loaded Playlist representation, update its course
    if (loadedPlaylist) {
      const updatedCourses = loadedPlaylist.courses.map((c) => {
        if (c.id === courseId) {
          const updatedProgress = { ...c.progress };
          
          if (isLastOpenedOnly) {
            updatedProgress.__lastOpened = filePath;
          } else {
            if (completed) {
              updatedProgress[filePath] = true;
              xpGain = 120; // 120 XP Reward per lesson completed
            } else {
              delete updatedProgress[filePath];
              xpGain = -120;
            }
          }

          // Compute new completion %
          let totalCount = 0;
          let finishCount = 0;

          const updatedChapters = c.chapters.map((ch) => {
            const updatedFiles = ch.files.map((f) => {
              totalCount++;
              const isCompleted = !!updatedProgress[f.path];
              if (isCompleted) finishCount++;
              return { ...f, completed: isCompleted };
            });
            return { ...ch, files: updatedFiles };
          });

          const percent = totalCount > 0 ? Math.round((finishCount / totalCount) * 100) : 0;
          
          const newCourseObj: Course = {
            ...c,
            chapters: updatedChapters,
            progress: updatedProgress,
            completionPercent: percent
          };
          targetCourse = newCourseObj;
          return newCourseObj;
        }
        return c;
      });

      setLoadedPlaylist({
        ...loadedPlaylist,
        courses: updatedCourses
      });
    }

    // 2. Update active course state directly
    if (activeCourse && activeCourse.id === courseId) {
      if (targetCourse) {
        setActiveCourse(targetCourse);
      } else {
        // Standalone course mode update
        const c = activeCourse;
        const updatedProgress = { ...c.progress };

        if (isLastOpenedOnly) {
          updatedProgress.__lastOpened = filePath;
        } else {
          if (completed) {
            updatedProgress[filePath] = true;
            xpGain = 120;
          } else {
            delete updatedProgress[filePath];
            xpGain = -120;
          }
        }

        let totalCount = 0;
        let finishCount = 0;

        const updatedChapters = c.chapters.map((ch) => {
          const updatedFiles = ch.files.map((f) => {
            totalCount++;
            const isCompleted = !!updatedProgress[f.path];
            if (isCompleted) finishCount++;
            return { ...f, completed: isCompleted };
          });
          return { ...ch, files: updatedFiles };
        });

        const percent = totalCount > 0 ? Math.round((finishCount / totalCount) * 100) : 0;

        const newCourseObj: Course = {
          ...c,
          chapters: updatedChapters,
          progress: updatedProgress,
          completionPercent: percent
        };
        targetCourse = newCourseObj;
        setActiveCourse(newCourseObj);
      }
    }

    // 3. Increment XP metrics
    if (xpGain !== 0) {
      const nextXP = Math.max(0, userXP + xpGain);
      setUserXP(nextXP);
      localStorage.setItem("chaptr_user_xp", String(nextXP));

      if (xpGain > 0) {
        const nextStreak = streakDays + 1;
        setStreakDays(nextStreak);
        localStorage.setItem("chaptr_streak", String(nextStreak));
      }
    }

    // 4. Save progress.json specifically back to user file system using handle if supported!
    if (targetCourse && targetCourse.handle) {
      setNodeSynced(false);
      const success = await saveProgressToFolder(targetCourse.handle, targetCourse.progress);
      setNodeSynced(true);
      if (!success) {
        console.warn("[App] Could not write progress.json to directory disk handle. Progress remains active in browser.");
      }
    }
  };

  // Compute total completed count across any active materials
  const aggregatedFilesCompleted = activeCourse ? 
    activeCourse.chapters.reduce((acc, ch) => acc + ch.files.filter(f => !!activeCourse.progress[f.path]).length, 0)
    : 0;

  return (
    <div id="chaptr-app-shell" className="min-h-screen bg-background relative overflow-x-hidden antialiased">
      
      {/* Sidebar navigation control */}
      <Sidebar
        currentView={currentView}
        setView={handleSetView}
        nodeSynced={nodeSynced}
      />

      {/* Main app header */}
      <Header
        currentView={currentView}
        setView={handleSetView}
        userEmail={USER_EMAIL}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Primary Workspace Stage */}
      <main id="main-content-canvas" className="md:ml-64 pt-16 min-h-screen relative flex flex-col justify-between">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="grid-overlay absolute inset-0"></div>
        </div>

        <div className="relative z-10 flex-1">
          {currentView === 'library' && (
            <LibraryView
              onSelectCourse={handleSelectCourse}
              onSelectPlaylist={handleSelectPlaylist}
            />
          )}

          {currentView === 'active-course' && (
            <CourseDetailView
              course={activeCourse}
              parentPlaylist={loadedPlaylist}
              onBack={() => handleSetView('library')}
              onUpdateProgress={handleUpdateProgress}
              onSelectCourse={(course) => handleSelectCourse(course, loadedPlaylist)}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              completedCount={aggregatedFilesCompleted}
              userXP={userXP}
              streakDays={streakDays}
            />
          )}

          {currentView === 'downloads' && (
            <DownloadsView />
          )}

          {currentView === 'documentation' && (
            <DocumentationView />
          )}
        </div>

        {/* Console Spec Footer */}
        <footer id="footer-section" className="relative z-10 px-6 md:px-12 py-12 border-t border-border-stroke bg-surface-container/45 mt-20 select-none">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            
            <div className="col-span-1 md:col-span-2 space-y-4 text-left">
              <span className="font-mono text-xl font-extrabold text-brand-neon tracking-tighter">CHAPTR</span>
              <p className="font-mono text-xs text-text-secondary leading-relaxed max-w-sm">
                A localized client-side workspace that maps system folders directly into interactive lesson syllabi without databases. Zero trackers.
              </p>
            </div>

            <div>
              <h6 className="font-mono text-[11px] text-white font-semibold mb-5 uppercase tracking-wider text-left">
                Console specs
              </h6>
              <ul className="space-y-3.5 font-mono text-xs text-text-secondary/70 text-left">
                <li className="flex justify-between items-center">
                  <span>File write sync:</span>
                  <span className="text-brand-neon font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-neon inline-block"></span> Active
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Persistence:</span>
                  <span className="text-white font-semibold">Native FS + IndexedDB</span>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="font-mono text-[11px] text-white font-semibold mb-5 uppercase tracking-wider text-left">
                Resource references
              </h6>
              <ul className="space-y-3.5 font-mono text-xs text-text-secondary text-left">
                <li>
                  <a
                    className="hover:text-brand-neon transition-colors"
                    href="https://github.com"
                    target="_blank"
                    referrerPolicy="no-referrer"
                  >
                    GitHub Project
                  </a>
                </li>
                <li>
                  <span className="text-text-secondary/50">MDN File System Access API</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border-stroke/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary/40 font-mono">
            <p>© 2026 Chaptr Learning Client. Fully decentralized static node.</p>
          </div>
        </footer>
      </main>

      {/* Security configurations popup drawer */}
      {isSettingsOpen && (
        <div id="settings-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div id="settings-dialogue" className="bg-surface-container border border-border-stroke w-full max-w-lg p-6 sm:p-8 rounded-none relative">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 select-none">
              <Settings className="w-6 h-6 text-brand-neon" />
              <h3 className="text-xl font-bold text-white tracking-tight">System details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] uppercase text-text-secondary mb-2 text-left">
                  Workspace sandbox cryptography
                </label>
                <div id="alg-selection-row" className="grid grid-cols-2 gap-2">
                  {["AES-256-GCM", "ChaCha20-Poly1305"].map((alg) => (
                    <button
                      key={alg}
                      onClick={() => setCryptoAlgorithm(alg)}
                      className={`py-2 px-3 justify-center border font-mono text-xs rounded transition-colors cursor-pointer ${
                        cryptoAlgorithm === alg
                          ? "bg-brand-neon/10 border-brand-neon text-brand-neon font-bold"
                          : "border-border-stroke bg-surface-base/50 text-text-secondary hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>

              <div id="settings-mnemonic-box" className="text-left">
                <label className="block font-mono text-[10px] uppercase text-text-secondary mb-2">
                  Client Seed (12 Words Mnemonic)
                </label>
                <div className="p-3 bg-surface-base border border-border-stroke rounded text-xs text-white/90 font-mono leading-relaxed select-all">
                  {mnemonicPhrase}
                </div>
                <p className="text-[10px] text-text-secondary/60 mt-1.5 font-mono">
                  Used client-side to generate internal IDs and authenticate cache signatures.
                </p>
              </div>

              <div className="text-left">
                <label className="block font-mono text-[10px] uppercase text-text-secondary mb-1">
                  System entropy signature
                </label>
                <div className="flex items-center gap-3 bg-surface-base p-2 px-3 border border-border-stroke rounded select-none">
                  <Cpu className="w-4 h-4 text-brand-neon" />
                  <span className="font-mono text-xs text-white/95 font-bold tracking-widest">{entropyPool}</span>
                  <span className="font-mono text-[9px] text-green-500 uppercase font-semibold ml-auto flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Client Parity Secured
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-6 w-full py-2.5 bg-surface-base hover:bg-surface-highest text-white font-bold font-mono text-xs uppercase border border-border-stroke rounded cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

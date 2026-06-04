import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import LibraryListView from "./components/LibraryListView";
import CourseDetailView from "./components/CourseDetailView";
import AnalyticsView from "./components/AnalyticsView";
import DocumentationView from "./components/DocumentationView";
import { Playlist, Course, FolderProgress } from "./types";
import { saveProgressToFolder } from "./lib/scanner";
import { analytics } from "./lib/analytics";

export default function App() {
  const [currentView, setView] = useState<'home' | 'library' | 'analytics' | 'documentation'>('home');
  
  // Local-first loaded directory states
  const [loadedPlaylist, setLoadedPlaylist] = useState<Playlist | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Global study metrics (locally persisted in localStorage)
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chaptr_time_spent_seconds");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [streakDays, setStreakDays] = useState(0);
  const [nodeSynced, setNodeSynced] = useState(true);

  // Sidebar collapse state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chaptr_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("chaptr_sidebar_collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Handle consecutive days study streak activity
  const handleStudyActivity = () => {
    const todayStr = new Date().toLocaleDateString("sv-SE");
    const lastStudyDate = localStorage.getItem("chaptr_last_study_date");
    const savedStreak = localStorage.getItem("chaptr_streak");
    let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

    if (!lastStudyDate) {
      currentStreak = 1;
      localStorage.setItem("chaptr_streak", "1");
      localStorage.setItem("chaptr_last_study_date", todayStr);
      setStreakDays(1);
    } else if (lastStudyDate !== todayStr) {
      const todayDate = new Date(todayStr);
      const lastDate = new Date(lastStudyDate);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      localStorage.setItem("chaptr_streak", String(currentStreak));
      localStorage.setItem("chaptr_last_study_date", todayStr);
      setStreakDays(currentStreak);
    }
  };

  useEffect(() => {
    // Load local metrics from localStorage if stored
    const savedStreak = localStorage.getItem("chaptr_streak");
    const lastStudyDate = localStorage.getItem("chaptr_last_study_date");
    const todayStr = new Date().toLocaleDateString("sv-SE");

    if (savedStreak) {
      const streakVal = parseInt(savedStreak, 10);
      if (lastStudyDate && lastStudyDate !== todayStr) {
        const todayDate = new Date(todayStr);
        const lastDate = new Date(lastStudyDate);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          setStreakDays(0);
          localStorage.setItem("chaptr_streak", "0");
        } else {
          setStreakDays(streakVal);
        }
      } else {
        setStreakDays(streakVal);
      }
    } else {
      setStreakDays(0);
    }
  }, []);

  // Study timer — only counts when actively in a course (studying)
  useEffect(() => {
    const interval = setInterval(() => {
      const isStudying = currentView === 'library' && activeCourse !== null;
      if (isStudying && document.hasFocus()) {
        setTimeSpentSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem("chaptr_time_spent_seconds", String(next));

          // Mark active study session to maintain streak if active at least 10 seconds
          if (next >= 10 && next % 10 === 0) {
            handleStudyActivity();
          }

          // Heartbeat every 5 minutes of active study
          if (next > 0 && next % 300 === 0 && activeCourse) {
            analytics.studyHeartbeat({
              courseId: activeCourse.id,
              courseName: activeCourse.name,
              totalSecondsToday: next,
            });
          }

          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, activeCourse]);

  const handleSetView = (view: 'home' | 'library' | 'analytics' | 'documentation') => {
    setView(view);
    analytics.pageViewed(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mount/select course from Library indexers
  const handleSelectCourse = (course: Course, parentPlaylist: Playlist | null) => {
    setActiveCourse(course);
    setLoadedPlaylist(parentPlaylist);
    handleSetView('library');
    analytics.courseOpened({
      courseId: course.id,
      courseName: course.name,
      playlistName: parentPlaylist?.name,
    });
  };

  // Mount/select a multi-course playlist from Library indexers
  const handleSelectPlaylist = (playlist: Playlist) => {
    setLoadedPlaylist(playlist);
    if (playlist.courses.length > 0) {
      setActiveCourse(playlist.courses[0]);
    }
    handleSetView('library');
    analytics.playlistOpened({
      playlistId: playlist.id,
      playlistName: playlist.name,
      courseCount: playlist.courses.length,
    });
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

    if (!isLastOpenedOnly) {
      const course = activeCourse?.id === courseId ? activeCourse
        : loadedPlaylist?.courses.find(c => c.id === courseId) ?? null;
      const fileType = course?.chapters.flatMap(ch => ch.files).find(f => f.path === filePath)?.type ?? 'unknown';
      const courseName = course?.name ?? courseId;
      if (completed) {
        analytics.lessonCompleted({ filePath, fileType, courseName, courseId });
      } else {
        analytics.lessonUncompleted({ filePath, courseId });
      }
    }

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
              handleStudyActivity();
            } else {
              delete updatedProgress[filePath];
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
            handleStudyActivity();
          } else {
            delete updatedProgress[filePath];
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

    // 3. Save progress.json specifically back to user file system using handle if supported!
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
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main app header */}
      <Header
        currentView={currentView}
        setView={handleSetView}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Primary Workspace Stage */}
      <main
        id="main-content-canvas"
        className={`pt-16 min-h-screen relative flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="grid-overlay absolute inset-0"></div>
        </div>

        <div className="relative z-10 flex-1">
          {currentView === 'home' && (
            <HomeView
              onSelectCourse={handleSelectCourse}
              onSelectPlaylist={handleSelectPlaylist}
            />
          )}

          {currentView === 'library' && (
            activeCourse ? (
              <CourseDetailView
                course={activeCourse}
                parentPlaylist={loadedPlaylist}
                onBack={() => {
                  setActiveCourse(null);
                  setLoadedPlaylist(null);
                }}
                onUpdateProgress={handleUpdateProgress}
                onSelectCourse={(course) => handleSelectCourse(course, loadedPlaylist)}
              />
            ) : (
              <LibraryListView
                onSelectCourse={handleSelectCourse}
                onSelectPlaylist={handleSelectPlaylist}
              />
            )
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              completedCount={aggregatedFilesCompleted}
              timeSpentSeconds={timeSpentSeconds}
              streakDays={streakDays}
            />
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
            <p>© 2026 Chaptr Learning Client. Local-first static web player.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

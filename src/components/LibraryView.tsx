import React, { useState, useEffect } from "react";
import { FolderOpen, Folder, PlayCircle, PlusCircle, Shield, AlertTriangle, ArrowRight, Video, FileText, CheckCircle2, Eye, HelpCircle } from "lucide-react";
import { Course, RecentDirectory, Playlist } from "../types";
import { scanDirectoryStructure, verifyPermission } from "../lib/scanner";
import { getRecentDirectoriesList, saveRecentDirectoryItem, removeRecentDirectoryItem, getDirectoryHandle } from "../lib/db";

interface LibraryViewProps {
  onSelectCourse: (course: Course, parentPlaylist: Playlist | null) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export default function LibraryView({ onSelectCourse, onSelectPlaylist }: LibraryViewProps) {
  const [recents, setRecents] = useState<RecentDirectory[]>([]);
  const [errorText, setErrorText] = useState("");
  const [apiSupported, setApiSupported] = useState(true);

  useEffect(() => {
    // Check if File System Access API is supported
    const hasAPI = typeof window !== 'undefined' && !!(window as any).showDirectoryPicker;
    setApiSupported(hasAPI);
    
    if (!hasAPI && typeof window !== 'undefined') {
      if (!window.isSecureContext) {
        setErrorText("The File System Access API is disabled by the browser because you are accessing this site via an insecure context (http://0.0.0.0). Please access the app via http://localhost:3000 or http://127.0.0.1:3000 to enable native folder selection.");
      }
    }
    setRecents(getRecentDirectoriesList());
  }, []);

  const handleImportCourse = async () => {
    setErrorText("");
    try {
      if (!(window as any).showDirectoryPicker) {
        throw new Error("Your browser does not support the File System Access API. Please use a secure context (HTTPS) or localhost with a compatible browser.");
      }

      const dirHandle = await (window as any).showDirectoryPicker();

      const courses = await scanDirectoryStructure(dirHandle, 'course');
      if (courses.length === 0) {
        throw new Error("No chapter subfolders found. Place your learning files within subfolders (e.g., CourseFolder/Chapter1/01.mp4).");
      }

      const activeCourse = courses[0];
      const parentPlaylist: Playlist = {
        id: "playlist_" + Date.now(),
        name: dirHandle.name,
        courses: [activeCourse],
        mode: 'course',
        handle: dirHandle
      };

      // Count files
      let fileCount = 0;
      activeCourse.chapters.forEach(ch => {
        fileCount += ch.files.length;
      });

      // Save to IndexedDB and LocalStorage Recents
      const indexedDB = await import("../lib/db");
      await indexedDB.saveDirectoryHandle(parentPlaylist.id, dirHandle);
      
      const recentItem: RecentDirectory = {
        id: parentPlaylist.id,
        name: dirHandle.name,
        mode: 'course',
        timestamp: Date.now(),
        courseCount: 1,
        chapterCount: activeCourse.chapters.length,
        fileCount
      };
      
      saveRecentDirectoryItem(recentItem);
      onSelectCourse(activeCourse, parentPlaylist);

    } catch (err: any) {
      console.warn(err);
      if (err.name === "SecurityError" || err.message?.includes("security")) {
        setErrorText("Security restriction: Directory picker was blocked. This often happens inside embedded frames. Open this app in a New Tab or use the interactive Simulator Sandbox below!");
      } else if (err.name !== "AbortError") {
        setErrorText(err.message || "Failed to scan folder contents. Ensure the structure is correct.");
      }
    }
  };

  const handleImportPlaylist = async () => {
    setErrorText("");
    try {
      if (!(window as any).showDirectoryPicker) {
        throw new Error("Your browser does not support the File System Access API. Please open this app in a secure context (HTTPS) or localhost with a compatible browser.");
      }

      const dirHandle = await (window as any).showDirectoryPicker();

      const courses = await scanDirectoryStructure(dirHandle, 'playlist');
      if (courses.length === 0) {
        throw new Error("Scan finished: No Course subfolders with Chapter directories were identified.");
      }

      const playlist: Playlist = {
        id: "playlist_" + Date.now(),
        name: dirHandle.name,
        courses,
        mode: 'playlist',
        handle: dirHandle
      };

      // Count stats
      let chapterCount = 0;
      let fileCount = 0;
      courses.forEach(c => {
        chapterCount += c.chapters.length;
        c.chapters.forEach(ch => {
          fileCount += ch.files.length;
        });
      });

      // Save to IndexedDB and LocalStorage Recents
      const indexedDB = await import("../lib/db");
      await indexedDB.saveDirectoryHandle(playlist.id, dirHandle);

      const recentItem: RecentDirectory = {
        id: playlist.id,
        name: dirHandle.name,
        mode: 'playlist',
        timestamp: Date.now(),
        courseCount: courses.length,
        chapterCount,
        fileCount
      };

      saveRecentDirectoryItem(recentItem);
      onSelectPlaylist(playlist);

    } catch (err: any) {
      console.warn(err);
      if (err.name === "SecurityError") {
        setErrorText("Security restriction: Directory picker is blocked in iframe previews. Touch 'Open In New Tab' in AI Studio options or launch the Simulator Sandbox below!");
      } else if (err.name !== "AbortError") {
        setErrorText(err.message || "Failed to scan directory playlist structure.");
      }
    }
  };

  // Mount a pre-saved recent directory handle
  const handleLoadRecent = async (recent: RecentDirectory) => {
    setErrorText("");
    try {
      const dirHandle = await getDirectoryHandle(recent.id);
      if (!dirHandle) {
        throw new Error("Cached folder authorization is obsolete or deleted. Please re-import the local directory.");
      }

      const verified = await verifyPermission(dirHandle, true);
      if (!verified) {
        throw new Error("Permission to read folder was denied by browser.");
      }

      const courses = await scanDirectoryStructure(dirHandle, recent.mode);
      
      if (recent.mode === 'course') {
        const activeCourse = courses[0];
        const playlist: Playlist = {
          id: recent.id,
          name: dirHandle.name,
          courses: [activeCourse],
          mode: 'course',
          handle: dirHandle
        };
        onSelectCourse(activeCourse, playlist);
      } else {
        const playlist: Playlist = {
          id: recent.id,
          name: dirHandle.name,
          courses,
          mode: 'playlist',
          handle: dirHandle
        };
        onSelectPlaylist(playlist);
      }

    } catch (err: any) {
      console.warn(err);
      setErrorText(`Failed to mount directory handle: ${err.message || "Permission restricted."}. Prompting to remove listing.`);
    }
  };

  const handleRemoveRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentDirectoryItem(id);
    setRecents(getRecentDirectoriesList());
  };


  return (
    <div id="library-view-root" className="relative z-10 px-6 md:px-12 py-10 max-w-7xl mx-auto selection:bg-brand-neon selection:text-background text-left">
      {/* Zero-Knowledge Pill */}
      <div id="hero-badge-row" className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-neon/30 bg-brand-neon/10 text-xs text-brand-neon font-mono uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5 fill-brand-neon/20 animate-pulse" />
          <span>Local Folder Course Player</span>
        </div>
      </div>

      {/* Hero Header */}
      <div id="hero-headings" className="text-center mb-10 max-w-4xl mx-auto select-none">
        <h2 className="text-4xl md:text-5xl lg:text-5.5 text-white font-extrabold tracking-tighter leading-tight mb-4">
          Own your syllabus. <br /> <span className="text-brand-neon">Local-first</span> indexed playback.
        </h2>
        <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto opacity-80">
          Chaptr maps local folders of videos, PDFs, and text files into dynamic interactive courses. Everything is private, stored entirely in browser RAM and IndexedDB.
        </p>
      </div>

      {/* Directory Access Warning in Iframe / Browser */}
      {(!apiSupported || !!errorText) && (
        <div className="max-w-xl mx-auto mb-10 bg-yellow-900/20 border border-yellow-700/40 p-4 rounded text-xs leading-relaxed text-yellow-300 font-mono">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-brand-neon shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase block">API Availability Note</span>
              <p>{errorText || "The standard File System Access API might be restricted or unsupported in your current browser. Please ensure you are using a Chromium-based browser (Chrome, Edge, Opera) over HTTPS or localhost."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Importers */}
      <div id="interactive-importers-row" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
        {/* Course Importer */}
        <div 
          onClick={handleImportCourse}
          className="group bg-surface-container border border-border-stroke p-8 hover:border-brand-neon hover:bg-surface-highest/20 transition-all duration-300 cursor-pointer select-none text-left rounded-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/5 rounded-full blur-2xl group-hover:bg-brand-neon/10 transition-colors"></div>
          <div className="p-3 bg-surface-highest text-brand-neon border border-border-stroke w-fit rounded-lg mb-6 group-hover:scale-105 transition-transform">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-neon transition-colors">Import Course Folder</h3>
          <p className="text-sm text-text-secondary leading-relaxed opacity-70 mb-6">
            Standard 1-level folder structure. Map chapters and curriculum outlines immediately from directories containing content.
          </p>
          <div className="flex items-center gap-1 text-xs text-brand-neon font-mono uppercase font-bold tracking-wider">
            <span>Scan course root</span> <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Playlist Importer */}
        <div 
          onClick={handleImportPlaylist}
          className="group bg-surface-container border border-border-stroke p-8 hover:border-brand-neon hover:bg-surface-highest/20 transition-all duration-300 cursor-pointer select-none text-left rounded-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
          <div className="p-3 bg-surface-highest text-brand-neon border border-border-stroke w-fit rounded-lg mb-6 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-neon transition-colors">Import Playlist Folder</h3>
          <p className="text-sm text-text-secondary leading-relaxed opacity-70 mb-6">
            Standard 2-level folder array containing multiple sub-courses (e.g., Cyber Security list with Networking+ and C++ labs).
          </p>
          <div className="flex items-center gap-1 text-xs text-brand-neon font-mono uppercase font-bold tracking-wider">
            <span>Recursively match courses</span> <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>


      {/* Recent Imports list */}
      <section id="library-recents" className="max-w-4xl mx-auto select-none">
        <div className="flex justify-between items-end mb-6 border-b border-border-stroke pb-3 text-left">
          <div>
            <h3 className="text-lg font-bold text-white">Recent folder directories</h3>
            <p className="font-mono text-[10px] text-text-secondary tracking-widest uppercase">Saved in IndexedDB storage</p>
          </div>
        </div>

        {recents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recents.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadRecent(item)}
                className="group flex items-center justify-between p-4 bg-surface-container border border-border-stroke hover:border-brand-neon/60 cursor-pointer transition-colors rounded text-left"
              >
                <div className="flex items-center gap-3.5 truncate pr-2">
                  <div className="p-2 bg-surface-highest text-brand-neon rounded">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h5 className="font-semibold text-white group-hover:text-brand-neon transition-colors text-sm truncate">
                      {item.name}
                    </h5>
                    <div className="flex gap-3 text-[10px] font-mono text-text-secondary mt-1">
                      <span className="uppercase text-brand-neon bg-brand-neon/5 px-1.5 py-0.5 border border-brand-neon/10 rounded">
                        {item.mode}
                      </span>
                      <span>{item.fileCount} Files</span>
                      <span>{item.chapterCount} Chapters</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveRecent(item.id, e)}
                  title="Remove from recents"
                  className="p-1 text-text-secondary hover:text-red-400 font-mono text-xs cursor-pointer ml-3 shrink-0 uppercase tracking-tight"
                >
                  Unindex
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border-stroke/80 p-10 text-center rounded text-xs font-mono text-text-secondary opacity-65">
            No directories registered. Select "Import Course Folder" or "Import Playlist Folder" to begin.
          </div>
        )}
      </section>
    </div>
  );
}

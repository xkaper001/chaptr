import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, AlertTriangle } from "lucide-react";
import { Course, Playlist, RecentDirectory } from "../types";
import { scanDirectoryStructure, verifyPermission } from "../lib/scanner";
import { getRecentDirectoriesList, removeRecentDirectoryItem, getDirectoryHandle } from "../lib/db";

interface LibraryListViewProps {
  onSelectCourse: (course: Course, parentPlaylist: Playlist | null) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export default function LibraryListView({ onSelectCourse, onSelectPlaylist }: LibraryListViewProps) {
  const [recents, setRecents] = useState<RecentDirectory[]>([]);
  const [errorText, setErrorText] = useState("");
  const [apiSupported, setApiSupported] = useState(true);

  useEffect(() => {
    const hasAPI = typeof window !== 'undefined' && !!(window as any).showDirectoryPicker;
    setApiSupported(hasAPI);
    setRecents(getRecentDirectoriesList());
  }, []);

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
      setErrorText(`Failed to mount directory handle: ${err.message || "Permission restricted."}`);
    }
  };

  const handleRemoveRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentDirectoryItem(id);
    setRecents(getRecentDirectoriesList());
  };

  return (
    <div id="library-list-view-root" className="relative z-10 px-6 md:px-12 py-10 max-w-7xl mx-auto selection:bg-brand-neon selection:text-background text-left">
      <div id="library-list-header" className="border-b border-border-stroke pb-5 mb-8 select-none">
        <h3 className="text-2xl font-bold text-white mb-1">Your Library</h3>
        <p className="font-mono text-xs text-text-secondary opacity-70">
          Browse and resume your imported directories and course materials
        </p>
      </div>

      {errorText && (
        <div className="max-w-xl mb-8 bg-red-900/20 border border-red-700/40 p-4 rounded text-xs leading-relaxed text-red-300 font-mono">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-brand-neon shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase block">Library Error</span>
              <p>{errorText}</p>
            </div>
          </div>
        </div>
      )}

      <section id="library-recents" className="select-none">
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
                  title="Remove from library"
                  className="p-1 text-text-secondary hover:text-red-400 font-mono text-xs cursor-pointer ml-3 shrink-0 uppercase tracking-tight"
                >
                  Unindex
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border-stroke/80 p-16 text-center rounded text-xs font-mono text-text-secondary opacity-65 flex flex-col items-center justify-center gap-4">
            <FolderOpen className="w-8 h-8 text-text-secondary/45" />
            <p>Your library is currently empty. Go to the Home tab to import local folders or playlists.</p>
          </div>
        )}
      </section>
    </div>
  );
}

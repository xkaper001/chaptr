import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, Play, ArrowLeft, Video, FileText, Code, Globe, 
  Check, AlertCircle, PlayCircle, FolderOpen, ChevronRight, ChevronDown, Award
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Course, TrackedFile, Chapter, Playlist, FolderProgress } from "../types";
import { VideoPlayer } from "./VideoPlayer";

interface CourseDetailViewProps {
  course: Course | null;
  parentPlaylist: Playlist | null;
  onBack: () => void;
  onUpdateProgress: (courseId: string, filePath: string, completed: boolean, isLastOpenedOnly?: boolean) => void;
  onSelectCourse?: (course: Course) => void;
}

export default function CourseDetailView({ 
  course, 
  parentPlaylist,
  onBack, 
  onUpdateProgress,
  onSelectCourse
}: CourseDetailViewProps) {
  if (!course) {
    return (
      <div id="course-empty-state" className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6 select-none">
        <FolderOpen className="w-14 h-14 text-brand-neon opacity-30 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2 font-mono">No Standalone Course Mounted</h3>
        <p className="text-text-secondary text-sm max-w-sm mb-6 opacity-75">
          Select or import a secure learning folder from the Library to begin playing files.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-brand-neon hover:bg-brand-neon-hover text-black font-bold font-mono text-xs uppercase"
        >
          Return to Library
        </button>
      </div>
    );
  }

  // Active file states
  const [activeFile, setActiveFile] = useState<TrackedFile | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string>("");
  const [fileText, setFileText] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState("");

  // Keep track of which chapter folders are expanded in sidebar
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Reference to video element for auto-complete trigger
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasManuallyUnmarkedRef = useRef<boolean>(false);

  // Initialize: Expand all chapters by default on load
  useEffect(() => {
    const freshExpanded: Record<string, boolean> = {};
    course.chapters.forEach(ch => {
      freshExpanded[ch.id] = true;
    });
    setExpandedChapters(freshExpanded);

    // Continue where left off logic!
    const lastOpenedPath = course.progress.__lastOpened;
    let foundFile: TrackedFile | null = null;

    if (lastOpenedPath) {
      // Find file with this specific path
      for (const ch of course.chapters) {
        const file = ch.files.find(f => f.path === lastOpenedPath);
        if (file) {
          foundFile = file;
          break;
        }
      }
    }

    // Fallback: Default to first file in first chapter
    if (!foundFile && course.chapters.length > 0 && course.chapters[0].files.length > 0) {
      foundFile = course.chapters[0].files[0];
    }

    if (foundFile) {
      handleSelectFile(foundFile);
    }
  }, [course.id]);

  // Load selected file object/blob url
  const handleSelectFile = async (fileItem: TrackedFile) => {
    setLoadingFile(true);
    setFileError("");
    setActiveFile(fileItem);
    setFileBlobUrl("");
    setFileText("");
    hasManuallyUnmarkedRef.current = false;

    try {
      if (fileItem.handle) {
        // Real File System Access API file loader
        const fileObj = await fileItem.handle.getFile();
        const objUrl = URL.createObjectURL(fileObj);
        setFileBlobUrl(objUrl);

        if (['text', 'code', 'html'].includes(fileItem.type)) {
          const text = await fileObj.text();
          setFileText(text);
        }
      } else {
        throw new Error("Local file handle is not available. Please re-import the folder.");
      }

      // Record which file template is last opened
      onUpdateProgress(course.id, fileItem.path, false, true); // (courseId, path, completed, isLastOpenedOnly = true)

    } catch (err: any) {
      console.error(err);
      setFileError(`Could not decrypt or load '${fileItem.name}': ${err.message || "Access permission lost."}`);
    } finally {
      setLoadingFile(false);
    }
  };

  // Revoke blob URL on change to prevent leaks
  useEffect(() => {
    return () => {
      if (fileBlobUrl && fileBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileBlobUrl);
      }
    };
  }, [fileBlobUrl]);

  // Expand or shrink a chapter foldout
  const toggleChapterFold = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Check video playback progression
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !activeFile) return;
    const { currentTime, duration } = videoRef.current;
    
    if (duration > 0 && currentTime / duration >= 0.9) {
      const isAlreadyCompleted = !!course.progress[activeFile.path];
      // Only fire progress update if not already recorded and user hasn't manually unmarked it
      if (!isAlreadyCompleted && !hasManuallyUnmarkedRef.current) {
        onUpdateProgress(course.id, activeFile.path, true, false);
      }
    }
  };

  // Toggle file completion manually
  const handleToggleComplete = () => {
    if (!activeFile) return;
    const currentCompleted = !!course.progress[activeFile.path];
    if (currentCompleted) {
      hasManuallyUnmarkedRef.current = true;
    }
    onUpdateProgress(course.id, activeFile.path, !currentCompleted, false);
  };

  // Get responsive Lucide Icon for specific file kinds
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'pdf': return <FileText className="w-4 h-4 shrink-0 text-rose-400" />;
      case 'html': return <Globe className="w-4 h-4 shrink-0 text-cyan-400" />;
      case 'code': return <Code className="w-4 h-4 shrink-0 text-purple-400" />;
      default: return <FileText className="w-4 h-4 shrink-0 text-text-secondary" />;
    }
  };

  // Check overall course progress metrics
  const isFileCompleted = (path: string) => !!course.progress[path];

  // Helper code renderer with line numbers and token coloring simulation
  const renderHighlightedCode = (code: string) => {
    const lines = code.split("\n");
    return (
      <div className="bg-surface-base border border-border-stroke p-5 rounded font-mono text-xs overflow-x-auto text-left leading-relaxed">
        <table className="w-full font-mono">
          <tbody>
            {lines.map((line, idx) => {
              // Quick mock token styling
              let styledLine = line;
              if (line.includes("//")) {
                const parts = line.split("//");
                styledLine = `${parts[0]}<span class="text-gray-500">//${parts.slice(1).join("//")}</span>`;
              } else if (line.includes("#")) {
                const parts = line.split("#");
                styledLine = `${parts[0]}<span class="text-gray-500">#${parts.slice(1).join("#")}</span>`;
              }
              // Basic keywords highlight
              styledLine = styledLine
                .replace(/\b(const|let|var|function|return|void|int|class|public|private|while|for|if|else|std|include|import|export|def|elif|fn|pub|use|struct|impl|type|package)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
                .replace(/\b(std::cout|std::endl|std::string)\b/g, '<span class="text-cyan-400">$1</span>')
                .replace(/(["'`])(.*?)\1/g, '<span class="text-orange-300">"$2"</span>')
                .replace(/\b(true|false)\b/g, '<span class="text-brand-neon font-semibold">$1</span>');

              return (
                <tr key={idx} className="hover:bg-surface-highest/20">
                  <td className="text-right pr-4 text-text-secondary opacity-30 select-none font-mono text-[11px] w-8">
                    {idx + 1}
                  </td>
                  <td className="text-left font-mono whitespace-pre text-slate-100" dangerouslySetInnerHTML={{ __html: styledLine || " " }}>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div id={`course-viewer-${course.id}`} className="px-6 md:px-12 py-8 max-w-7xl mx-auto flex flex-col gap-6 selection:bg-brand-neon selection:text-background">
      
      {/* Upper navigation breadcrumb */}
      <div id="course-header-crumb" className="flex flex-wrap items-center justify-between gap-4 border-b border-border-stroke pb-4 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-brand-neon transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
          <span className="text-border-stroke">|</span>
          <span className="font-mono text-xs text-text-secondary">
            Loaded: {parentPlaylist && parentPlaylist.courses.length > 1 ? `${parentPlaylist.name} (Playlist)` : "Standalone Course"}
          </span>
          <span className="text-border-stroke">/</span>
          <span className="font-mono text-xs font-bold text-brand-neon truncate max-w-[200px]">{course.name}</span>
        </div>

        {/* Course Playlist Nav Dropdown - If there are other courses in this playlist! */}
        {parentPlaylist && parentPlaylist.courses.length > 1 && (
          <div className="flex items-center gap-x-2.5">
            <span className="font-mono text-[10px] uppercase text-text-secondary">Other course modules:</span>
            <select
              onChange={(e) => {
                const targetCourse = parentPlaylist.courses.find(c => c.id === e.target.value);
                if (targetCourse && onSelectCourse) {
                  onSelectCourse(targetCourse);
                }
              }}
              className="bg-surface-highest border border-border-stroke text-white font-mono text-xs py-1 px-2.5 rounded focus:outline-none focus:border-brand-neon text-left"
              defaultValue={course.id}
            >
              {parentPlaylist.courses.map((otherCourse) => (
                <option key={otherCourse.id} value={otherCourse.id}>
                  {otherCourse.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div id="workspace-layout-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* LEFT COLUMN: Foldered Files Browser Sidebar (lg:col-span-4) */}
        <div id="syllabus-left-sidebar" className="lg:col-span-4 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-surface-container border border-border-stroke p-5 rounded select-none">
            <h4 className="text-white font-bold text-base mb-1 truncate">{course.name}</h4>
            <p className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Indexed File Course</p>
            
            <div className="flex items-center justify-between font-mono text-xs border-t border-border-stroke/60 pt-3 mt-4">
              <span className="text-text-secondary">Tracked completed:</span>
              <span className="text-brand-neon font-bold">{course.completionPercent}%</span>
            </div>
            
            {/* Fine metrics progress bar */}
            <div className="w-full h-1.5 bg-surface-base mt-2 rounded overflow-hidden">
              <div 
                className="h-full bg-brand-neon transition-all duration-300" 
                style={{ width: `${course.completionPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Collapsible Chapters List */}
          <div className="bg-surface-container border border-border-stroke p-4 rounded space-y-3">
            <span className="block font-mono text-[10px] uppercase text-text-secondary tracking-widest px-1">
              Chapter Directories
            </span>

            <div className="space-y-2">
              {course.chapters.map((chapter) => {
                const isExpanded = !!expandedChapters[chapter.id];
                
                // Count completed file in this chapter
                const completedInChapter = chapter.files.filter(f => isFileCompleted(f.path)).length;
                
                return (
                  <div key={chapter.id} className="border border-border-stroke/40 rounded overflow-hidden">
                    {/* Chapter Header Fold toggle trigger */}
                    <button
                      onClick={() => toggleChapterFold(chapter.id)}
                      className="w-full flex items-center justify-between p-3 bg-surface-highest/30 hover:bg-surface-highest/60 transition-colors font-mono text-xs font-semibold text-white cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-brand-neon" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                        <span className="truncate">{chapter.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary font-bold select-none shrink-0 bg-surface-base px-2 py-0.5 rounded border border-border-stroke">
                        {completedInChapter}/{chapter.files.length}
                      </span>
                    </button>

                    {/* Chapter Files elements list */}
                    {isExpanded && (
                      <div className="divide-y divide-border-stroke/30 bg-surface-base/10">
                        {chapter.files.map((file) => {
                          const isActive = activeFile?.id === file.id;
                          const completed = isFileCompleted(file.path);
                          
                          return (
                            <button
                              key={file.id}
                              onClick={() => handleSelectFile(file)}
                              className={`w-full flex items-center justify-between p-3 pl-6 font-mono text-[11px] transition-colors text-left cursor-pointer ${
                                isActive 
                                  ? "bg-brand-neon/10 border-l-2 border-brand-neon text-white" 
                                  : "text-text-secondary hover:bg-surface-highest hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate pr-2">
                                {getFileIcon(file.type)}
                                <span className={`truncate ${isActive ? 'font-bold' : ''}`}>
                                  {file.name}
                                </span>
                              </div>

                              {completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-brand-neon shrink-0 animate-pulse" />
                              ) : (
                                <span className="text-[8px] uppercase tracking-wider font-mono text-text-secondary opacity-40 shrink-0 select-none">
                                  {file.extension}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {course.chapters.length === 0 && (
                <div className="p-8 text-center font-mono text-xs text-text-secondary opacity-60">
                  Empty directories indexes. Ensure files sit inside 1 levels depth.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Main Player area (lg:col-span-8) */}
        <div id="media-viewport-panel" className="lg:col-span-8">
          {activeFile ? (
            <div className="bg-surface-container border border-border-stroke p-6 sm:p-8 rounded space-y-6">
              
              {/* Active content metadata */}
              <div id="active-file-titlebar" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-stroke/60 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1 select-none">
                    <span className="font-mono text-[9px] bg-surface-highest text-white border border-border-stroke px-2 py-0.5 rounded tracking-widest uppercase">
                      Local {activeFile.type} file
                    </span>
                    <span className="text-text-secondary text-xs font-mono">• {activeFile.path}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeFile.name}</h3>
                </div>

                {/* Mark complete controls trigger */}
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-tight font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer rounded ${
                    isFileCompleted(activeFile.path)
                      ? "bg-brand-neon text-black border-brand-neon font-extrabold hover:opacity-90"
                      : "bg-surface-highest/60 border-border-stroke text-white hover:border-brand-neon hover:text-brand-neon"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isFileCompleted(activeFile.path) ? "Completed (unmark)" : "Mark Complete"}
                </button>
              </div>

              {/* Dynamic Player Framework Rendering */}
              <div id="player-view-portal" className="min-h-[300px] relative">
                {loadingFile ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-base/40 rounded select-none">
                    <span className="w-8 h-8 rounded-full border-2 border-brand-neon border-t-transparent animate-spin mb-3"></span>
                    <p className="font-mono text-xs text-text-secondary">Scanning & decrypting local file indices...</p>
                  </div>
                ) : fileError ? (
                  <div className="p-8 bg-red-950/20 border border-red-900/40 rounded text-red-400 font-mono text-xs space-y-2">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="font-bold uppercase tracking-widest">Decryption Stream Mismatch</p>
                    <p>{fileError}</p>
                    <p className="text-[10px] opacity-70">
                      If using real folder pointers, ensure the authorization permissions have not expired on this browsing session. You can re-import the root folder to re-auth.
                    </p>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    {/* VIDEO CONTAINER */}
                    {activeFile.type === 'video' && (
                      <div className="rounded border border-border-stroke bg-black relative shadow-lg">
                        <VideoPlayer
                          file={activeFile}
                          onAutoComplete={() => {
                            if (!hasManuallyUnmarkedRef.current) {
                              onUpdateProgress(course.id, activeFile.path, true);
                            }
                          }}
                        />
                        <div className="p-3 bg-surface-highest/40 font-mono text-[10px] text-text-secondary text-center select-none border-t border-border-stroke/30">
                          Video auto-marked complete at <span className="text-brand-neon font-bold">90%</span> playback progression.
                        </div>
                      </div>
                    )}

                    {/* PDF CONTAINER */}
                    {activeFile.type === 'pdf' && (
                      <div className="flex flex-col gap-4">
                        {fileBlobUrl && !fileBlobUrl.startsWith("http") ? (
                          // Real PDF
                          <embed
                            src={fileBlobUrl}
                            type="application/pdf"
                            className="w-full h-[650px] rounded border border-border-stroke bg-surface-highest"
                          />
                        ) : (
                          // Fallback mockup PDF panel for simulator
                          <div className="border border-border-stroke bg-surface-highest/20 p-8 text-center rounded space-y-6">
                            <div className="max-w-md mx-auto space-y-3">
                              <FileText className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
                              <h4 className="text-white font-bold text-base">Standard Academic Syllabus PDF</h4>
                              <div className="text-xs text-text-secondary leading-relaxed bg-surface-container p-4 rounded border border-border-stroke select-none">
                                PDF viewer is sandboxed. Interactive contents and reference guide is mounted. You can read the notes below or mark it completed directly.
                              </div>
                            </div>

                            <div className="p-6 bg-surface-base border border-border-stroke rounded text-left font-sans leading-relaxed text-sm text-text-secondary space-y-4">
                              <h5 className="font-semibold text-white">Course Summary Notes (Page 1 of 4):</h5>
                              <p>The primary concern of networking layout constraints consists of managing electrical impedance matching, mitigating inter-pair capacitive crosstalk, and securing absolute signal parity under thermal stress ranges.</p>
                              <p>By defining clear chapters, modules remain structured locally on IndexedDB nodes without uploading unrequested student track hashes or answers onto remote datalakes.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TEXT & MD CONTAINER */}
                    {activeFile.type === 'text' && (
                      <div className="p-6 bg-surface-highest/10 border border-border-stroke rounded leading-relaxed text-sm text-text-secondary">
                        <div className="prose prose-invert max-w-none text-slate-100 markdown-body">
                          <ReactMarkdown>{fileText}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* LIVE HTML CONTAINER */}
                    {activeFile.type === 'html' && fileText && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-surface-highest/60 border border-border-stroke p-3 rounded select-none">
                          <span className="font-mono text-xs text-brand-neon flex items-center gap-1.5 font-bold">
                            <Globe className="w-4 h-4" /> Live rendered HTML Sandbox
                          </span>
                          <span className="font-mono text-[10px] text-text-secondary">Open inside an isolated iframe</span>
                        </div>
                        
                        <iframe
                          title="HTML Course Player"
                          sandbox="allow-scripts"
                          srcDoc={fileText}
                          className="w-full h-[450px] rounded bg-white border border-border-stroke shadow-lg"
                        />
                      </div>
                    )}

                    {/* CODE HIGHLIGHT CONTAINER */}
                    {activeFile.type === 'code' && fileText && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-surface-highest/45 border border-border-stroke p-2.5 px-4 rounded select-none">
                          <span className="font-mono text-xs text-white">Source code parsing viewport</span>
                          <span className="font-mono text-[10px] text-text-secondary uppercase">{activeFile.extension} mode</span>
                        </div>
                        {renderHighlightedCode(fileText)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Course Progression Control button */}
              <div id="course-completion-card" className="flex items-center justify-between p-4 bg-brand-neon/5 border border-brand-neon/20 rounded select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-neon/10 text-brand-neon rounded">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Study metrics integrated</p>
                    <p className="text-text-secondary text-[10px] font-mono leading-tight">State committed dynamically inside local folder catalog.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isFileCompleted(activeFile.path) ? 'bg-brand-neon' : 'bg-surface-highest border border-border-stroke'}`}></span>
                  <span className="font-mono text-xs text-white uppercase">
                    {isFileCompleted(activeFile.path) ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center font-mono text-xs text-text-secondary border border-border-stroke bg-surface-container select-none rounded">
              No files are active in the reader viewport. Expand a chapter directory folder on the left sidebar to select a study path component.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

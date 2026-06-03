import { FileType, TrackedFile, Chapter, Course, Playlist, FolderProgress } from "../types";

// Helper to determine file classification based on extension
export function getFileTypeAndExtension(fileName: string): { type: FileType; ext: string } | null {
  if (fileName.startsWith('.')) return null; // Ignore hidden files
  if (fileName === 'progress.json') return null; // Ignore progress file

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
    return { type: 'video', ext };
  }
  if (ext === 'pdf') {
    return { type: 'pdf', ext };
  }
  if (['txt', 'text', 'md'].includes(ext)) {
    return { type: 'text', ext };
  }
  if (['html', 'htm'].includes(ext)) {
    return { type: 'html', ext };
  }
  
  const codeExts = [
    'js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'cpp', 'c', 'h', 'hpp', 'java', 
    'go', 'json', 'sh', 'css', 'sql', 'yaml', 'yml', 'xml', 'ini', 'toml', 'sol',
    'cs', 'swift', 'kt', 'kts', 'php', 'rb', 'pl', 'pm', 'lua', 'r', 'dart',
    'gradle', 'bat', 'ps1', 'dockerfile', 'makefile', 'asm', 's'
  ];
  if (codeExts.includes(ext)) {
    return { type: 'code', ext };
  }

  return null; 
}

// Request read/write permissions for a folder handle
export async function verifyPermission(fileHandle: any, readWrite: boolean): Promise<boolean> {
  const options: any = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  
  try {
    if (fileHandle && typeof fileHandle.queryPermission === 'function') {
      if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
      }
      if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.warn("Permission verification skipped:", err);
  }
  return true; // Fallback if API checks are not fully supported by the browser
}

// Load progress.json from a course root directory handle
export async function loadProgressFromFolder(courseDirHandle: any): Promise<FolderProgress> {
  try {
    const hasPermission = await verifyPermission(courseDirHandle, false);
    if (!hasPermission) return {};

    const progressFileHandle = await courseDirHandle.getFileHandle("progress.json", { create: false });
    const file = await progressFileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as FolderProgress;
  } catch (err) {
    return {};
  }
}

// Save progress.json to a course root directory handle
export async function saveProgressToFolder(
  courseDirHandle: any,
  progress: FolderProgress
): Promise<boolean> {
  try {
    const hasPermission = await verifyPermission(courseDirHandle, true);
    if (!hasPermission) {
      console.warn("[Scanner] Read/Write permission denied to save progress.json");
      return false;
    }

    const progressFileHandle = await courseDirHandle.getFileHandle("progress.json", { create: true });
    const writable = await progressFileHandle.createWritable();
    await writable.write(JSON.stringify(progress, null, 2));
    await writable.close();
    return true;
  } catch (err) {
    console.error("[Scanner] Error writing progress.json to local filesystem:", err);
    return false;
  }
}

// Scan files within a Chapter directory
async function scanFilesOfChapter(
  chapterHandle: any,
  chapterName: string
): Promise<TrackedFile[]> {
  const files: TrackedFile[] = [];
  
  for await (const entry of (chapterHandle as any).values()) {
    if (entry.kind === 'file') {
      const fileInfo = getFileTypeAndExtension(entry.name);
      if (fileInfo) {
        const filePath = `${chapterName}/${entry.name}`;
        files.push({
          id: `${chapterName}_${entry.name}_` + Math.random().toString(36).substr(2, 5),
          name: entry.name,
          path: filePath,
          extension: fileInfo.ext,
          type: fileInfo.type,
          handle: entry as FileSystemFileHandle,
          completed: false
        });
      }
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}

// Scan recursive directory according to chosen Mode
export async function scanDirectoryStructure(
  rootHandle: any,
  mode: 'playlist' | 'course'
): Promise<Course[]> {
  const readGranted = await verifyPermission(rootHandle, false);
  if (!readGranted) {
    throw new Error("Local folder read permissions are required to scan courses.");
  }

  const coursesList: Course[] = [];

  if (mode === 'course') {
    const chapters: Chapter[] = [];
    
    for await (const entry of (rootHandle as any).values()) {
      if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
        const chapterHandle = entry as any;
        const files = await scanFilesOfChapter(chapterHandle, entry.name);
        
        if (files.length > 0) {
          chapters.push({
            id: `ch_${entry.name}_` + Math.random().toString(36).substr(2, 5),
            name: entry.name,
            path: entry.name,
            files,
            handle: chapterHandle
          });
        }
      }
    }

    chapters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const progress = await loadProgressFromFolder(rootHandle);

    let totalFilesCount = 0;
    let completedFilesCount = 0;

    const mappedChapters = chapters.map(ch => {
      const updatedFiles = ch.files.map(f => {
        totalFilesCount++;
        const isCompleted = !!progress[f.path];
        if (isCompleted) completedFilesCount++;
        return { ...f, completed: isCompleted };
      });
      return { ...ch, files: updatedFiles };
    });

    const completionPercent = totalFilesCount > 0 
      ? Math.round((completedFilesCount / totalFilesCount) * 100) 
      : 0;

    coursesList.push({
      id: rootHandle.name.replace(/\s+/g, '_') + "_" + Math.random().toString(36).substr(2, 4),
      name: rootHandle.name,
      path: "",
      chapters: mappedChapters,
      progress,
      handle: rootHandle,
      completionPercent
    });

  } else {
    for await (const courseEntry of (rootHandle as any).values()) {
      if (courseEntry.kind === 'directory' && !courseEntry.name.startsWith('.')) {
        const courseHandle = courseEntry as any;
        const chapters: Chapter[] = [];

        for await (const chapterEntry of (courseHandle as any).values()) {
          if (chapterEntry.kind === 'directory' && !chapterEntry.name.startsWith('.')) {
            const chapterHandle = chapterEntry as any;
            const files = await scanFilesOfChapter(chapterHandle, chapterEntry.name);

            if (files.length > 0) {
              chapters.push({
                id: `ch_${courseEntry.name}_${chapterEntry.name}`,
                name: chapterEntry.name,
                path: chapterEntry.name,
                files,
                handle: chapterHandle
              });
            }
          }
        }

        if (chapters.length > 0) {
          chapters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

          const progress = await loadProgressFromFolder(courseHandle);

          let totalFilesCount = 0;
          let completedFilesCount = 0;

          const mappedChapters = chapters.map(ch => {
            const updatedFiles = ch.files.map(f => {
              totalFilesCount++;
              const isCompleted = !!progress[f.path];
              if (isCompleted) completedFilesCount++;
              return { ...f, completed: isCompleted };
            });
            return { ...ch, files: updatedFiles };
          });

          const completionPercent = totalFilesCount > 0 
            ? Math.round((completedFilesCount / totalFilesCount) * 100) 
            : 0;

          coursesList.push({
            id: courseEntry.name.replace(/\s+/g, '_') + "_" + Math.random().toString(36).substr(2, 4),
            name: courseEntry.name,
            path: courseEntry.name,
            chapters: mappedChapters,
            progress,
            handle: courseHandle,
            completionPercent
          });
        }
      }
    }

    coursesList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  return coursesList;
}

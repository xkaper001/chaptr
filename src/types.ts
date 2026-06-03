export type FileType = 'video' | 'pdf' | 'text' | 'html' | 'code';

export interface TrackedFile {
  id: string; // unique identifier
  name: string;
  path: string; // e.g., "CH01_the_fundamentals/1. Intro.mp4"
  extension: string;
  type: FileType;
  fileObject?: File; // Loaded File object
  handle: FileSystemFileHandle | null; // For loading file content on-demand
  completed: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  path: string; // e.g., "CH01_the_fundamentals"
  files: TrackedFile[];
  handle: FileSystemDirectoryHandle | null;
}

export interface Course {
  id: string;
  name: string;
  path: string; // Course folder relative path from playlist, or "" if course mode
  chapters: Chapter[];
  progress: FolderProgress;
  handle: FileSystemDirectoryHandle | null; // The course directory handle
  completionPercent: number;
}

export interface Playlist {
  id: string;
  name: string;
  courses: Course[];
  mode: 'playlist' | 'course';
  handle: FileSystemDirectoryHandle | null; // The root directory handle
}

export interface FolderProgress {
  __lastOpened?: string; // Path of the last opened file
  [filePath: string]: boolean | string | undefined; // True if completed
}

export interface RecentDirectory {
  id: string;
  name: string;
  mode: 'playlist' | 'course';
  timestamp: number;
  courseCount: number;
  chapterCount: number;
  fileCount: number;
}

export interface DownloadedAsset {
  id: string;
  title: string;
  size: string;
  encryptionMethod: string;
  decryptedInRam: boolean;
}

export interface AnalyticsRecord {
  date: string;
  xpGained: number;
  lessonsCompleted: number;
  proofsGenerated: number;
}

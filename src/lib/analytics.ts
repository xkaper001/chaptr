import posthog from 'posthog-js';

export function initAnalytics() {
  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // we fire page_viewed manually
    capture_pageleave: true,
  });
}

export const analytics = {
  pageViewed(view: string) {
    posthog.capture('page_viewed', { view });
  },
  courseOpened(params: { courseId: string; courseName: string; playlistName?: string }) {
    posthog.capture('course_opened', params);
  },
  playlistOpened(params: { playlistId: string; playlistName: string; courseCount: number }) {
    posthog.capture('playlist_opened', params);
  },
  lessonCompleted(params: { filePath: string; fileType: string; courseName: string; courseId: string }) {
    posthog.capture('lesson_completed', params);
  },
  lessonUncompleted(params: { filePath: string; courseId: string }) {
    posthog.capture('lesson_uncompleted', params);
  },
  studyHeartbeat(params: { courseId: string; courseName: string; totalSecondsToday: number }) {
    posthog.capture('study_heartbeat', params);
  },
};

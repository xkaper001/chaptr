import React from "react";
import { BarChart3, Award, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { AnalyticsRecord } from "../types";

interface AnalyticsViewProps {
  timeSpentSeconds: number;
  streakDays: number;
  completedCount: number;
}

export default function AnalyticsView({ timeSpentSeconds, streakDays, completedCount }: AnalyticsViewProps) {
  const totalCalculatedLessons = completedCount > 0 ? Math.max(completedCount + 2, 5) : 5;

  // Format time spent into a human readable string
  const formatTimeSpent = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
    return `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`;
  };

  // Dynamic activity records over the last 7 days ending today
  const activityData: AnalyticsRecord[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isToday = i === 6;
    return {
      date: dateStr,
      timeSpentSeconds: isToday ? timeSpentSeconds : 0,
      lessonsCompleted: isToday ? completedCount : 0,
      filesIndexed: isToday ? completedCount : 0
    };
  });

  const hoursDecimal = (timeSpentSeconds / 3600).toFixed(2);

  return (
    <div id="analytics-view-root" className="px-6 md:px-12 py-10 max-w-7xl mx-auto space-y-10 selection:bg-brand-neon selection:text-background">
      {/* Title */}
      <div id="analytics-header" className="border-b border-border-stroke pb-5 select-none">
        <h3 className="text-2xl font-bold text-white mb-1">Analytical Metrics</h3>
        <p className="font-mono text-xs text-text-secondary opacity-70">
          Local-first learning stats & milestones
        </p>
      </div>

      {/* Grid of Key Performance Counters */}
      <div id="analytics-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {/* Metric 1 */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded">
          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-[10px] text-text-secondary uppercase">Active Study Time</span>
            <Award className="w-5 h-5 text-brand-neon" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono leading-none">{formatTimeSpent(timeSpentSeconds)}</p>
          <p className="text-[11px] text-text-secondary/60 mt-2 font-mono">{hoursDecimal} hours logged locally</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded">
          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-[10px] text-text-secondary uppercase">Study Streak</span>
            <Calendar className="w-5 h-5 text-brand-neon animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono leading-none">{streakDays} Days</p>
          <p className="text-[11px] text-text-secondary/60 mt-2 font-mono">Consecutive days studied</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded">
          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-[10px] text-text-secondary uppercase">Syllabi Completed</span>
            <ShieldCheck className="w-5 h-5 text-brand-neon" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono leading-none">{completedCount}</p>
          <p className="text-[11px] text-text-secondary/60 mt-2 font-mono">Out of {totalCalculatedLessons} loaded steps</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded">
          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-[10px] text-text-secondary uppercase">Storage Mode</span>
            <ShieldCheck className="w-5 h-5 text-brand-neon" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono leading-none">
            Local Only
          </p>
          <p className="text-[11px] text-text-secondary/60 mt-2 font-mono">100% private browser storage</p>
        </div>
      </div>

      {/* Grid: SVG Charts Area + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: 7-day performance chart index (lg:col-span-7) */}
        <div id="analytics-chart-box" className="lg:col-span-7 bg-surface-container border border-border-stroke p-6 rounded space-y-6 select-none">
          <div className="flex justify-between items-center border-b border-border-stroke pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-brand-neon" />
              <h4 className="text-white font-mono text-xs uppercase tracking-wider font-semibold">
                Daily Study Duration (Minutes)
              </h4>
            </div>
            <span className="font-code text-[10px] text-text-secondary">Unit: Minutes</span>
          </div>

          {/* Simple custom responsive bar charts using Tailwind block alignment */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4">
            {activityData.map((data, idx) => {
              const maxMinutes = 60; // Max out height calculation at 60 mins for styling scale
              const minutes = data.timeSpentSeconds / 60;
              const barHeightPercent = Math.min((minutes / maxMinutes) * 100, 100);
              const isActive = idx === activityData.length - 1;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface-highest text-white font-mono text-[10px] py-1 px-1.5 border border-border-stroke mb-2 rounded shadow leading-none pointer-events-none">
                    {minutes.toFixed(1)} mins
                  </span>
                  
                  <div className="w-full bg-surface-base rounded-none h-[180px] flex items-end overflow-hidden border border-border-stroke/30">
                    <div
                      className={`w-full transition-all duration-500 rounded-none ${
                        isActive ? 'bg-brand-neon shadow-[0_0_12px_rgba(188,245,64,0.4)]' : 'bg-text-secondary opacity-60'
                      }`}
                      style={{ height: `${data.timeSpentSeconds > 0 ? barHeightPercent : 4}%` }}
                    ></div>
                  </div>

                  <span className="font-mono text-[10px] text-text-secondary mt-3 uppercase tracking-tight">
                    {data.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Local Achievements (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-surface-container border border-border-stroke p-6 rounded flex flex-col justify-between">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-border-stroke pb-3 select-none">
              <Sparkles className="w-4.5 h-4.5 text-brand-neon" />
              <h4 className="text-white font-mono text-xs uppercase tracking-wider font-semibold">
                Local Milestones
              </h4>
            </div>

            <p className="text-text-secondary text-xs leading-relaxed select-none">
              Achievements unlocked locally based on your active study sessions.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Milestone 1 */}
              <div className="flex items-center gap-3 p-3 bg-surface-base border border-border-stroke/50 rounded">
                <Award className={`w-5 h-5 ${timeSpentSeconds >= 300 ? "text-brand-neon" : "text-text-secondary opacity-45"}`} />
                <div>
                  <p className={`font-semibold ${timeSpentSeconds >= 300 ? "text-white" : "text-text-secondary/50"}`}>Novice Explorer</p>
                  <p className="text-[10px] text-text-secondary/60">Study for 5 minutes actively</p>
                </div>
                {timeSpentSeconds >= 300 && <span className="ml-auto text-[10px] text-brand-neon font-bold uppercase">Unlocked</span>}
              </div>

              {/* Milestone 2 */}
              <div className="flex items-center gap-3 p-3 bg-surface-base border border-border-stroke/50 rounded">
                <Calendar className={`w-5 h-5 ${streakDays >= 2 ? "text-brand-neon" : "text-text-secondary opacity-45"}`} />
                <div>
                  <p className={`font-semibold ${streakDays >= 2 ? "text-white" : "text-text-secondary/50"}`}>Streak Starter</p>
                  <p className="text-[10px] text-text-secondary/60">Maintain a 2-day learning streak</p>
                </div>
                {streakDays >= 2 && <span className="ml-auto text-[10px] text-brand-neon font-bold uppercase">Unlocked</span>}
              </div>

              {/* Milestone 3 */}
              <div className="flex items-center gap-3 p-3 bg-surface-base border border-border-stroke/50 rounded">
                <ShieldCheck className={`w-5 h-5 ${completedCount > 0 ? "text-brand-neon" : "text-text-secondary opacity-45"}`} />
                <div>
                  <p className={`font-semibold ${completedCount > 0 ? "text-white" : "text-text-secondary/50"}`}>First Milestone</p>
                  <p className="text-[10px] text-text-secondary/60">Complete your first syllabus file</p>
                </div>
                {completedCount > 0 && <span className="ml-auto text-[10px] text-brand-neon font-bold uppercase">Unlocked</span>}
              </div>
            </div>
          </div>

          <div className="border-t border-border-stroke/50 pt-3 mt-6 select-none">
            <p className="text-[10px] text-text-secondary/50 font-mono tracking-tight text-center leading-relaxed">
              Achievements and session updates are committed instantly to your browser's local sandbox.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

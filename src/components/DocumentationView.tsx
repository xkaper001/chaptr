import React from "react";
import { BookOpen, Shield, Cpu, Lock, Terminal, FileText, Check } from "lucide-react";

export default function DocumentationView() {
  return (
    <div id="documentation-view-root" className="px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-10 select-none">
      {/* Header */}
      <div id="docs-header" className="border-b border-border-stroke pb-5">
        <h3 className="text-2xl font-bold text-white mb-1">Technical Blueprints</h3>
        <p className="font-mono text-xs text-text-secondary opacity-70">
          Underlying architecture specifications of the Chaptr local-first learning engine
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        
        {/* Architectural Overview - Main panels */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Subsection 1 */}
          <section className="bg-surface-container border border-border-stroke p-6 rounded space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-neon" />
              <h4 className="text-white font-bold text-lg">Local-First Privacy Architecture</h4>
            </div>
            
            <p className="text-text-secondary text-sm leading-relaxed">
              Standard study dashboards track user progress on remote corporate database instances, aggregating course views and sellable tracking metrics. Chaptr reverses this model: **it isolates your profile and course data locally inside sandboxed browser storage.**
            </p>

            <p className="text-text-secondary text-sm leading-relaxed">
              When a course folder or playlist is indexed, Chaptr builds a localized syllabus block map. Completing a slide or video updates your local progress logs directly. These actions run 100% offline, meaning your study habits, quiz answers, and lesson completions are never shared with external tracking hosts.
            </p>
          </section>

          {/* Subsection 2 */}
          <section className="bg-surface-container border border-border-stroke p-6 rounded space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-neon" />
              <h4 className="text-white font-bold text-lg">Secure Local Serialization</h4>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed">
              All coursework progress, custom lesson indices, and study history logs are saved as plain JSON structures directly under your selected local course directory using standard system storage interfaces.
            </p>

            <blockquote className="border-l-2 border-brand-neon pl-4 py-1 text-xs font-mono text-brand-neon bg-brand-neon/5 rounded-r">
              Progress structure: targetCourse.progress = {'{'} [filePath]: true {'}'}
            </blockquote>

            <p className="text-text-secondary text-sm leading-relaxed">
              The application reads and writes progress state locally using the browser's native File System Access API. If direct folder access is not supported by your browser, Chaptr seamlessly falls back to a sandbox backup located in browser-isolated IndexedDB storage.
            </p>
          </section>

          {/* Subsection 3 */}
          <section className="bg-surface-container border border-border-stroke p-6 rounded space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-brand-neon" />
              <h4 className="text-white font-bold text-lg">Offline Session Persistence</h4>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed font-sans">
              All session states, XP metrics, and current lesson views are kept in-memory and synchronized to browser local storage. These systems verify the integrity of the active curriculum locally using simple client-side checks:
            </p>

            <ul className="space-y-2 font-mono text-xs text-text-secondary pl-4 list-disc">
              <li>Lessons marked complete are mapped directly to file paths</li>
              <li>Calculations for course progress percentages are run in real-time</li>
              <li>Verification happens strictly inside the isolated browser runtime loops</li>
            </ul>
          </section>

        </div>

        {/* Right Sidebar: Tech Specifications Specs */}
        <div className="space-y-6">
          <div className="bg-surface-container border border-border-stroke p-5 rounded space-y-4">
            <h5 className="font-mono text-xs uppercase text-white font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-neon" /> System Requirements
            </h5>

            <div className="divide-y divide-border-stroke/60 font-mono text-[11px] text-text-secondary">
              <div className="py-2.5 flex justify-between">
                <span>Memory usage:</span> <span className="text-white font-semibold">&lt; 15 MB</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>API Engine:</span> <span className="text-white font-semibold">Web File System API</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Persistence:</span> <span className="text-white font-semibold">IndexedDB & LocalStorage</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Local Database:</span> <span className="text-brand-neon font-bold">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-border-stroke p-5 rounded space-y-4">
            <h5 className="font-mono text-xs uppercase text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-neon" /> File Manifest
            </h5>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              When saving course progress, it is serialized directly as a local `progress.json` config inside the directory:
            </p>

            <div className="p-3 bg-surface-base rounded font-mono text-[10px] text-green-400 border border-border-stroke text-left">
              {"{"}<br />
              &nbsp;&nbsp;"__lastOpened": "intro.mp4",<br />
              &nbsp;&nbsp;"lessons": ["intro.mp4", "chapter1.pdf"],<br />
              &nbsp;&nbsp;"completed_count": 2,<br />
              &nbsp;&nbsp;"local_integrity": true<br />
              {"}"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { BookOpen, Shield, Cpu, Lock, Terminal, FileText, Check } from "lucide-react";

export default function DocumentationView() {
  return (
    <div id="documentation-view-root" className="px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-10 select-none">
      {/* Header */}
      <div id="docs-header" className="border-b border-border-stroke pb-5">
        <h3 className="text-2xl font-bold text-white mb-1">Technical Blueprints</h3>
        <p className="font-mono text-xs text-text-secondary opacity-70">
          Underlying cryptographic specifications of the Chaptr learning engine
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
              <h4 className="text-white font-bold text-lg">Zero-Knowledge Learning Paths</h4>
            </div>
            
            <p className="text-text-secondary text-sm leading-relaxed">
              Standard study dashboards track user progress on corporate database instances, aggregating course views and sellable tracking metrics. Chaptr reverses this model: **it isolates your profiles locally inside sandboxed storage.**
            </p>

            <p className="text-text-secondary text-sm leading-relaxed">
              When a course or playlist is imported, Chaptr builds a localized syllabus block map. Completing a slide or challenge triggers the creation of a **Zero-Knowledge membership proof**. These mathematical claims verify that you have evaluated the curriculum slides correctly without requiring you to share telemetry, user profiles, or raw answers to external hosts.
            </p>
          </section>

          {/* Subsection 2 */}
          <section className="bg-surface-container border border-border-stroke p-6 rounded space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-neon" />
              <h4 className="text-white font-bold text-lg">AES-GCM Authenticated Storage</h4>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed">
              All coursework metadata, custom lesson indices, and study history logs are locked under 256-bit Advanced Encryption Standard using Galois/Counter Mode (AES-256-GCM).
            </p>

            <blockquote className="border-l-2 border-brand-neon pl-4 py-1 text-xs font-mono text-brand-neon bg-brand-neon/5 rounded-r">
              C(x) = E_k(Counter) XOR Plaintext, Tag = GaloisFieldMultiplication(Ciphertext, H)
            </blockquote>

            <p className="text-text-secondary text-sm leading-relaxed">
              Galois multiplication produces an automatic 128-bit authentication tag, securing course files from local manipulation or payload injection. Decrypted keys reside strictly inside volatility ranges (browser RAM space) and are destroyed instantly when the browser session terminates or logging out occurs.
            </p>
          </section>

          {/* Subsection 3 */}
          <section className="bg-surface-container border border-border-stroke p-6 rounded space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-brand-neon" />
              <h4 className="text-white font-bold text-lg">Local Proof-of-Study Constraints</h4>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed font-sans">
              ZKP challenges are formulated via finite polynomial arithmetic rings. When you verify a puzzle answer locally, Chaptr runs standard Fiat-Shamir hashing equations:
            </p>

            <ul className="space-y-2 font-mono text-xs text-text-secondary pl-4 list-disc">
              <li>Commitment generated modulo prime p</li>
              <li>Challenge hashes derived locally via SHA-256</li>
              <li>Signature computed inside isolated browser runtime loops</li>
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
                <span>Crypto Engines:</span> <span className="text-white font-semibold">Web Crypto API</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Persistence:</span> <span className="text-white font-semibold">IndexedDB</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>ZK Runtime:</span> <span className="text-brand-neon font-bold">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-border-stroke p-5 rounded space-y-4">
            <h5 className="font-mono text-xs uppercase text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-neon" /> File Manifest
            </h5>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              When exporting a course playlist from Chaptr, the output is bundled into a single `.chp` cryptographically-signed JSON package:
            </p>

            <div className="p-3 bg-surface-base rounded font-mono text-[10px] text-green-400 border border-border-stroke text-left">
              {"{"}<br />
              &nbsp;&nbsp;"meta_fingerprint": "0xc8f9",<br />
              &nbsp;&nbsp;"cryptographic_tag": "aes-gcm",<br />
              &nbsp;&nbsp;"proven_lessons": 12,<br />
              &nbsp;&nbsp;"modules_integrity": true<br />
              {"}"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

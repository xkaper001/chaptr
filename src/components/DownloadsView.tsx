import React, { useState } from "react";
import { Download, Server, Key, Eye, EyeOff, Trash2, Cpu, RefreshCw, AlertCircle } from "lucide-react";
import { DownloadedAsset } from "../types";

export default function DownloadsView() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [assets, setAssets] = useState<DownloadedAsset[]>([
    { id: "dl-1", title: "Advanced Cryptography Lecture Pack (VOD)", size: "450.4 MB", encryptionMethod: "AES-256-GCM / Galois ring", decryptedInRam: true },
    { id: "dl-2", title: "Fullstack Rust compiler toolchain outline", size: "124.8 MB", encryptionMethod: "AES-256-GCM / Rust native", decryptedInRam: false },
    { id: "dl-3", title: "Ethical Hacking Lab attack footprints & hashes", size: "84.2 MB", encryptionMethod: "ChaCha20-Poly1305", decryptedInRam: false },
    { id: "dl-4", title: "Go Concurrency runtime scheduling diagrams", size: "18.3 MB", encryptionMethod: "AES-128-CBC", decryptedInRam: false },
  ]);

  const [purging, setPurging] = useState(false);

  // Calculate stats
  const usedMB = assets.reduce((acc, curr) => acc + parseFloat(curr.size), 0);
  const totalLimitMB = 2048; // 2 GB limit inside local browser IndexedDB
  const percentUsed = Math.min((usedMB / totalLimitMB) * 100, 100);

  const toggleDecrypt = (id: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === id) {
        return { ...asset, decryptedInRam: !asset.decryptedInRam };
      }
      return asset;
    }));
  };

  const handlePurge = () => {
    if (!window.confirm("Are you sure you want to purge all local sandbox cache? This deletes offline cached lessons and forces a re-sync.")) {
      return;
    }

    setPurging(true);
    setTimeout(() => {
      setAssets([]);
      setPurging(false);
    }, 1500);
  };

  const restoreDEFAULTS = () => {
    setAssets([
      { id: "dl-1", title: "Advanced Cryptography Lecture Pack (VOD)", size: "450.4 MB", encryptionMethod: "AES-256-GCM / Galois ring", decryptedInRam: true },
      { id: "dl-2", title: "Fullstack Rust compiler toolchain outline", size: "124.8 MB", encryptionMethod: "AES-256-GCM / Rust native", decryptedInRam: false },
      { id: "dl-3", title: "Ethical Hacking Lab attack footprints & hashes", size: "84.2 MB", encryptionMethod: "ChaCha20-Poly1305", decryptedInRam: false },
      { id: "dl-4", title: "Go Concurrency runtime scheduling diagrams", size: "18.3 MB", encryptionMethod: "AES-128-CBC", decryptedInRam: false },
    ]);
  };

  return (
    <div id="downloads-view-root" className="px-6 md:px-12 py-10 max-w-7xl mx-auto space-y-10 select-none">
      {/* Title */}
      <div id="downloads-header" className="border-b border-border-stroke pb-5">
        <h3 className="text-2xl font-bold text-white mb-1">Local Index Cache</h3>
        <p className="font-mono text-xs text-text-secondary opacity-70">
          Decrypt, purge, and measure isolated storage volumes
        </p>
      </div>

      {/* Stats bar */}
      <div id="downloads-stats-box" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Memory used block */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-neon" />
              <span className="font-mono text-xs uppercase text-white font-semibold">IndexedDB Storage Allotment</span>
            </div>
            <span className="font-mono text-xs text-brand-neon font-bold">
              {usedMB.toFixed(1)} MB / {totalLimitMB} MB ({percentUsed.toFixed(1)}%)
            </span>
          </div>

          <div className="w-full h-2 bg-surface-base rounded overflow-hidden">
            <div
              className="h-full bg-brand-neon transition-all duration-300 shadow-[0_0_8px_rgba(188,245,64,0.3)]"
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-text-secondary opacity-70 leading-relaxed">
            Local browser isolation allocates space dynamically inside standard temporary sandboxes. Purging storage deletes local offline segments but does not impact study metrics linked to your key pair.
          </p>
        </div>

        {/* Crypto parameters box */}
        <div className="bg-surface-container border border-border-stroke p-5 rounded flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-neon" />
              <span className="font-mono text-xs uppercase text-white font-semibold">Static Keys</span>
            </div>
            <p className="font-mono text-[10px] text-text-secondary leading-none mt-1">active algorithm:</p>
            <p className="font-mono text-xs font-bold text-white">AES-256-GCM / Galois Field</p>
          </div>

          {assets.length > 0 ? (
            <button
              onClick={handlePurge}
              disabled={purging}
              className="w-full py-2 bg-red-950/30 hover:bg-red-950/70 border border-red-900/50 text-red-400 font-bold font-mono text-[10px] rounded uppercase mt-4 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {purging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Purging cache...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Purge Local Cache
                </>
              )}
            </button>
          ) : (
            <button
              onClick={restoreDEFAULTS}
              className="w-full py-2 bg-brand-neon text-black font-bold font-mono text-[10px] rounded uppercase mt-4 transition-colors cursor-pointer"
            >
              Restore Cache Outlines
            </button>
          )}
        </div>

      </div>

      {/* Downloaded items list */}
      <div id="downloads-list-box" className="bg-surface-container border border-border-stroke rounded overflow-hidden">
        <div className="p-4 bg-surface-highest/40 border-b border-border-stroke flex justify-between items-center font-mono text-xs uppercase text-white font-semibold">
          <span>Module Title</span>
          <div className="flex gap-16 pr-4">
            <span className="hidden sm:inline">Allocated Size</span>
            <span>Security Action</span>
          </div>
        </div>

        <div className="divide-y divide-border-stroke/60">
          {assets.map((asset) => (
            <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-highest/20 transition-all">
              <div className="space-y-1 text-left">
                <p className="text-white text-sm font-semibold">{asset.title}</p>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-secondary/70">
                  <span className="bg-surface-base px-2 py-0.5 rounded border border-border-stroke">
                    {asset.encryptionMethod}
                  </span>
                  {asset.decryptedInRam && (
                    <span className="text-brand-neon font-bold flex items-center gap-1 leading-none uppercase">
                      <Cpu className="w-3 h-3 text-brand-neon" /> Decrypted in RAM
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-12 pr-4 font-mono text-xs text-white">
                <span className="font-mono text-text-secondary font-bold shrink-0">{asset.size}</span>
                
                <button
                  onClick={() => toggleDecrypt(asset.id)}
                  className={`px-4 py-2 font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    asset.decryptedInRam
                      ? "bg-brand-neon/10 border-brand-neon text-brand-neon hover:bg-brand-neon/20"
                      : "bg-surface-base border-border-stroke text-text-secondary hover:text-white"
                  }`}
                >
                  {asset.decryptedInRam ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Re-Encrypt Unit
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Decrypt in RAM
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {assets.length === 0 && !purging && (
            <div className="p-12 text-center text-text-secondary text-xs font-mono space-y-4">
              <AlertCircle className="w-10 h-10 text-yellow-500/50 mx-auto" />
              <p>IndexedDB cache purged successfully. Active directory modules are un-allocated.</p>
              <button
                onClick={restoreDEFAULTS}
                className="px-4 py-2 bg-surface-highest hover:bg-white hover:text-black border border-border-stroke font-mono text-white text-xs transition-colors rounded cursor-pointer"
              >
                Reconstruct Base Payload Cache
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

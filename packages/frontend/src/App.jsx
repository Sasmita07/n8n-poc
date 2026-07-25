import React from 'react';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto px-4 py-8">
      {/* Header navbar */}
      <header className="navbar bg-[#11131f] border border-white/5 rounded-2xl px-4 py-3 mb-8 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚡</div>
          <div>
            <h1 className="text-xl font-bold font-title text-white">n8n Automation Gateway</h1>
            <p className="text-[10px] text-slate-400 font-medium">Control Panel Boilerplate</p>
          </div>
        </div>
        <div className="badge badge-success py-3.5 px-3.5 font-extrabold text-[10px] uppercase tracking-wider text-success-content">
          Vite + React 19 + daisyUI
        </div>
      </header>

      {/* Main Placeholder Container */}
      <main className="flex-grow flex flex-col justify-center items-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#11131f]/20">
        <div className="max-w-md px-4">
          <h2 className="text-2xl font-extrabold text-white mb-2">Frontend Boilerplate Ready</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            This workspace package has been configured with React 19, Tailwind CSS v4, and daisyUI. The backend proxies and workspaces are fully linked.
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn btn-primary" onClick={() => alert('React 19 Interactive Button!')}>
              Test Action
            </button>
            <a href="/health" target="_blank" rel="noreferrer" className="btn btn-neutral">
              Check Gateway Health
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pt-8 mt-12 border-t border-white/10 text-[10px] text-slate-500">
        &copy; 2026 n8n Orchestrator Monorepo. All rights reserved.
      </footer>
    </div>
  );
}

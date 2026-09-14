import React, { useState } from 'react';
import { WorkflowForm } from './components/WorkflowForm';
import { WorkflowList } from './components/WorkflowList';
import { ExecutionLogs } from './components/ExecutionLogs';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('create');

  const handleWorkflowCreated = () => {
    // Trigger refresh of workflow list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1e] text-white">
      {/* Header navbar */}
      <header className="navbar bg-[#11131f] border border-white/5 px-4 py-3 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚡</div>
          <div>
            <h1 className="text-xl font-bold text-white">n8n Automation Gateway</h1>
            <p className="text-[10px] text-slate-400 font-medium">Phase 1: Real Workflows</p>
          </div>
        </div>
        <div className="badge badge-info py-3.5 px-3.5 font-extrabold text-[10px] uppercase tracking-wider">
          🚀 Production Ready
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {/* Tab Navigation */}
        <div className="tabs tabs-bordered mb-8 bg-base-200/50 rounded-lg p-2">
          <button
            className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ✨ Create Workflow
          </button>
          <button
            className={`tab ${activeTab === 'list' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Workflows
          </button>
          <button
            className={`tab ${activeTab === 'logs' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📊 Execution Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Workflow */}
          {activeTab === 'create' && (
            <div className="lg:col-span-2">
              <WorkflowForm onWorkflowCreated={handleWorkflowCreated} />
            </div>
          )}

          {/* Workflows List */}
          {activeTab === 'list' && (
            <div className="lg:col-span-2">
              <WorkflowList refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Execution Logs */}
          {activeTab === 'logs' && (
            <div className="lg:col-span-2">
              <ExecutionLogs />
            </div>
          )}
        </div>

        {/* Quick Stats (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="card bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/20">
            <div className="card-body">
              <h3 className="card-title text-sm">Webhooks</h3>
              <p className="text-2xl font-bold text-blue-400">Ready</p>
              <p className="text-xs text-slate-400">Real-time triggers enabled</p>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/20">
            <div className="card-body">
              <h3 className="card-title text-sm">Email Notifications</h3>
              <p className="text-2xl font-bold text-green-400">Ready</p>
              <p className="text-xs text-slate-400">n8n integrated</p>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/20">
            <div className="card-body">
              <h3 className="card-title text-sm">Scheduled Tasks</h3>
              <p className="text-2xl font-bold text-purple-400">Ready</p>
              <p className="text-xs text-slate-400">Cron-based execution</p>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-100">
            📖 <strong>Full API documentation</strong> available at{' '}
            <a href="http://localhost:3000/docs" target="_blank" rel="noreferrer" className="link link-warning">
              Swagger UI
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#11131f] border-t border-white/5 text-center py-6 px-4 text-[10px] text-slate-500">
        <p>&copy; 2026 n8n Orchestrator Monorepo | Phase 1: Real n8n Workflows | All rights reserved.</p>
      </footer>
    </div>
  );
}

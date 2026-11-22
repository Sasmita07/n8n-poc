import React, { useEffect, useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';

export function ExecutionLogs() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { getStates } = useWorkflowApi();

  const fetchStates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStates();
      const nextStates = Array.isArray(data.logs)
        ? data.logs
        : Array.isArray(data.result)
          ? data.result
          : Object.values(data.states || {});

      setStates(nextStates);
    } catch (err) {
      setError(`Failed to fetch execution logs: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    if (!autoRefresh) return;

    const interval = setInterval(fetchStates, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'badge-success';
      case 'error':
      case 'failed':
        return 'badge-error';
      case 'running':
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading && states.length === 0) {
    return (
      <div className="card app-card">
        <div className="card-body">
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card app-card">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Execution Logs</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline'}`}
            >
              {autoRefresh ? '🔴 Auto-refresh ON' : '⚪ Auto-refresh OFF'}
            </button>
            <button onClick={fetchStates} className="btn btn-sm btn-outline" disabled={loading}>
              🔄
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}

        {states.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No execution logs yet. Run a workflow to see logs here.</p>
        ) : (
          <div className="space-y-3">
            {states.map((state, index) => (
              <div
                key={state.id || index}
                className="app-panel cursor-pointer p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
                onClick={() => setExpandedId(expandedId === (state.id || index) ? null : state.id || index)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="font-semibold text-white">
                        {state.workflowName || state.workflowId || state.source || 'Workflow'}
                      </span>
                      <span className={`badge badge-sm ${getStatusBadge(state.status)}`}>
                        {state.status || (state.finished ? 'success' : 'running')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Execution {state.id || '—'} · {formatDate(state.startedAt || state.createdAt || state.timestamp)}
                    </p>
                  </div>
                  <span className="text-xl">
                    {expandedId === (state.id || index) ? '▼' : '▶'}
                  </span>
                </div>

                {expandedId === (state.id || index) && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="app-panel max-h-64 overflow-x-auto overflow-y-auto p-2 font-mono text-xs text-slate-300">
                      <pre>{JSON.stringify(state.data || state, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

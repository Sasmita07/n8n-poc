import React, { useEffect, useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';
import { isSystemWorkflow } from '../lib/utils';

export function WorkflowList({ refreshTrigger, onRequestApproval }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activatingId, setActivatingId] = useState(null);

  const { listWorkflows, activateWorkflow } = useWorkflowApi();

  const fetchWorkflows = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listWorkflows();
      const result = data.result;
      setWorkflows(
        Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [],
      );
    } catch (err) {
      setError(`Failed to fetch workflows: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [refreshTrigger]);

  const handleActivate = async (workflowId) => {
    setActivatingId(workflowId);
    try {
      await activateWorkflow(workflowId);
      // Refresh the list
      fetchWorkflows();
    } catch (err) {
      setError(`Failed to activate workflow: ${err.message}`);
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
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
          <div className="workflow-list-header mb-4">
          <div>
            <h2 className="card-title">Workflows</h2>
            <p className="mt-1 text-sm text-slate-400">
              Integration workflows are listed for status but are not approval targets. Approval decisions are dispatched as events; they do not pause or resume a workflow.
            </p>
          </div>
          <button onClick={fetchWorkflows} className="btn btn-sm btn-outline shrink-0 border-white/20 text-slate-200 hover:bg-white/10">
            🔄 Refresh
          </button>
        </div>

        {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}

        {workflows.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No workflows yet. Create one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table app-table w-full">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[30%]" />
                <col className="w-[18%]" />
                <col className="w-[28%]" />
              </colgroup>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover">
                    <td className="break-words font-semibold">{workflow.name}</td>
                    <td className="break-all font-mono text-sm text-slate-400">{workflow.id}</td>
                    <td>
                      <span className={`badge ${workflow.active ? 'badge-success' : 'badge-warning'}`}>
                        {workflow.active ? '✅ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="workflow-actions min-h-10">
                      {!workflow.active && (
                        <button
                          onClick={() => handleActivate(workflow.id)}
                          disabled={activatingId === workflow.id}
                          className="btn btn-sm btn-primary workflow-action-button"
                        >
                          {activatingId === workflow.id ? '⏳' : '▶'} Activate
                        </button>
                      )}
                      {isSystemWorkflow(workflow) ? (
                        <span className="badge app-integration-badge">Integration workflow</span>
                      ) : !workflow.active ? null : onRequestApproval ? (
                        <button
                          onClick={() => onRequestApproval(workflow)}
                          className="btn btn-sm btn-secondary workflow-action-button"
                        >
                          Create linked approval
                        </button>
                      ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';

export function WorkflowList({ refreshTrigger }) {
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
      setWorkflows(data.result || []);
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
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Workflows</h2>
          <button onClick={fetchWorkflows} className="btn btn-sm btn-outline">
            🔄 Refresh
          </button>
        </div>

        {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}

        {workflows.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No workflows yet. Create one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
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
                    <td className="font-semibold">{workflow.name}</td>
                    <td className="text-sm text-slate-400 font-mono">{workflow.id}</td>
                    <td>
                      <span className={`badge ${workflow.active ? 'badge-success' : 'badge-warning'}`}>
                        {workflow.active ? '✅ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td>
                      {!workflow.active && (
                        <button
                          onClick={() => handleActivate(workflow.id)}
                          disabled={activatingId === workflow.id}
                          className="btn btn-sm btn-primary"
                        >
                          {activatingId === workflow.id ? '⏳' : '▶'} Activate
                        </button>
                      )}
                      {workflow.active && (
                        <span className="text-sm text-slate-400">Running...</span>
                      )}
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

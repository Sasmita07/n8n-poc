import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';
import { isSystemWorkflow } from '../lib/utils';

const initialForm = {
  workflowId: '',
  type: 'expense',
  requester: '',
  approver: '',
  subject: '',
  body: '',
};

const statusStyles = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
  failed: 'badge-error',
};

export function ApprovalDashboard({ initialWorkflow }) {
  const [form, setForm] = useState(initialForm);
  const [approvals, setApprovals] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeDecision, setActiveDecision] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { createApproval, getApprovals, updateApprovalDecision, listWorkflows } = useWorkflowApi();

  const refreshApprovals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setApprovals(await getApprovals());
    } catch (err) {
      setError(err.message || 'Unable to load approval requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshApprovals();
  }, [refreshApprovals]);

  useEffect(() => {
    let cancelled = false;
    listWorkflows()
      .then((data) => {
        const result = data.result;
        const items = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];
        const eligibleWorkflows = items.filter(
          (workflow) => workflow.active && !isSystemWorkflow(workflow),
        );
        if (!cancelled) {
          setWorkflows(eligibleWorkflows);
          setForm((current) => ({
            ...current,
            workflowId:
              (eligibleWorkflows.some((workflow) => workflow.id === initialWorkflow?.id)
                ? initialWorkflow.id
                : current.workflowId || eligibleWorkflows[0]?.id) || '',
          }));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(`Unable to load workflows: ${err.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const response = await createApproval(form);
      const linkedWorkflow = workflows.find(
        (workflow) => workflow.id === form.workflowId,
      );
      setMessage(
        `Request ${response.result.id} is linked to ${linkedWorkflow?.name || form.workflowId} and was sent to ${response.result.approver}.`,
      );
      setForm({ ...initialForm, workflowId: form.workflowId });
      await refreshApprovals();
    } catch (err) {
      setError(err.message || 'Unable to create approval request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (approval, decision) => {
    setActiveDecision(`${approval.id}:${decision}`);
    setError('');
    setMessage('');
    try {
      const response = await updateApprovalDecision(
        approval.id,
        decision,
        approval.approver,
        decision === 'approved' ? 'Approved from dashboard' : 'Rejected from dashboard',
      );
      setMessage(response.message);
      await refreshApprovals();
    } catch (err) {
      setError(err.message || 'Unable to record decision');
    } finally {
      setActiveDecision('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="card app-card">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="card-title">Request approval for a workflow</h2>
              <p className="text-sm text-slate-400">The approver receives an email. Approve/reject sends a decision event to the configured n8n decision workflow.</p>
            </div>
          </div>

          {error && <div role="alert" className="alert alert-error">{error}</div>}
          {message && <div role="status" className="alert alert-success">{message}</div>}

          <form onSubmit={handleCreate} className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="app-field">
              <span className="label-text app-label">Created workflow</span>
              <select name="workflowId" value={form.workflowId} onChange={handleChange} className="select select-bordered app-control" required>
                <option value="" disabled>
                  {workflows.length ? 'Select an active business workflow' : 'No active business workflows found'}
                </option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} ({workflow.id}){workflow.active ? '' : ' — inactive'}
                  </option>
                ))}
              </select>
            </label>
            <label className="app-field">
              <span className="label-text app-label">Request type</span>
              <select name="type" value={form.type} onChange={handleChange} className="select select-bordered app-control">
                <option value="expense">Expense</option>
                <option value="leave">Leave</option>
                <option value="purchase">Purchase</option>
                <option value="general">General</option>
              </select>
            </label>
            <label className="app-field">
              <span className="label-text app-label">Requester email</span>
              <input name="requester" type="email" value={form.requester} onChange={handleChange} className="input input-bordered app-control" placeholder="requester@example.com" required />
            </label>
            <label className="app-field">
              <span className="label-text app-label">Approver email</span>
              <input name="approver" type="email" value={form.approver} onChange={handleChange} className="input input-bordered app-control" placeholder="approver@example.com" required />
            </label>
            <label className="app-field md:col-span-2">
              <span className="label-text app-label">Email subject</span>
              <input name="subject" value={form.subject} onChange={handleChange} className="input input-bordered app-control" placeholder="Approval required: expense request" required />
            </label>
            <label className="app-field md:col-span-2">
              <span className="label-text app-label">Request details</span>
              <textarea name="body" value={form.body} onChange={handleChange} className="textarea textarea-bordered app-control min-h-28" placeholder="Describe what needs to be reviewed..." required />
            </label>
            <div className="md:col-span-2">
              <p className="mb-3 text-xs text-amber-200/80">
                This POC links the request to a workflow ID. It does not pause or resume the selected workflow. Configure the separate approval-decision workflow to branch on the decision and perform the business action.
              </p>
              <button type="submit" disabled={submitting} className="btn btn-primary gap-2">
                <Send size={16} /> {submitting ? 'Sending request…' : 'Send for approval'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card app-card">
        <div className="card-body">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="card-title">Approval inbox</h2>
              <p className="text-sm text-slate-400">Review pending requests here or use the decision controls in this dashboard.</p>
            </div>
            <button type="button" onClick={refreshApprovals} disabled={loading} className="btn btn-sm btn-outline gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loading && approvals.length === 0 ? (
            <div className="space-y-3"><div className="skeleton h-24 w-full" /><div className="skeleton h-24 w-full" /></div>
          ) : approvals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 py-10 text-center text-slate-400">
              <Clock3 className="mx-auto mb-2" size={24} />
              No approval requests yet. Create one above to begin.
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <article key={approval.id} className="app-panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{approval.subject || `${approval.type || 'General'} request`}</h3>
                        <span className={`badge ${statusStyles[approval.status] || 'badge-ghost'}`}>{approval.status || 'pending'}</span>
                        <span className="badge badge-outline">{approval.type || 'general'}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-300">{approval.body}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                        <span>Request: <span className="font-mono text-slate-300">{approval.id}</span></span>
                        <span>
                          Workflow: {workflows.find((workflow) => workflow.id === approval.workflowId)?.name || approval.workflowId}
                        </span>
                        {approval.aiDecisionId && <span>AI decision: {approval.aiDecisionId}</span>}
                        <span>From: {approval.requester}</span>
                        <span>Approver: {approval.approver}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {approval.workflowStatus && <span>n8n request: {approval.workflowStatus}</span>}
                        {approval.notificationStatus && <span>Notification: {approval.notificationStatus}</span>}
                        {approval.continuationStatus && <span>Continuation: {approval.continuationStatus}</span>}
                      </div>
                      {approval.reason && <p className="mt-2 text-xs text-slate-400">Decision note: {approval.reason}</p>}
                      {(approval.error || approval.continuationError) && (
                        <p className="mt-2 text-xs text-error">{approval.continuationError || approval.error}</p>
                      )}
                    </div>
                    {approval.status === 'pending' && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecision(approval, 'approved')}
                          disabled={Boolean(activeDecision)}
                          className="btn btn-sm btn-success gap-1"
                        >
                          <Check size={15} /> {activeDecision === `${approval.id}:approved` ? 'Saving…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(approval, 'rejected')}
                          disabled={Boolean(activeDecision)}
                          className="btn btn-sm btn-error btn-outline gap-1"
                        >
                          <X size={15} /> {activeDecision === `${approval.id}:rejected` ? 'Saving…' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {approval.continuationStatus === 'failed' && (
                      <button
                        type="button"
                        onClick={() => handleDecision(approval, approval.decision || approval.status)}
                        disabled={Boolean(activeDecision)}
                        className="btn btn-sm btn-warning gap-1"
                      >
                        <RefreshCw size={14} className={activeDecision ? 'animate-spin' : ''} />
                        {activeDecision ? 'Retrying…' : 'Retry n8n handoff'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

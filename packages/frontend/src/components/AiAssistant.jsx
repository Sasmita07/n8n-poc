import React, { useEffect, useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';
import { isSystemWorkflow } from '../lib/utils';

export function AiAssistant({ onApprovalCreated }) {
  const { analyzeAiDecision, retryAiDecision, createApproval, listWorkflows } = useWorkflowApi();
  const [requestText, setRequestText] = useState('');
  const [context, setContext] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [workflows, setWorkflows] = useState([]);
  const [requester, setRequester] = useState('');
  const [approver, setApprover] = useState('');
  const [result, setResult] = useState(null);
  const [approvalId, setApprovalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingApproval, setCreatingApproval] = useState(false);
  const [error, setError] = useState('');

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
        if (!cancelled) {
          const businessWorkflows = items.filter(
            (workflow) => workflow.active && !isSystemWorkflow(workflow),
          );
          setWorkflows(businessWorkflows);
          setWorkflowId((current) => current || businessWorkflows[0]?.id || '');
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(`Unable to load workflows: ${requestError.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError('');
    setApprovalId('');
    setLoading(true);
    try {
      const decision = await analyzeAiDecision({
        request: requestText,
        context,
        workflowId,
      });
      setResult(decision);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!result) return;
    setError('');
    setLoading(true);
    try {
      setResult(await retryAiDecision(result.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApproval = async () => {
    if (!result) return;
    setError('');
    setCreatingApproval(true);
    try {
      const approval = await createApproval({
        workflowId: result.workflowId,
        aiDecisionId: result.id,
        type: 'ai-assisted-review',
        requester,
        approver,
        subject: `AI-assisted review: ${result.summary.slice(0, 100)}`,
        body: [
          'AI recommendation (advisory only):',
          `Recommendation: ${result.recommendation}`,
          `Risk: ${result.riskLevel}`,
          `Summary: ${result.summary}`,
          `Rationale: ${result.rationale}`,
          '',
          'Original request:',
          requestText,
          '',
          'A human decision is required before any business action.',
        ].join('\n'),
      });
      setApprovalId(approval.result.id);
      if (onApprovalCreated) onApprovalCreated(approval.result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreatingApproval(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section className="card app-card lg:col-span-3">
        <div className="card-body">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Phase 3 · AI-assisted workflow</p>
            <h2 className="card-title mt-1">Review a business request</h2>
            <p className="mt-2 text-sm text-slate-400">
              The model returns a structured recommendation. It cannot approve or execute a business action; the Phase 2 approval flow remains the decision gate.
            </p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleAnalyze} className="mt-3 grid grid-cols-1 gap-4">
            <label className="app-field">
              <span className="label-text app-label font-medium">Business request</span>
              <textarea
                required
                maxLength={8000}
                value={requestText}
                onChange={(event) => setRequestText(event.target.value)}
                placeholder="Describe the request you want the AI to triage…"
                className="textarea textarea-bordered app-control min-h-32"
              />
              <span className="text-xs text-slate-500">Avoid entering passwords, API keys, or unnecessary personal data.</span>
            </label>

            <label className="app-field">
              <span className="label-text app-label font-medium">Policy context (optional)</span>
              <textarea
                maxLength={2000}
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Relevant policy or constraints for the review…"
                className="textarea textarea-bordered app-control min-h-20"
              />
            </label>

            <label className="app-field max-w-md">
              <span className="label-text app-label font-medium">Workflow</span>
              <select
                value={workflowId}
                onChange={(event) => setWorkflowId(event.target.value)}
                className="select select-bordered app-control"
                required
              >
                <option value="" disabled>
                  {workflows.length ? 'Select an active business workflow' : 'No active business workflows found'}
                </option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} ({workflow.id})
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary w-fit">
              {loading ? 'Analyzing…' : '✨ Analyze request'}
            </button>
          </form>
        </div>
      </section>

      <aside className="card app-card border-violet-400/25 bg-violet-950/20 lg:col-span-2">
        <div className="card-body">
          <h2 className="card-title">Recommendation</h2>
          {!result ? (
            <p className="text-sm text-slate-400">Submit a request to see the AI triage result and n8n handoff status.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-secondary">{result.recommendation.replace('_', ' ')}</span>
                <span className="badge badge-outline">{result.riskLevel} risk</span>
                <span className={`badge ${result.dispatchStatus === 'dispatched' ? 'badge-success' : 'badge-warning'}`}>
                  n8n {result.dispatchStatus}
                </span>
              </div>
              <p className="font-semibold">{result.summary}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{result.rationale}</p>
              <p className="rounded-lg border border-amber-400/30 bg-amber-950/30 p-3 text-xs text-amber-100">
                Human review required. The recommendation is advisory and does not authorize an action.
              </p>

              {result.dispatchStatus === 'failed' && (
                <button onClick={handleRetry} disabled={loading} className="btn btn-outline btn-sm">
                  Retry n8n handoff
                </button>
              )}

              <div className="divider">Continue with Phase 2 approval</div>
              {approvalId ? (
                <div className="alert alert-success text-sm">Approval request created: {approvalId}</div>
              ) : (
                <>
                  <label className="app-field">
                    <span className="label-text app-label">Requester email</span>
                    <input type="email" required value={requester} onChange={(event) => setRequester(event.target.value)} className="input input-bordered app-control input-sm" />
                  </label>
                  <label className="app-field">
                    <span className="label-text app-label">Approver email</span>
                    <input type="email" required value={approver} onChange={(event) => setApprover(event.target.value)} className="input input-bordered app-control input-sm" />
                  </label>
                  <button
                    type="button"
                    onClick={handleCreateApproval}
                    disabled={creatingApproval || !requestText.trim()}
                    className="btn btn-secondary btn-sm"
                  >
                    {creatingApproval ? 'Creating approval…' : 'Create human approval request'}
                  </button>
                </>
              )}
              {approvalId && onApprovalCreated && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onApprovalCreated({ id: approvalId })}>
                  Open approvals
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
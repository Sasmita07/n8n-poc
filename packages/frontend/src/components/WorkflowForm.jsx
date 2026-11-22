import React, { useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';

export function WorkflowForm({ onWorkflowCreated }) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowType, setWorkflowType] = useState('webhook');
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    setupEmailWorkflow,
    setupWebhookWorkflow,
    setupScheduledWorkflow,
    sendEmail,
  } = useWorkflowApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let result;

      if (workflowType === 'email') {
        const workflowSetup = await setupEmailWorkflow();
        result = await sendEmail({
          to: email,
          subject: emailSubject || 'Workflow Notification',
          body: emailBody || 'Workflow executed successfully',
        });
        setSuccessMessage(
          `✅ Email workflow created and email sent to ${email} (Workflow: ${workflowSetup.workflowId || 'active'})`
        );
        setEmail('');
        setEmailSubject('');
        setEmailBody('');
      } else if (workflowType === 'scheduled') {
        const name = workflowName.trim() || 'scheduled-workflow';
        result = await setupScheduledWorkflow(name, Number(intervalMinutes));
        setSuccessMessage(
          `✅ Scheduled workflow "${name}" created and activated (every ${intervalMinutes} minutes, ID: ${result.workflowId})`,
        );
        setWorkflowName('');
      } else {
        const name = workflowName.trim() || 'webhook-trigger-workflow';
        result = await setupWebhookWorkflow(name);
        const webhookPath = name.toLowerCase().replace(/\s+/g, '-');
        setSuccessMessage(
          `✅ Webhook workflow "${name}" created and activated. Trigger it with POST /webhook/${webhookPath} (ID: ${result.workflowId})`,
        );
        setWorkflowName('');
      }

      if (onWorkflowCreated) {
        onWorkflowCreated(result);
      }

      // Clear form
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card app-card">
      <div className="card-body">
        <h2 className="card-title">Phase 1 · Workflow Setup</h2>
        <p className="text-sm text-slate-400">
          Create a webhook or scheduled business workflow, then use Workflows → Create linked approval to route a request for review. Configure the approval-decision workflow to perform the approved/rejected action; these starter triggers are not paused automatically.
        </p>

        {error && <div className="alert alert-error shadow-lg">{error}</div>}
        {successMessage && <div className="alert alert-success shadow-lg">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Type Selection */}
          <label className="app-field w-full">
            <span className="label-text app-label font-medium">Type</span>
            <select
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
              className="select select-bordered app-control w-full"
            >
              <option value="webhook">Webhook Trigger</option>
              <option value="scheduled">Scheduled Trigger</option>
              <option value="email">Send Email</option>
            </select>
          </label>

          {workflowType !== 'email' && (
            <p className="self-center text-xs text-slate-400">
              {workflowType === 'webhook'
                ? 'Creates and activates a workflow that runs when its HTTP webhook endpoint receives a request.'
                : 'Creates and activates a workflow that runs automatically on a repeating interval.'}
            </p>
          )}

          {/* Workflow Name */}
          {workflowType !== 'email' && (
            <label className="app-field w-full">
              <span className="label-text app-label font-medium">Workflow Name</span>
              <input
                type="text"
                placeholder="e.g., Send Daily Report"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="input input-bordered app-control w-full"
              />
            </label>
          )}

          {workflowType === 'scheduled' && (
            <label className="app-field w-full">
              <span className="label-text app-label font-medium">Run every (minutes)</span>
              <input
                type="number"
                min="1"
                max="10080"
                step="1"
                required
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
                className="input input-bordered app-control w-full"
              />
            </label>
          )}

          {/* Email Fields */}
          {workflowType === 'email' && (
            <>
              <label className="app-field w-full">
                <span className="label-text app-label font-medium">Recipient Email</span>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered app-control w-full"
                  required
                />
              </label>
              <label className="app-field w-full">
                <span className="label-text app-label font-medium">Subject</span>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="input input-bordered app-control w-full"
                />
              </label>
              <label className="app-field w-full md:col-span-2">
                <span className="label-text app-label font-medium">Body</span>
                <textarea
                  placeholder="Email body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="textarea textarea-bordered app-control h-32 w-full resize-y"
                />
              </label>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full md:col-span-2 md:w-fit"
          >
            {loading
              ? '⏳ Processing...'
              : workflowType === 'email'
                ? '📧 Send Email'
                : workflowType === 'scheduled'
                  ? '⏰ Create Scheduled Workflow'
                  : '🔗 Create Webhook Workflow'}
          </button>
        </form>
      </div>
    </div>
  );
}

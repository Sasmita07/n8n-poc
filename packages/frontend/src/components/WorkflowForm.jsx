import React, { useState } from 'react';
import { useWorkflowApi } from '../hooks/useWorkflowApi';

export function WorkflowForm({ onWorkflowCreated }) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowType, setWorkflowType] = useState('webhook');
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { createWorkflow, setupEmailWorkflow, sendEmail } = useWorkflowApi();

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
      } else {
        // Create a webhook-based workflow
        const workflowPayload = {
          name: workflowName || `New ${workflowType} workflow`,
          nodes: [
            {
              id: `webhook-${Date.now()}`,
              name: 'Webhook Trigger',
              type: 'n8n-nodes-base.webhook',
              typeVersion: 1,
              position: [250, 300],
              parameters: {
                path: 'workflow-trigger',
                options: {},
              },
            },
            {
              id: `response-${Date.now()}`,
              name: 'Send Response',
              type: 'n8n-nodes-base.respondToWebhook',
              typeVersion: 1,
              position: [450, 300],
              parameters: {
                responseCode: 200,
              },
            },
          ],
          connections: {
            'Webhook Trigger': {
              main: [[{ node: 'Send Response', type: 'main', index: 0 }]],
            },
          },
          settings: {
            executionOrder: 'v1',
          },
        };

        result = await createWorkflow(workflowPayload);
        setSuccessMessage(`✅ Workflow "${workflowName}" created successfully (ID: ${result.result?.id})`);
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
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create Workflow or Send Email</h2>

        {error && <div className="alert alert-error shadow-lg">{error}</div>}
        {successMessage && <div className="alert alert-success shadow-lg">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="form-control gap-4">
          {/* Type Selection */}
          <div>
            <label className="label">
              <span className="label-text">Type</span>
            </label>
            <select
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
              className="select select-bordered"
            >
              <option value="webhook">Webhook Trigger</option>
              <option value="scheduled">Scheduled Trigger</option>
              <option value="email">Email Notification</option>
            </select>
          </div>

          {/* Workflow Name */}
          {workflowType !== 'email' && (
            <div>
              <label className="label">
                <span className="label-text">Workflow Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Send Daily Report"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="input input-bordered"
              />
            </div>
          )}

          {/* Email Fields */}
          {workflowType === 'email' && (
            <>
              <div>
                <label className="label">
                  <span className="label-text">Recipient Email</span>
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="input input-bordered"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Body</span>
                </label>
                <textarea
                  placeholder="Email body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="textarea textarea-bordered h-24"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ Processing...' : workflowType === 'email' ? '📧 Send Email' : '🚀 Create Workflow'}
          </button>
        </form>
      </div>
    </div>
  );
}

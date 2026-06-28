jest.mock('axios');

const request = require('supertest');
const axios = require('axios');
const app = require('../server');
const { resetState } = require('../models/automationStore');

describe('Automation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetState();
  });

  describe('Health', () => {
    it('returns healthy status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Webhook', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
        },
      });
    });

    it('accepts webhook requests', async () => {
      const res = await request(app).get('/webhook/automation');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.logId).toBeDefined();
      expect(res.body.webhook).toBe('automation');
    });

    it('accepts dynamic webhook paths', async () => {
      const res = await request(app).get('/webhook/my-custom-path');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.webhook).toBe('my-custom-path');
    });
  });

  describe('Create Workflow', () => {
    it('creates workflow', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          id: 'wf-456',
          name: 'Test Workflow',
        },
      });

      const res = await request(app).post('/api/create-workflow').send({
        name: 'Test Workflow',
        nodes: [],
        connections: {},
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.id).toBe('wf-456');
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('Activate Workflow', () => {
    it('activates workflow', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          active: true,
        },
      });

      const res = await request(app)
        .post('/api/activate-workflow')
        .send({
          workflowId: 'wf-789',
          data: {
            versionId: 'v1',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Workflow Details', () => {
    it('gets workflow by id', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          id: 'wf-789',
          name: 'Test Workflow',
          active: true,
        },
      });

      const res = await request(app).get('/api/workflows/wf-789');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.id).toBe('wf-789');
    });
  });

  describe('List Workflows', () => {
    it('returns workflow list', async () => {
      axios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'wf-1',
            name: 'Workflow 1',
          },
          {
            id: 'wf-2',
            name: 'Workflow 2',
          },
        ],
      });

      const res = await request(app).get('/api/workflows');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
    });
  });
});

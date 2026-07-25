import { describe, it, expect } from 'vitest';
import { app } from '../src/app';

describe('Health & OpenAPI System Routes', () => {
  it('GET /health - returns healthy status diagnostic', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeTypeOf('number');
  });

  it('GET / - returns service metadata banner', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.service).toBeDefined();
    expect(data.version).toBe('v1.0.0');
    expect(data.docs).toBe('/docs');
  });

  it('GET /doc - serves valid OpenAPI 3.0 specification JSON', async () => {
    const res = await app.request('/doc');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.openapi).toBe('3.0.0');
    expect(data.info.title).toBe('n8n Workflow Service API');
    expect(data.paths['/api/v1/workflows']).toBeDefined();
    expect(data.paths['/webhook/{path}']).toBeDefined();
  });

  it('GET /docs - serves Swagger UI html endpoint', async () => {
    const res = await app.request('/docs');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('swagger');
  });
});

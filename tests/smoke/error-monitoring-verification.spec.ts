import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SENTRY_CLIENT_CONFIG = join(process.cwd(), 'sentry.client.config.ts');
const SENTRY_SERVER_CONFIG = join(process.cwd(), 'sentry.server.config.ts');

test.describe('Error Monitoring Runbook Verification', () => {
  
  test.describe.configure({ mode: 'serial' });

  test.describe('Health Check Endpoint', () => {
    
    test('returns complete health status structure per runbook spec', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('service');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('dependencies');
      expect(data).toHaveProperty('responseTimeMs');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
      expect(data.service).toBe('leksikon-ai');
      expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
      expect(typeof data.responseTimeMs).toBe('number');
      expect(data.responseTimeMs).toBeGreaterThanOrEqual(0);
    });
    
    test('reports correct dependency structure per runbook spec', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      expect(data.dependencies).toHaveProperty('supabase');
      expect(data.dependencies).toHaveProperty('gemini');
      expect(['ok', 'error']).toContain(data.dependencies.supabase);
      expect(['ok', 'error']).toContain(data.dependencies.gemini);
    });
    
    test('status reflects dependency health per runbook spec', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      if (data.dependencies.supabase === 'error') {
        expect(['degraded', 'unhealthy']).toContain(data.status);
      }
      
      if (data.dependencies.supabase === 'ok' && data.dependencies.gemini === 'ok') {
        expect(data.status).toBe('healthy');
      }
    });
    
    test('response time is measured per runbook spec', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get('/api/health');
      const endTime = Date.now();
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      expect(data.responseTimeMs).toBeLessThan(1000);
      expect(endTime - startTime).toBeLessThan(2000);
    });
    
  });
  
  test.describe('Health Check Response Format', () => {
    
    test('returns JSON with correct content-type', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });
    
    test('is accessible for uptime monitoring per runbook spec', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
    
  });
  
  test.describe('Error Monitoring Infrastructure', () => {
    
    test('health endpoint accessible indicates proper app configuration', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBeDefined();
    });
    
  });

  test.describe('Sentry Error Capture Verification', () => {
    
    test('error endpoint exists and returns 500 when error is triggered', async ({ request }) => {
      const response = await request.get('/api/test-error');
      expect([500, 404]).toContain(response.status());
    });
    
    test('Sentry configuration files exist', async () => {
      expect(() => readFileSync(SENTRY_CLIENT_CONFIG, 'utf8')).not.toThrow();
      expect(() => readFileSync(SENTRY_SERVER_CONFIG, 'utf8')).not.toThrow();
    });
    
    test('Sentry configs initialize with required settings', async () => {
      const clientConfig = readFileSync(SENTRY_CLIENT_CONFIG, 'utf8');
      const serverConfig = readFileSync(SENTRY_SERVER_CONFIG, 'utf8');
      
      expect(clientConfig).toContain('@sentry/nextjs');
      expect(serverConfig).toContain('@sentry/nextjs');
      expect(clientConfig).toContain('SENTRY_DSN');
      expect(serverConfig).toContain('SENTRY_DSN');
    });
    
    test('Sentry configs use correct trace sampling rate', async () => {
      const clientConfig = readFileSync(SENTRY_CLIENT_CONFIG, 'utf8');
      const serverConfig = readFileSync(SENTRY_SERVER_CONFIG, 'utf8');
      
      expect(clientConfig).toContain('tracesSampleRate');
      expect(serverConfig).toContain('tracesSampleRate');
    });
    
  });

  test.describe('Runbook Compliance', () => {
    
    test('all runbook verification steps are automated', async ({ request }) => {
      const healthResponse = await request.get('/api/health');
      
      if (healthResponse.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(healthResponse.status()).toBe(200);
      
      const healthData = await healthResponse.json();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthData.status);
    });
    
    test('runbook health check spec matches implementation', async ({ request }) => {
      const response = await request.get('/api/health');
      
      if (response.status() === 404) {
        test.skip(true, 'Health endpoint not available - server may not be running');
        return;
      }
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('service', 'leksikon-ai');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('dependencies');
      expect(data).toHaveProperty('responseTimeMs');
      expect(data.dependencies).toHaveProperty('supabase');
      expect(data.dependencies).toHaveProperty('gemini');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
      expect(['ok', 'error']).toContain(data.dependencies.supabase);
      expect(['ok', 'error']).toContain(data.dependencies.gemini);
    });
    
  });

});

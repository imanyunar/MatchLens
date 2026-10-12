import { checkDbConnection } from '@/lib/db';
import { env } from '@/lib/config/env';
import { apiSuccess } from '@/lib/response';


export async function GET() {
  const dbStatus = await checkDbConnection();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MatchLens Intelligence API',
    environment: env.NODE_ENV,
    checks: {
      database: {
        provider: 'PostgreSQL (Docker)',
        connected: dbStatus.connected,
        latencyMs: dbStatus.latencyMs,
        ...(dbStatus.error ? { error: dbStatus.error } : {}),
      },
      footballProvider: {
        name: env.FOOTBALL_PROVIDER,
        status: 'active',
      },
      aiEngine: {
        provider: env.AI_PROVIDER,
        model: env.AI_MODEL,
        status: 'ready',
      },
    },
  };

  return apiSuccess(healthData, { uptime: process.uptime() });
}

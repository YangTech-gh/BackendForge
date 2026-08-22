import Fastify from 'fastify';
import { initTracing } from './tracing/setup.js';
import { httpRequestsTotal, httpRequestDuration, httpRequestsInFlight, getMetrics } from './metrics/red.js';

const { tracer } = initTracing();
const app = Fastify({ logger: true });

app.addHook('onRequest', async () => { httpRequestsInFlight.inc(); });
app.addHook('onResponse', async (req, reply) => {
  httpRequestsInFlight.dec();
  const labels = { method: req.method, route: req.routeOptions?.url || req.url, status_code: reply.statusCode };
  httpRequestsTotal.inc(labels);
  httpRequestDuration.observe(labels, (Date.now() - req.startTime) / 1000);
});

app.get('/health', async () => ({ status: 'ok' }));
app.get('/metrics', async (_req, reply) => {
  reply.header('Content-Type', register.contentType);
  return getMetrics();
});

app.listen({ port: 3000 });
export default app;

import Fastify from 'fastify';
import { monitorEventLoopDelay } from 'perf_hooks';

const app = Fastify({ logger: true });

const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
eventLoopMonitor.enable();

app.get('/health', async () => {
  const mem = process.memoryUsage();
  return {
    status: 'ok',
    eventLoopLag: eventLoopMonitor.mean / 1e6,
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
    },
    uptime: process.uptime(),
  };
});

app.get('/api/ping', async () => ({ pong: true }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;

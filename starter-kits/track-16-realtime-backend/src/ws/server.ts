import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { RoomManager } from './rooms.js';
import { RedisPubSub } from '../pubsub/redis.js';

const app = Fastify({ logger: true });
await app.register(websocket);

const pubsub = new RedisPubSub();
const rooms = new RoomManager(pubsub);

app.get('/health', async () => ({ status: 'ok' }));

app.get('/ws', { websocket: true }, (socket, req) => {
  const clientId = crypto.randomUUID();
  console.log(`[WS] Client connected: ${clientId}`);

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      rooms.handleMessage(clientId, socket, msg);
    } catch { socket.send(JSON.stringify({ error: 'Invalid message' })); }
  });

  socket.on('close', () => {
    console.log(`[WS] Client disconnected: ${clientId}`);
    rooms.removeClient(clientId);
  });

  socket.send(JSON.stringify({ type: 'connected', clientId }));
});

app.listen({ port: 3000 });
export default app;

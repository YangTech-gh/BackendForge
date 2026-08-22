import type { WebSocket } from 'ws';
import { RedisPubSub } from '../pubsub/redis.js';

interface Client {
  socket: WebSocket;
  rooms: Set<string>;
}

export class RoomManager {
  private clients = new Map<string, Client>();
  constructor(private pubsub: RedisPubSub) {}

  handleMessage(clientId: string, socket: WebSocket, msg: { type: string; room?: string; data?: any }) {
    switch (msg.type) {
      case 'join':
        if (!this.clients.has(clientId)) this.clients.set(clientId, { socket, rooms: new Set() });
        this.clients.get(clientId)!.rooms.add(msg.room!);
        this.pubsub.publish(`room:${msg.room}`, JSON.stringify({ type: 'user_joined', clientId }));
        break;
      case 'leave':
        this.clients.get(clientId)?.rooms.delete(msg.room!);
        break;
      case 'message':
        this.pubsub.publish(`room:${msg.room}`, JSON.stringify({ from: clientId, data: msg.data }));
        break;
    }
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }
}

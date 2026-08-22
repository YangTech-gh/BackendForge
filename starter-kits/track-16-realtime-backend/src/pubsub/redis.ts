import Redis from 'ioredis';

export class RedisPubSub {
  private pub: Redis;
  private sub: Redis;
  private handlers = new Map<string, (msg: string) => void>();

  constructor(url?: string) {
    const opts = { lazyConnect: true };
    this.pub = new Redis(url || 'redis://localhost:6379', opts);
    this.sub = new Redis(url || 'redis://localhost:6379', opts);
  }

  async connect() {
    await Promise.all([this.pub.connect(), this.sub.connect()]);
  }

  publish(channel: string, message: string) {
    this.pub.publish(channel, message);
  }

  subscribe(channel: string, handler: (msg: string) => void) {
    this.handlers.set(channel, handler);
    this.sub.subscribe(channel);
    this.sub.on('message', (ch, msg) => {
      if (ch === channel) handler(msg);
    });
  }
}

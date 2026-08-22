import { monitorEventLoopDelay, PerformanceObserver } from 'perf_hooks';

export class EventLoopMonitor {
  private monitor: ReturnType<typeof monitorEventLoopDelay>;
  private lagThreshold: number;
  private onLagCallback?: (lagMs: number) => void;

  constructor(options: { resolution?: number; lagThresholdMs?: number } = {}) {
    this.monitor = monitorEventLoopDelay({ resolution: options.resolution || 20 });
    this.lagThreshold = options.lagThresholdMs || 50;
    this.monitor.enable();
  }

  onLag(callback: (lagMs: number) => void) {
    this.onLagCallback = callback;
  }

  getStats() {
    const lag = this.monitor.mean / 1e6;
    return {
      eventLoopLagMs: Math.round(lag * 100) / 100,
      isBlocking: lag > this.lagThreshold,
      min: this.monitor.min / 1e6,
      max: this.monitor.max / 1e6,
      percentile99: this.monitor.percentile(99) / 1e6,
    };
  }

  disable() {
    this.monitor.disable();
  }
}

export class BlockingDetector {
  private threshold: number;
  private intervals: NodeJS.Timeout[] = [];

  constructor(thresholdMs: number = 100) {
    this.threshold = thresholdMs;
  }

  start() {
    const checkInterval = Math.floor(this.threshold / 3);
    let lastCheck = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastCheck;
      if (elapsed > this.threshold) {
        console.warn(
          `[BLOCKING] Event loop blocked for ${elapsed}ms (threshold: ${this.threshold}ms)`
        );
      }
      lastCheck = now;
    }, checkInterval);

    this.intervals.push(timer);
    return this;
  }

  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }
}

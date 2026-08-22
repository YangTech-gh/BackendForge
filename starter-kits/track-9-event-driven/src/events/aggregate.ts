export abstract class Aggregate {
  protected id: string;
  protected version = 0;
  private uncommittedEvents: any[] = [];

  constructor(id: string) { this.id = id; }

  protected apply(event: any) {
    this.version++;
    this.uncommittedEvents.push(event);
    this.when(event);
  }

  protected abstract when(event: any): void;

  getUncommittedEvents() { return [...this.uncommittedEvents]; }
  clearUncommittedEvents() { this.uncommittedEvents = []; }
}

import { sql } from './store.js';

export interface Event {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: Record<string, unknown>;
  version: number;
  createdAt: string;
}

export class EventStore {
  async append(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const result = await sql`
      INSERT INTO events (aggregate_id, aggregate_type, event_type, payload, version)
      VALUES (${event.aggregateId}, ${event.aggregateType}, ${event.eventType},
              ${JSON.stringify(event.payload)}, ${event.version})
      RETURNING id, created_at
    `;
    return { ...event, id: result[0].id, createdAt: result[0].created_at };
  }

  async getEvents(aggregateId: string): Promise<Event[]> {
    const rows = await sql`
      SELECT * FROM events WHERE aggregate_id = ${aggregateId} ORDER BY version ASC
    `;
    return rows.map(r => ({
      id: r.id, aggregateId: r.aggregate_id, aggregateType: r.aggregate_type,
      eventType: r.event_type, payload: JSON.parse(r.payload), version: r.version,
      createdAt: r.created_at,
    }));
  }
}

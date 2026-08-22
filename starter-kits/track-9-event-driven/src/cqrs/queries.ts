export interface Query {
  type: string;
  params: Record<string, unknown>;
}

export type QueryHandler<T> = (query: Query) => Promise<T>;

const handlers = new Map<string, QueryHandler<any>>();

export function registerQueryHandler<T>(type: string, handler: QueryHandler<T>) {
  handlers.set(type, handler);
}

export async function query<T>(q: Query): Promise<T> {
  const handler = handlers.get(q.type);
  if (!handler) throw new Error(`No handler for query: ${q.type}`);
  return handler(q);
}

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/backend_forge', {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

interface PoolStats {
  totalConnections: number;
  activeQueries: number;
  idleConnections: number;
  waitingClients: number;
}

export async function getPoolStats(): Promise<PoolStats> {
  const [total, active, idle] = await Promise.all([
    sql`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`,
    sql`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active' AND datname = current_database()`,
    sql`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'idle' AND datname = current_database()`,
  ]);
  return {
    totalConnections: Number(total[0].count),
    activeQueries: Number(active[0].count),
    idleConnections: Number(idle[0].count),
    waitingClients: 0,
  };
}

export async function detectConnectionLeaks(): Promise<string[]> {
  const leaks = await sql`
    SELECT pid, state, query_start, state_change, query
    FROM pg_stat_activity
    WHERE state = 'idle'
      AND state_change < now() - interval '10 minutes'
      AND datname = current_database()
  `;
  return leaks.map((l: any) => `PID ${l.pid}: idle since ${l.state_change}`);
}

export { sql };

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/backend_forge');

export async function initPgVector() {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  await sql`
    CREATE TABLE IF NOT EXISTS document_embeddings (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      embedding vector(1536) NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
    ON document_embeddings USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200)
  `;
}

export async function searchSimilar(queryEmbedding: number[], topK: number = 5) {
  return sql`
    SELECT id, content, metadata, 1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM document_embeddings
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${topK}
  `;
}

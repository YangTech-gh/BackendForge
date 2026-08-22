-- Track 3: Database Mastery - Index Examples

-- B-tree index for equality and range queries
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created
  ON orders (tenant_id, created_at DESC);

-- Partial index for filtered queries
CREATE INDEX IF NOT EXISTS idx_orders_pending
  ON orders (id) WHERE status = 'pending';

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_products_search
  ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Composite index for multi-column WHERE
CREATE INDEX IF NOT EXISTS idx_users_email_tenant
  ON users (email, tenant_id) WHERE deleted_at IS NULL;

-- Covering index for index-only scans
CREATE INDEX IF NOT EXISTS idx_products_list
  ON products (tenant_id, created_at DESC) INCLUDE (name, price);

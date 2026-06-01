-- 1. Enable the pgvector extension to work with embedding vectors (extensions must usually be in public or extensions schema, but we'll leave it default)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create a table to store document embeddings (like receipts, text transactions)
CREATE TABLE IF NOT EXISTS copilot_money.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES copilot_money.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- The raw text from the receipt or document
  metadata JSONB, -- Optional metadata (e.g. file name, type, transaction_id)
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS so users only query their own documents
ALTER TABLE copilot_money.document_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own embeddings" ON copilot_money.document_embeddings;
CREATE POLICY "Users can CRUD own embeddings" ON copilot_money.document_embeddings
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create a function that the backend will call to perform the vector similarity search
CREATE OR REPLACE FUNCTION copilot_money.match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM copilot_money.document_embeddings
  WHERE document_embeddings.user_id = p_user_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

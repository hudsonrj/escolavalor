-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de embeddings para RAG
CREATE TABLE IF NOT EXISTS escola_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca vetorial
CREATE INDEX IF NOT EXISTS escola_embeddings_vector_idx ON escola_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índice para escola_id
CREATE INDEX IF NOT EXISTS escola_embeddings_escola_id_idx ON escola_embeddings(escola_id);

-- Tabela de histórico de conversas
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para session_id
CREATE INDEX IF NOT EXISTS chat_conversations_session_idx ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS chat_conversations_created_idx ON chat_conversations(created_at DESC);

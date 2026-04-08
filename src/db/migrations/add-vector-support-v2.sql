-- Tabela de embeddings para RAG (usando JSONB para vetores)
CREATE TABLE IF NOT EXISTS escola_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding JSONB NOT NULL, -- Array de floats como JSON
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para escola_id
CREATE INDEX IF NOT EXISTS escola_embeddings_escola_id_idx ON escola_embeddings(escola_id);

-- Índice GIN para metadata
CREATE INDEX IF NOT EXISTS escola_embeddings_metadata_idx ON escola_embeddings USING GIN(metadata);

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

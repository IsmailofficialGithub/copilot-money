-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create our custom schema
CREATE SCHEMA IF NOT EXISTS copilot_money;

-- 1. Profiles
CREATE TABLE copilot_money.user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  currency      TEXT DEFAULT 'USD',
  pay_date      INTEGER,
  preferences   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions
CREATE TABLE copilot_money.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  description     TEXT NOT NULL,
  merchant_name   TEXT,
  category        TEXT,
  category_source TEXT DEFAULT 'auto',
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_key  TEXT,
  is_anomaly      BOOLEAN DEFAULT FALSE,
  source          TEXT DEFAULT 'csv',
  external_id     TEXT,
  embedding       VECTOR(1536),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_external UNIQUE (user_id, external_id)
);

CREATE INDEX idx_transactions_user_date ON copilot_money.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON copilot_money.transactions(user_id, category);
CREATE INDEX idx_transactions_embedding ON copilot_money.transactions USING ivfflat (embedding vector_cosine_ops);

-- 3. Budgets
CREATE TABLE copilot_money.budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  period      TEXT DEFAULT 'monthly',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_budget_category UNIQUE (user_id, category, period)
);

-- 4. Conversations & Messages
CREATE TABLE copilot_money.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE copilot_money.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES copilot_money.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]',
  model_used      TEXT,
  tokens_used     INTEGER,
  tool_calls      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fix check constraint syntax
ALTER TABLE copilot_money.messages DROP CONSTRAINT IF EXISTS messages_role_check;
ALTER TABLE copilot_money.messages ADD CONSTRAINT messages_role_check CHECK (role IN ('user','assistant','system'));


-- 5. User Context
CREATE TABLE copilot_money.user_context (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  source     TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_context_key UNIQUE (user_id, key)
);

-- 6. Receipts
CREATE TABLE copilot_money.receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  extracted_data  JSONB,
  transaction_id  UUID REFERENCES copilot_money.transactions(id),
  ocr_confidence  NUMERIC(3,2),
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE copilot_money.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_money.receipts ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can only access their own profiles" ON copilot_money.user_profiles USING (auth.uid() = id);
CREATE POLICY "Users can only access their own transactions" ON copilot_money.transactions USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own budgets" ON copilot_money.budgets USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own conversations" ON copilot_money.conversations USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own messages" ON copilot_money.messages USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own context" ON copilot_money.user_context USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own receipts" ON copilot_money.receipts USING (auth.uid() = user_id);

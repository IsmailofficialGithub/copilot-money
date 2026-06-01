-- 0. Create the custom schema
CREATE SCHEMA IF NOT EXISTS copilot_money;



-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS copilot_money.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force add columns in case the table was created previously without them
ALTER TABLE copilot_money.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE copilot_money.user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE copilot_money.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE copilot_money.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON copilot_money.user_profiles;
CREATE POLICY "Users can read own profile" ON copilot_money.user_profiles
  FOR SELECT USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Users can update own profile" ON copilot_money.user_profiles;
CREATE POLICY "Users can update own profile" ON copilot_money.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create the Trigger for new users (Function goes in public schema to avoid Supabase Auth permission issues)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, copilot_money
AS $$
BEGIN
  INSERT INTO copilot_money.user_profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop trigger if exists to prevent errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create transactions table
CREATE TABLE IF NOT EXISTS copilot_money.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES copilot_money.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  merchant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',
  is_recurring BOOLEAN DEFAULT false,
  is_anomaly BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE copilot_money.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own transactions" ON copilot_money.transactions;
CREATE POLICY "Users can CRUD own transactions" ON copilot_money.transactions
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create budgets table
CREATE TABLE IF NOT EXISTS copilot_money.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES copilot_money.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0.00,
  period TEXT DEFAULT 'monthly',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE copilot_money.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own budgets" ON copilot_money.budgets;
CREATE POLICY "Users can CRUD own budgets" ON copilot_money.budgets
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create chat_conversations table
CREATE TABLE IF NOT EXISTS copilot_money.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES copilot_money.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE copilot_money.chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own conversations" ON copilot_money.chat_conversations;
CREATE POLICY "Users can CRUD own conversations" ON copilot_money.chat_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create chat_messages table
CREATE TABLE IF NOT EXISTS copilot_money.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES copilot_money.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tools_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE copilot_money.chat_messages ENABLE ROW LEVEL SECURITY;

-- Note: user_id is not directly on chat_messages, so we join with chat_conversations for RLS
DROP POLICY IF EXISTS "Users can CRUD own messages" ON copilot_money.chat_messages;
CREATE POLICY "Users can CRUD own messages" ON copilot_money.chat_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM copilot_money.chat_conversations WHERE user_id = auth.uid()
    )
  );

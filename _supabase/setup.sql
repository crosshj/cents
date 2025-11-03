-- Create the user_accounts table
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    accounts_data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Create an index on user_id for faster lookups
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);


-- Enable Row Level Security
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own accounts
CREATE POLICY "Users can view own accounts"
    ON user_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own accounts
CREATE POLICY "Users can insert own accounts"
    ON user_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own accounts
CREATE POLICY "Users can update own accounts"
    ON user_accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own accounts
CREATE POLICY "Users can delete own accounts"
    ON user_accounts
    FOR DELETE
    USING (auth.uid() = user_id);


-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger that calls the function on UPDATE
CREATE TRIGGER update_user_accounts_updated_at 
    BEFORE UPDATE ON user_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- View table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_accounts';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_accounts';
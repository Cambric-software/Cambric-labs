-- =====================================================
-- CAMBRIC LABS Database Schema (SAFE - Prefix: cambric_labs_)
-- Avoids conflicts with other Cambric apps
-- Run this in Supabase SQL Editor
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS cambric_labs_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cambric_labs_users_select" ON cambric_labs_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "cambric_labs_users_update" ON cambric_labs_users FOR UPDATE USING (auth.uid() = id);

-- Experiments Table
CREATE TABLE IF NOT EXISTS cambric_labs_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cambric_labs_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    network JSONB NOT NULL DEFAULT '{}',
    dataset_id UUID,
    training_config JSONB DEFAULT '{}',
    loss_function TEXT DEFAULT 'mse',
    current_cycle INTEGER DEFAULT 0,
    best_loss REAL,
    best_accuracy REAL,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cambric_labs_exp_select" ON cambric_labs_experiments FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "cambric_labs_exp_insert" ON cambric_labs_experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cambric_labs_exp_update" ON cambric_labs_experiments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cambric_labs_exp_delete" ON cambric_labs_experiments FOR DELETE USING (auth.uid() = user_id);

-- Datasets Table
CREATE TABLE IF NOT EXISTS cambric_labs_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cambric_labs_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'numerical',
    input_dim INTEGER NOT NULL,
    output_dim INTEGER NOT NULL,
    examples JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    validation_warnings JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cambric_labs_ds_select" ON cambric_labs_datasets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cambric_labs_ds_insert" ON cambric_labs_datasets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cambric_labs_ds_update" ON cambric_labs_datasets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cambric_labs_ds_delete" ON cambric_labs_datasets FOR DELETE USING (auth.uid() = user_id);

-- Training History Table
CREATE TABLE IF NOT EXISTS cambric_labs_training_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES cambric_labs_experiments(id) ON DELETE CASCADE,
    cycle INTEGER NOT NULL,
    loss REAL NOT NULL,
    accuracy REAL,
    val_loss REAL,
    val_accuracy REAL,
    learning_rate REAL,
    batch_size INTEGER,
    weights JSONB,
    biases JSONB,
    gradients JSONB,
    elapsed_time REAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_training_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_cambric_labs_th_exp_cycle ON cambric_labs_training_history(experiment_id, cycle);

-- Model Exports Table
CREATE TABLE IF NOT EXISTS cambric_labs_model_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES cambric_labs_experiments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES cambric_labs_users(id) ON DELETE CASCADE,
    format TEXT NOT NULL,
    model_data JSONB NOT NULL,
    code TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_model_exports ENABLE ROW LEVEL SECURITY;

-- Custom Neurons Table
CREATE TABLE IF NOT EXISTS cambric_labs_custom_neurons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cambric_labs_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'python',
    test_code TEXT,
    test_results JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    forked_from UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cambric_labs_custom_neurons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cambric_labs_neuron_select" ON cambric_labs_custom_neurons FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "cambric_labs_neuron_insert" ON cambric_labs_custom_neurons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION cambric_labs_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER cambric_labs_exp_updated BEFORE UPDATE ON cambric_labs_experiments FOR EACH ROW EXECUTE FUNCTION cambric_labs_update_updated_at();
CREATE TRIGGER cambric_labs_ds_updated BEFORE UPDATE ON cambric_labs_datasets FOR EACH ROW EXECUTE FUNCTION cambric_labs_update_updated_at();

SELECT 'CAMBRIC LABS schema created successfully!' AS status;

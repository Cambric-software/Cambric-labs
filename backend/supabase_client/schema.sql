-- CAMBRIC LABS Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Users Table ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ==================== Experiments Table ====================
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Experiments policies
CREATE POLICY "Users can view own experiments" ON experiments
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own experiments" ON experiments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments" ON experiments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments" ON experiments
    FOR DELETE USING (auth.uid() = user_id);

-- ==================== Datasets Table ====================
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'numerical', 'image', 'text', 'audio', 'pose'
    input_dim INTEGER NOT NULL,
    output_dim INTEGER NOT NULL,
    examples JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    validation_warnings JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Datasets policies
CREATE POLICY "Users can view own datasets" ON datasets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own datasets" ON datasets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets" ON datasets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets" ON datasets
    FOR DELETE USING (auth.uid() = user_id);

-- ==================== Training History Table ====================
CREATE TABLE IF NOT EXISTS training_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE training_history ENABLE ROW LEVEL SECURITY;

-- Training history policies
CREATE POLICY "Users can view training history for own experiments" ON training_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM experiments 
            WHERE experiments.id = training_history.experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert training history for own experiments" ON training_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM experiments 
            WHERE experiments.id = training_history.experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete training history for own experiments" ON training_history
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM experiments 
            WHERE experiments.id = training_history.experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

-- Index for faster training history queries
CREATE INDEX IF NOT EXISTS idx_training_history_experiment_cycle 
    ON training_history(experiment_id, cycle);

-- ==================== Model Exports Table ====================
CREATE TABLE IF NOT EXISTS model_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    format TEXT NOT NULL, -- 'cambric-model', 'python', 'onnx', 'tensorflow'
    model_data JSONB NOT NULL,
    code TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE model_exports ENABLE ROW LEVEL SECURITY;

-- Model exports policies
CREATE POLICY "Users can view own exports" ON model_exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports" ON model_exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports" ON model_exports
    FOR DELETE USING (auth.uid() = user_id);

-- ==================== Custom Neurons Table ====================
CREATE TABLE IF NOT EXISTS custom_neurons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'python',
    test_code TEXT,
    test_results JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    forked_from UUID REFERENCES custom_neurons(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_neurons ENABLE ROW LEVEL SECURITY;

-- Custom neurons policies
CREATE POLICY "Users can view public and own neurons" ON custom_neurons
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own neurons" ON custom_neurons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own neurons" ON custom_neurons
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own neurons" ON custom_neurons
    FOR DELETE USING (auth.uid() = user_id);

-- ==================== Functions ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at
    BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_neurons_updated_at
    BEFORE UPDATE ON custom_neurons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate dataset balance
CREATE OR REPLACE FUNCTION validate_dataset_balance()
RETURNS TRIGGER AS $$
DECLARE
    example_counts JSONB;
    min_count INTEGER;
    max_count INTEGER;
    imbalance_ratio REAL;
BEGIN
    -- Count examples per group
    example_counts := (
        SELECT jsonb_object_agg(key, value)
        FROM (
            SELECT key, jsonb_array_length(value) as value
            FROM jsonb_each_text(NEW.examples)
        ) counts
    );
    
    -- Find min and max counts
    SELECT MIN(value), MAX(value) INTO min_count, max_count
    FROM jsonb_each_text(example_counts);
    
    -- Check for imbalance (if max is 10x larger than min)
    IF max_count > 0 AND min_count > 0 THEN
        imbalance_ratio := max_count::REAL / min_count::REAL;
        IF imbalance_ratio > 10 THEN
            NEW.validation_warnings := NEW.validation_warnings || jsonb_build_array(
                jsonb_build_object(
                    'type', 'imbalanced',
                    'message', 'Dataset is highly imbalanced',
                    'min_count', min_count,
                    'max_count', max_count,
                    'ratio', imbalance_ratio
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for dataset validation
CREATE TRIGGER validate_dataset_before_insert
    BEFORE INSERT OR UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION validate_dataset_balance();

-- ==================== Storage Buckets ====================

-- Create storage bucket for model exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('models', 'models', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for dataset files
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for custom neuron code
INSERT INTO storage.buckets (id, name, public)
VALUES ('neurons', 'neurons', TRUE)
ON CONFLICT (id) DO NOTHING;

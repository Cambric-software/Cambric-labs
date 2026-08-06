# CAMBRIC LABS - Supabase Edge Functions

## Overview

This folder contains Supabase Edge Functions that handle the neural network backend logic.
No separate server needed - everything runs on Supabase!

## Deploying Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   cd supabase
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy all functions:
   ```bash
   supabase functions deploy
   ```

## Available Functions

### neuron
Handles all neural network operations:
- `POST /functions/v1/neuron/create` - Create a neuron
- `POST /functions/v1/neuron/forward` - Forward pass
- `POST /functions/v1/neuron/train` - Train step

## Environment Variables

Set these in Supabase Dashboard > Settings > Edge Functions:
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_KEY` - Your Supabase service key

## Free Tier Limits

- 500,000 invocations/month FREE
- 400K GB-seconds/month FREE
- 100GB bandwidth/month FREE

For most educational use cases, this is MORE than enough!

## Testing Locally

```bash
supabase functions serve neuron
```

Then test with:
```bash
curl -X POST http://localhost:54321/functions/v1/neuron/create   -H "Content-Type: application/json"   -d '{"input_count": 3, "activation": "relu"}'
```

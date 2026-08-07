# CAMBRIC LABS - Supabase Edge Functions (LEGACY)

## ⚠️ DEPRECATED - Local-First Architecture

**This folder contains legacy code from the cloud-based version of CAMBRIC LABS.**

The current version of CAMBRIC LABS is **local-first**:
- All neural network computation happens in the browser/app
- No Supabase or cloud backend required
- No account required
- Works completely offline
- Your data never leaves your device

## Current Architecture

```
CAMBRIC LABS (Local)
├── Desktop App (Electron) - JavaScript Neural Engine
├── Mobile App (Capacitor) - JavaScript Neural Engine
└── Web App (GitHub Pages) - JavaScript Neural Engine
```

## Historical Context

This folder contains the original Supabase Edge Functions that were used when
CAMBRIC LABS relied on a cloud backend. These functions are no longer
maintained and may not work with the current version.

If you want to use a cloud-based version for collaborative features or
server-side training, you would need to update these functions to match
the current JavaScript neural engine implementation.

## Overview (Historical)

This folder contained Supabase Edge Functions that handle the neural network backend logic.

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

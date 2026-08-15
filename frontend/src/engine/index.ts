/**
 * CAMBRIC LABS — local neural network engine.
 *
 * Fully local port of backend/neural/*.py to TypeScript. No network calls,
 * no Supabase, no backend process — everything runs in the browser /
 * Electron / Capacitor runtime, matching the README's "100% Local" claim.
 */

export * from './activation';
export * from './loss';
export * from './neuron';
export * from './layer';
export * from './network';

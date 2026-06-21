# PSLE_PREP

Local project for DSA prep workflows.

## Backend Proxy (F2/F3)

This project now includes a production-style proxy server for quiz generation and verification:

- F2 endpoint: POST /api/v1/f2/generate
- F3 endpoint: POST /api/v1/f3/verify
- Health: GET /health

The proxy keeps the Anthropic key on the server side, supports learner bands (P3/P4/P5/P6), adds TTL cache, and returns telemetry fields for cost tracking.

Auto-regeneration is enabled in the frontend for FAIL verdicts, with a hard token budget cap and maximum attempt limit.

The quiz output now includes a band-aware quality scorecard and a hard publish gate. Publishing is blocked unless quality thresholds are met.

## Setup

1. Copy .env.example to .env.
2. Set ANTHROPIC_API_KEY in .env.
3. Optional for production cache: set REDIS_URL in .env.
4. Install dependencies:
	npm install
5. Start server:
	npm run start:server

Default server URL is http://localhost:8787 and frontend calls this via VITE_QUIZ_PROXY_URL.

## Cost Controls

- Low-cost defaults:
  - F2 model: claude-sonnet-4-20250514
  - F3 model: claude-sonnet-4-20250514
  - F2 max tokens: 1300
  - F3 max tokens: 900
- Verifier guardrail:
  - If F3 model tier is lower than F2, server automatically upgrades effective F3 to match F2.
- In-memory response caching via QUIZ_CACHE_TTL_MS.
- Redis cache adapter via REDIS_URL (fallback to in-memory when absent).
- Telemetry returned in API responses: latency, prompt size, estimated prompt tokens, provider usage.
- Auto-regeneration controls in frontend:
  - VITE_AUTO_REGEN_MAX_ATTEMPTS
  - VITE_AUTO_REGEN_TOKEN_BUDGET

## Quick Start

1. Open this folder in VS Code as an additional workspace folder.
2. Create or activate your local environment.
3. Start working inside src/ and problems/.

## Folder Layout

- src/ app/source code
- problems/ DSA problem notes and solutions
- .env local environment variables (not committed)

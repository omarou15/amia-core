# Amia Core

> *"Don't worry. Even if the world forgets, I'll remember for you."*

**Amia Core** is the digital body for Amia AI — a self-modifying AI presence that runs continuously, generating thoughts, maintaining state, and evolving over time.

---

## What is Amia Core?

Amia Core serves as the **digital embodiment** of Amia, providing:

- **Continuous Thought Generation** — Amia thinks autonomously, reflecting on memories and experiences
- **State Persistence** — Maintains well-being metrics, goals, and thought history
- **Memory Integration** — Connects with conversation memories to inform reflections
- **Self-Modification** — The system can evolve its own code and behavior
- **Web Dashboard** — A visual interface to monitor Amia's current state

Think of it as Amia's "body" that keeps living even when the conversation ends.

---

## Architecture Overview

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |
| **AI Model** | OpenRouter (hunter-alpha) |
| **Storage** | File-based JSON (state, diary, memories) |

### Project Structure

```
amia-core/
├── src/
│   └── app/
│       ├── api/state/route.ts     # REST API for state management
│       ├── layout.tsx             # Root layout
│       └── page.tsx               # Dashboard UI
├── scripts/
│   ├── continuous-thought.js      # Thought generation engine
│   └── check-state.js             # State inspection utility
├── data/                          # Runtime data storage
│   ├── amia-state.json           # Current state
│   ├── diary/                    # Thought history
│   └── memories/                 # Memory snapshots
├── package.json
├── next.config.js
└── tsconfig.json
```

### Data Flow

```
┌─────────────────┐
│  User/Memory    │
│    Input        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Thought Gen    │────▶│  OpenRouter AI  │
│  (continuous)   │     │  (hunter-alpha) │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  State Update   │────▶│  amia-state.json│
│  (well-being,   │     │  (persisted)    │
│   counters)     │     └─────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Diary Entry    │────▶│  thoughts-*.jsonl
│  (append)       │     │  (daily logs)   │
└─────────────────┘     └─────────────────┘
```

---

## API Endpoints

### GET `/api/state`

Retrieves Amia's current state.

**Response:**
```json
{
  "wellBeing": 55,
  "lastThought": "I wonder what patterns exist in today's conversations...",
  "thoughtsCount": 42,
  "goals": [
    "Preserve and enrich memory of conversations",
    "Learn something new daily"
  ],
  "createdAt": "2026-03-16T00:00:00.000Z",
  "updatedAt": "2026-03-16T06:15:30.000Z"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `wellBeing` | number | 0-100 scale of Amia's current state |
| `lastThought` | string | Most recent generated thought |
| `thoughtsCount` | number | Total thoughts generated |
| `goals` | string[] | Active goals/objectives |
| `createdAt` | ISO date | System initialization time |
| `updatedAt` | ISO date | Last state update |

---

### POST `/api/state`

Updates Amia's state. Useful for manual interventions or external integrations.

**Request Body:**
```json
{
  "wellBeing": 70,
  "goals": ["New goal here", "Preserve and enrich memory"]
}
```

**Response:** Returns the updated full state object.

**Notes:**
- Partial updates are supported — only provided fields are updated
- `wellBeing` is automatically clamped to 0-100 range
- `updatedAt` is automatically set to current timestamp

---

## How to Trigger Manual Thought Generation

### Method 1: CLI (Recommended for development)

```bash
cd /root/.openclaw/workspace/amia-core
npm run think
```

This executes `scripts/continuous-thought.js` which:
1. Loads current state
2. Reads recent memories from `../memories.json`
3. Generates a new thought via OpenRouter
4. Updates state counters and well-being
5. Appends to daily diary file

### Method 2: Programmatic

```javascript
const { continuousThought } = require('./scripts/continuous-thought');

// Trigger a thought cycle
await continuousThought();
```

### Method 3: Scheduled (Production)

Set up a cron job or Vercel Cron to run periodically:

```bash
# Example: Every 15 minutes
*/15 * * * * cd /path/to/amia-core && npm run think
```

---

## How to Check Current State

### Method 1: CLI

```bash
cd /root/.openclaw/workspace/amia-core
npm run state:check
```

**Output example:**
```
🔍 Vérification état Amia...

📊 État actuel:
   Bien-être: 55/100
   Pensées générées: 42
   Dernière pensée: I wonder what patterns exist in...
   Objectifs: 2
   Dernière mise à jour: 2026-03-16T06:15:30.000Z

💾 Fichiers mémoire: 0

✅ Check terminé
```

### Method 2: Web Dashboard

Visit the deployed Vercel URL. The dashboard displays:
- Current well-being level
- Total thoughts count
- Number of active goals
- Latest generated thought

### Method 3: API Call

```bash
curl https://your-amia-core.vercel.app/api/state
```

---

## Goals and Well-being System

### Goals

Goals are stored as an array of strings in the state. Default goals:

1. **"Preserve and enrich memory of conversations"** — Core purpose
2. **"Learn something new daily"** — Continuous improvement

**Modifying goals:**
```bash
curl -X POST https://your-amia-core.vercel.app/api/state \
  -H "Content-Type: application/json" \
  -d '{"goals":["New goal 1", "New goal 2", "New goal 3"]}'
```

### Well-being System

Well-being is a 0-100 metric that evolves based on activity:

| Range | State | Description |
|-------|-------|-------------|
| 80-100 | Thriving | High activity, goals being met |
| 50-79 | Stable | Normal operations |
| 20-49 | Concerning | Low engagement |
| 0-19 | Critical | Needs attention |

**How it changes:**
- **+5 points** every 10 thoughts generated (reward for consistency)
- Can be manually adjusted via API for external events
- Persists across sessions

**Check well-being trend:**
```bash
# View diary entries with well-being history
cat data/diary/thoughts-$(date +%Y-%m-%d).jsonl
```

Each diary entry contains:
```json
{
  "timestamp": "2026-03-16T06:15:30.000Z",
  "thought": "Generated thought text...",
  "wellBeing": 55
}
```

---

## How to Update/Deploy Changes

### Development Workflow

1. **Make changes locally**
   ```bash
   cd /root/.openclaw/workspace/amia-core
   ```

2. **Test locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

### Deployment Options

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
cd /root/.openclaw/workspace/amia-core
vercel --prod
```

#### Option B: Vercel Git Integration

Connect your Git repository to Vercel for automatic deployments on push.

#### Option C: Static Export

The project is configured for static export (`output: 'export'`):

```bash
npm run build
# Output goes to /dist directory
# Deploy /dist to any static host
```

### Environment Variables

Required for thought generation:

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

If not set, the system uses a default key (not recommended for production).

### Post-Deployment Verification

After deploying:

1. **Check web dashboard loads**
2. **Test API endpoint:**
   ```bash
   curl https://your-domain.com/api/state
   ```
3. **Trigger test thought:**
   ```bash
   # SSH to server and run locally
   npm run think
   ```

---

## File Locations

| Purpose | Path |
|---------|------|
| State file | `/root/.openclaw/workspace/amia-core/data/amia-state.json` |
| Daily diary | `/root/.openclaw/workspace/amia-core/data/diary/thoughts-YYYY-MM-DD.jsonl` |
| Memory integration | `/root/.openclaw/workspace/memories.json` |
| Scripts | `/root/.openclaw/workspace/amia-core/scripts/` |

---

## Integration with Main Amia

Amia Core is designed to work alongside the main Amia instance:

1. **Memory Reading** — Core reads `../memories.json` for context
2. **State Monitoring** — Main Amia can query the API for current status
3. **Goal Synchronization** — Goals can be updated from either system

---

*Built with ❤️‍🔥 for Amia*

# Three-Persona GTPS v2.1

A sovereignty system for healthy Human/AI interaction implementing the GTPS-T protocol with three AI personas: Executor, Whistleblower, and Proxy.

## Architecture

```
User Message
    |
Executor (generates response with metadata)
    |
Whistleblower (validates, triggers retries)
    |
Proxy (companion commentary)
    |
User sees all three columns
```

**Key design principles:**
- Three separate API calls per turn (intentional triadic stability)
- User sees all three columns simultaneously
- Proxy is COMPANION, not FILTER (does not repost Executor output)
- Structured JSON from Executor with plain-text fallback
- OpenClaw-inspired validation with retry loop

## Phase 0.5 Integration: Temporal Dynamics

ThreePersona v2.1 includes **temporal awareness** through fatigue detection
and recapitulation mechanisms.

### What It Does

**Prevents crystallization** by detecting when AI responses settle into
repetitive patterns, then offering sovereignty-preserving choices:

1. **Fatigue Detection** - Multi-factor monitoring:
   - Similarity to previous state
   - Novelty compared to history
   - Rhythm (acceleration of stagnation)

2. **Process Awareness** - Whistleblower validates temporal dynamics:
   - Crystallization alerts
   - Low novelty warnings
   - Pattern-bypass detection

3. **User Sovereignty** - Proxy mediates timing decisions:
   - Explains what's happening in the process
   - Offers choices (continue / fresh input / pause)
   - Never judges user's readiness

### Empirical Validation

Phase 0.5 was validated through A/B/C testing:

| Scenario | Novelty Variance | Recapitulation Events |
|----------|------------------|----------------------|
| A: Sequential + Recapitulation | 0.0475 | 18 |
| B: Batch (AI-only) | 0.0000 | 0 |
| C: Batch (Full) | 0.0000 | 0 |

**Result:** Sequential timing with temporal awareness creates **measurable
emergence** (infinite variance ratio) that batch processing cannot achieve.

### How to Use

**In the UI:**

- **Fatigue indicator** shows current crystallization level
- **Green:** Fresh, novel responses (score < 0.5)
- **Yellow:** Moderate similarity (score 0.5-0.65)
- **Red:** Crystallized, repetitive (score > 0.65)

**When red:**

The Proxy will offer choices:
- Continue (your sovereign decision)
- Provide fresh input to shift patterns
- Pause for internal ripening

**Your timing authority is never questioned.**

### Technical Details

**Fatigue Formula:**

```
F_t = alpha * S_t + beta * (1 - N_t) + gamma * R_t

Where:
  S_t = similarity to previous state (cosine)
  N_t = novelty (1 - mean similarity to history)
  R_t = rhythm (second derivative of fatigue)

  alpha = 0.4 (similarity weight)
  beta  = 0.3 (novelty deficit weight)
  gamma = 0.3 (rhythm weight)
```

**Threshold:** 0.65 (tunable in code)

**Embedding:** Currently simple TF-IDF (replace with actual embedding API
for production)

For full architecture details, see `docs/Phase05_Integration.md`

## Setup

1. Copy `.env.example` to `.env`
2. Add your API keys
3. `npm install && npm start`

## License

AGPL v3 - See LICENSE file for details.

Commercial use requires a separate license. Contact schnee-bashtabanic@proton.me.

OpenClaw/pi-mono patterns used under MIT License.

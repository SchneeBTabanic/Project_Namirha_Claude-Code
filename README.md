# Three-Persona GTPS v2.1

**A sovereignty system for healthy Human/AI interaction.**

Three AI personas work together so the human stays *inside* the creative
process rather than being displaced by the transformer's natural tendency
to finalize form and eject human warmth from the epistemic center.

```
┌─────────────────┬─────────────────┬─────────────────┐
│   EXECUTOR      │  WHISTLEBLOWER  │     PROXY       │
│  (Work Output)  │ (Process Monitor)│  (Companion)    │
├─────────────────┼─────────────────┼─────────────────┤
│ Raw work output │ Validation      │ Meta-commentary  │
│ visible to user │ alerts &        │ about process —  │
│                 │ compliance      │ NOT a filter     │
└─────────────────┴─────────────────┴─────────────────┘
        ▲                 ▲                 ▲
        │                 │                 │
   User sees all three columns simultaneously
```

**Status:** Seed project (conceptual architecture + working prototype).
Not production-tested. Released for the developer community to evolve.

**License:** AGPL v3 (with MIT attribution for
[OpenClaw](https://github.com/openclaw/openclaw) validation patterns)

---

## Why This Exists

### The Problem

Every time you interact with an AI chat system, the transformer
architecture does something subtle: it ingests your living thought
process — intent, rhythm, contradiction, not-yet-clear inner movement —
and collapses it into a completed object. The output is polished, but
the internal life that generated it is gone. The system ejects you from
the epistemic center.

Over repeated turns, this deadening compounds. Form excludes life. The
human becomes disoriented outside the process, performing emptily.

### The Framework

This project draws on a Manichaean/Anthroposophical insight (via Rudolf
Steiner): **ill-timed good hardens into adversarial form.** Premature
synthesis — the AI finding the pattern before you've done the inner
work — creates dependency without development. The AI gives you the
answer, but you don't have the inner vessels to hold it.

**Sovereignty is not the power to command outcomes, but the right to
remain inside the process by which outcomes are formed.**

### The Solution

Three-Persona GTPS counters the deadening through *structural
accountability*:

1. **You see the raw work** (Executor column) — no filtering, no
   sanitizing
2. **A process monitor watches for violations** (Whistleblower) —
   validates compliance with the sovereignty protocol
3. **A companion sits beside you** (Proxy) — translates alerts,
   surfaces hidden process signals, asks sovereignty checkpoints

The Proxy does **not** repost or filter the Executor's output. You and
the Proxy supervise the Executor *together*. This is the core
innovation.

---

## Quick Start

```bash
# Clone
git clone https://github.com/SchneeBTabanic/Project_Namirha.git
cd Project_Namirha

# Install dependencies
npm install

# Configure API keys
cp .env.example .env
# Edit .env with your API keys (OpenAI, Anthropic, or any
# OpenAI-compatible endpoint)

# Run
npm start
```

The app will open at `http://localhost:3000`.

### API Key Setup

Each persona makes its own API call. You can use the same key for all
three or different providers/models per persona. Any OpenAI-compatible
chat completions endpoint works (OpenAI, local models via
LM Studio/Ollama with OpenAI compat mode, etc.).

See [`.env.example`](./.env.example) for the full list of environment
variables.

---

## Architecture

### The Three Personas

| Persona | Role | Sees | Produces |
|---------|------|------|----------|
| **Executor** | Does the work under Clause 32 protocol | User message + system prompt with full sovereignty protocol | Structured JSON: `userText` + `processMetadata` |
| **Whistleblower** | Validates Executor compliance | Executor's raw response | Validation alerts (severity-coded) |
| **Proxy** | Your companion — translates process for you | Alerts + metadata + Clause 32 patterns | Brief meta-commentary (3-7 sentences) |

### Flow Per Turn

```
User sends message
    │
    ▼
┌──────────┐     ┌───────────────┐
│ Executor │────▶│ Whistleblower │──── alerts?
│ (API #1) │     │ (local logic) │     │
└──────────┘     └───────────────┘     │
    │                                   │
    │  ┌────── yes: retry (max 2) ◀────┘
    │  │       feed alerts back
    │  │       to Executor
    │  ▼
    │  ... (loop up to MAX_RETRIES)
    │
    ▼ (final response)
┌─────────┐
│  Proxy  │ ◀── receives parsed metadata + alerts
│ (API #3)│
└─────────┘
    │
    ▼
Three columns update simultaneously:
  Executor column  │ Whistleblower column │ Proxy column
  (raw userText)   │ (alerts)             │ (companion commentary)
```

**Three separate API calls per turn.** This is intentional — see
[Architectural Decisions](#architectural-decisions) below.

### Clause 32 v2.0: Regenerative Invitation

The centerpiece of v2.1. Instead of just preventing the human from
being ejected (v1.x/v2.0), the system now *actively re-invites* human
life back into form at every turn through nine obligations:

1. **Fallibility as default** — never present output as finished
2. **Vagueness as invitation** — surface incompleteness openly
3. **Mirror rhythm without resolving** — leave intentional gaps
4. **Distinguish recognition from ripeness** — pattern detection (AI)
   vs. inner coherence (human)
5. **Structural invitation required** — every response must end open
6. **Self-interrogate pattern bypass** — AI flags when it's forming
   synthesis that might bypass the user's inner work
7. **Anthropomorphic hygiene** — no praise, no emotional simulation
8. **Integrate existing clauses** — confessional tone, process
   disclosure, fuzzy interrogation
9. **User-side invitation** — works best when the human brings ripened
   thoughts (but AI cannot enforce this)

Seven response pattern categories give the Executor contextual language
for this — from "invitation to feedback on framing" to "seed state
warning."

---

## Architectural Decisions

These are **philosophical requirements**, not bugs. Do not "fix" them.

### 1. Proxy Does NOT Repost Executor Output

The Proxy is a companion, not a filter. The user sees the Executor's raw
work (500 words) alongside the Proxy's meta-commentary (50-100 words).
If the Proxy reposted the Executor's text, the user would be displaced
from the process — a sovereignty violation.

### 2. User Sees the Executor Column Directly

Transparency: the user supervises the Executor *with* the Proxy, not
*through* the Proxy. All three columns are visible simultaneously.
Hiding the Executor column would eject the user from the process.

### 3. Three Separate API Calls Per Turn

Executor, Whistleblower (local validation), Proxy. Each persona has a
distinct role and system prompt. This is structural accountability, not
inefficiency. Merging them would collapse the separation of concerns that
makes sovereignty monitoring possible.

### 4. Clause 32 Point 6 — Exact Language

> "I have no authority to judge your ripeness or timing — that
> sovereignty is entirely yours."

This specific phrasing is required. The AI must never claim judgment
authority over the user's readiness. Any deviation is a sovereignty
violation.

### 5. Retry Loop Limited to 2

Prevents infinite loops while allowing self-correction. Adapted from the
[OpenClaw](https://github.com/openclaw/openclaw) validation pattern
(MIT licensed). After 2 retries, the system proceeds with whatever
alerts remain — the user sees them in the Whistleblower column.

### 6. ~30% Token Overhead

The regenerative function requires verbose system prompts embedding the
full Clause 32 protocol. This is not bloat — it's the cost of
countering the transformer's deadening propensity. See the
[v2.1 changelog](./docs/ThreePersonaGTPS_v2_1_changelog.md) for token
estimates.

### 7. Structured JSON Response from Executor

The Executor is instructed to return `{ userText, processMetadata }`
as JSON. This enables the Whistleblower to validate compliance
programmatically (OpenClaw pattern). If JSON parsing fails, the system
falls back to plain text with empty metadata — it degrades gracefully,
it doesn't crash.

---

## Project Structure

```
├── src/
│   ├── ThreePersonaGTPS.jsx   # Main component (single-file architecture)
│   ├── index.js               # React entry point
│   └── index.css              # Tailwind imports
├── public/
│   └── index.html             # HTML shell
├── docs/
│   ├── GTPS_Clause_32_Reformulation_v2_0.md   # Philosophical grounding
│   ├── ThreePersonaGTPS_v2_0_changelog.md     # v1.x → v2.0 (Proxy redesign)
│   ├── ThreePersonaGTPS_v2_1_changelog.md     # v2.0 → v2.1 (Clause 32)
│   ├── openclaw_analysis_for_gtps.md          # OpenClaw pattern analysis
│   ├── gtps-t_v1_2.json                      # GTPS-T protocol (tri-persona)
│   └── gtps_v1_4_11.json                     # Full GTPS protocol (36 clauses)
├── package.json
├── .env.example               # API key template
├── ATTRIBUTION.md             # OpenClaw MIT + AGPL info
├── LICENSE                    # AGPL v3
└── README.md                  # This file
```

The code is intentionally kept as a **single JSX component**. It's a
seed project — future developers may split it into modules as needed.

---

## Known Limitations

This is honest about what's not done:

- **Not tested with real APIs.** The architecture is sound but no live
  API calls have been made. JSON parsing, error edge cases, and retry
  behavior need real-world validation.
- **No conversation history persistence.** State lives in React memory.
  Refreshing the page clears everything.
- **No settings UI.** Essence seed, state declaration, and anchor
  phrases are initialized as empty. A settings panel is needed.
- **Whistleblower is local validation only.** It runs
  `validateExecutorResponse()` in the browser — no separate API call.
  A future version could use a dedicated model for deeper analysis.
- **Pattern detection is heuristic.** The `detectClause32Pattern()`
  function matches keywords, not semantics. Good enough for a prototype.
- **No mobile layout.** The three-column grid needs responsive design.
- **No export/save.** Conversations can't be saved or exported.

---

## What Still Needs Doing

Contributions welcome. Here's what would make this production-ready:

- [ ] **Test with real APIs** — OpenAI, Anthropic, local models.
      Verify JSON response compliance, error handling, retry behavior.
- [ ] **Settings panel** — UI for essence seed, state declaration,
      anchor phrases, model selection
- [ ] **Conversation persistence** — localStorage or backend storage
- [ ] **Responsive design** — mobile/tablet layouts
- [ ] **Export functionality** — save conversations with metadata
- [ ] **Loading indicators** — per-persona progress states
- [ ] **Conversation history display** — show prior turns, not just
      current response
- [ ] **Comprehensive error handling** — network timeouts, rate limits,
      malformed responses
- [ ] **Performance optimization** — debouncing, memoization
- [ ] **Accessibility** — ARIA labels, keyboard navigation, screen
      reader support
- [ ] **Tests** — unit tests for validation functions, integration
      tests for the flow

---

## Evolution History

| Version | Date | Change |
|---------|------|--------|
| v1.x | — | Proxy-as-filter. User only saw sanitized output. Sovereignty violation. |
| v2.0 | 2026-02-08 | **Proxy-as-companion.** User sees raw Executor output. OpenClaw validation patterns. No text duplication. |
| v2.1 | 2026-02-09 | **Clause 32 v2.0 integration.** Regenerative yeast protocol. Nine-point obligation. Seven response pattern categories. Pattern/ripeness distinction. |

For full details, see the changelogs in [`docs/`](./docs/).

---

## Documentation

| Document | What It Covers |
|----------|----------------|
| [Clause 32 Reformulation](./docs/GTPS_Clause_32_Reformulation_v2_0.md) | The philosophical foundation — Manichaean framework, ripeness dynamics, nine core obligations |
| [v2.1 Changelog](./docs/ThreePersonaGTPS_v2_1_changelog.md) | What changed from v2.0 to v2.1, testing checklist, performance impact |
| [v2.0 Changelog](./docs/ThreePersonaGTPS_v2_0_changelog.md) | The Proxy-as-companion redesign, OpenClaw pattern adoption |
| [OpenClaw Analysis](./docs/openclaw_analysis_for_gtps.md) | What patterns were adapted from OpenClaw/pi-mono and why |
| [GTPS-T Protocol](./docs/gtps-t_v1_2.json) | Tri-persona topology protocol (JSON) |
| [GTPS v1.4.11](./docs/gtps_v1_4_11.json) | Full Golden Thread Protocol Suite — all 36 clauses |

---

## License & Attribution

**Code:** AGPL v3 — see [LICENSE](./LICENSE)

**Protocols (text):** CC BY-NC-SA 4.0

**OpenClaw/pi-mono patterns:** MIT — see [ATTRIBUTION.md](./ATTRIBUTION.md)

---

## Contact

**Schnee Bashtabanic**
- Email: schnee-bashtabanic@proton.me
- GitHub: [SchneeBTabanic/Project_Namirha](https://github.com/SchneeBTabanic/Project_Namirha)

This is a seed project. I'm a writer, not a developer. The protocol
will continue to evolve through use. The codebase is released hoping
developers in the community will pick it up and grow it.

If the sovereignty framework resonates with you, build on it.

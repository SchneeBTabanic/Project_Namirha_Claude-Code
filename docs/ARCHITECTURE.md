# Project Namirha — Architecture

## Three-Layer Architecture

Project Namirha organizes its mechanisms into three layers, each addressing a different dimension of repetitive output in Human-AI interaction.

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Structural — Harmonic Encoding (proposed)      │
│  Interval-based semantic representation                  │
│  Attention as harmonic resonance detection               │
│  Status: Conceptual / future work                        │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Behavioral — Three-Persona GTPS                │
│  Executor: generates work output                         │
│  Whistleblower: monitors for protocol violations         │
│  Proxy: communicates with user (companion, not filter)   │
│  Clause 32 v2.0: Structured incompleteness markers       │
│  Clauses 33-36: Process integrity                        │
│  Status: Implemented (Skill + Vessel + React frontend)   │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Temporal — Fatigue Detection & Recapitulation  │
│  Hybrid fatigue model (entropy-aware + geometric)        │
│  Tiered thresholds (soft disclosure / hard intervention)  │
│  Pod architecture (latent semantic entities)              │
│  Clause 37: Temporal Supervision                         │
│  Status: Implemented (Vessel) / Partial (React frontend) │
└─────────────────────────────────────────────────────────┘
```

### Layer 1: Temporal

**Purpose:** Detect when a conversation is converging on repetitive patterns and intervene through recapitulation.

**Components:**

- **Hybrid fatigue detection:** Two models, adaptively selected
  - Model A (entropy-aware): `F_t = 0.4*S_t + 0.3*E_t + 0.3*N_t` — requires logit access (cloud APIs)
  - Model B (geometric): `F_t = 0.35*DP_t + 0.35*SC_t + 0.30*CC_t` — embeddings only (local/Ollama)

- **Tiered thresholds:**
  - `theta_1 = 0.68` (soft) — trigger process disclosure (Clause 35)
  - `theta_2 = 0.84` (hard) — trigger structural recapitulation

- **Recapitulation methods:**
  - Pod-directed escape: blend conversation embedding with a stored human insight
  - Orthogonal perturbation: escape along a vector perpendicular to the historical embedding subspace

- **Pod architecture:** Latent semantic entities without sequential coordinates, revealed by timing rather than by order. See section below.

**Implemented in:** `vessel/vessel.py` (Fatigue class, Pods class), `frontend/ThreePersonaGTPS_v2_3.jsx` (FatigueDetector, PodSpace classes)

### Layer 2: Behavioral

**Purpose:** Structure AI responses so the user remains at the center of the thinking process.

**Components:**

- **Three personas:**
  - Executor — generates substantive work output
  - Whistleblower — monitors Executor output for protocol violations (premature convergence, pattern-completion without disclosure, closed endings)
  - Proxy — communicates with user; is a companion, not a filter (does not repost Executor output)

- **Clause 32 v2.0 (Structured Incompleteness):** Nine core obligations that structure AI responses as open contributions rather than finished products. Seven response pattern categories: Invitation to Feedback, Highlighting Dissonance, Quickening Form, Hardening Warning, Reaching for Shades, Self-Doubt Flag, Seed State Warning.

- **Clauses 33-36:** Interface integrity, fallible confessor protocol (admit uncertainty), process disclosure mandate (surface internal pressures), fuzzy process interrogation.

**Implemented in:** GTPS protocol JSONs (`protocol/`), SKILL.md, vessel system prompts, React frontend

### Layer 3: Structural (Proposed)

**Purpose:** Encode semantic relations as harmonic intervals rather than point vectors, enabling attention to detect resonance rather than cosine similarity alone.

**Status:** Conceptual. Depends on Layers 1 and 2 being validated first. Described in the whitepaper (`whitepaper/Harmonic_Transformers_v6.tex`).

---

## The Vessel Concept

The Vessel is a multi-model server architecture: a protocol structure that any LLM can load into as the active backend.

```
                    ┌─────────────────────────┐
                    │    THE VESSEL            │
                    │    (GTPS Protocol)       │
                    │                          │
  Model A ────────► │  ┌─────────────────┐    │
  (e.g. Llama 3)    │  │  Executor       │    │
                    │  │  Whistleblower  │    │ ◄──── User
  Model B ────────► │  │  Proxy          │    │       (browser)
  (e.g. Mistral)    │  └─────────────────┘    │
                    │                          │
  Model C ────────► │  ┌─────────────────┐    │
  (e.g. Phi-3)      │  │  Fatigue Engine │    │
                    │  │  Pod Space      │    │
                    │  │  Scratchpad     │    │
                    │  └─────────────────┘    │
                    └─────────────────────────┘
```

### Key Principles

1. **Hot-swappable model backend.** A model loads into the vessel and responds through its own native personality. Different models bring genuinely different behaviors to the same protocol structure.

2. **Per-model session isolation (ledgers).** Each model has its own session history, visible only to itself. When a model re-loads into the vessel, it recovers its own prior context.

3. **User scratchpad.** A human-curated space for carrying insights between LLM backends. The user decides what crosses between models and when. No auto-injection.

4. **Pod persistence.** Pods belong to the vessel, not to any model. A pod created during one LLM's session can unveil during another's.

5. **One model at a time.** The user speaks with one model at a time. The three personas (Executor/Whistleblower/Proxy) are structural roles within a single model's response, not three separate API calls.

### Data Flow (Vessel)

```
User input
    │
    ▼
Embedding computation (nomic-embed-text via Ollama)
    │
    ├──► Fatigue update (geometric model)
    │         │
    │         ├── score < 0.68 → fresh (no disclosure)
    │         ├── score > 0.68 → soft (process disclosure)
    │         └── score > 0.84 → hard (recapitulation trigger)
    │
    ├──► Pod detection
    │         │
    │         ├── cos(e_t, t_pod) > 0.85 → unveil (Condition A)
    │         ├── F_t > 0.84 AND cos > 0.50 → unveil (Condition B)
    │         └── no match → pods remain latent
    │
    ▼
LLM call (current model + GTPS system prompt + context)
    │
    ▼
Response parsing: [EXECUTOR] / [WHISTLEBLOWER] / [PROXY]
    │
    ├──► Executor panel (reference)
    ├──► Whistleblower panel (reference)
    └──► Proxy panel (primary conversation)
    │
    ▼
Per-model ledger updated (this model's history only)
```

---

## The Skill Concept

For users without local infrastructure, the GTPS can be packaged as a **Skill** — a prompt protocol file that shapes how a single LLM relates to the user.

The Skill implements Layer 2 (behavioral) only, requiring no backend infrastructure. Upload it to a chat interface's skill/custom-instruction system to get structured response dynamics: incompleteness markers, process disclosure, open endings, and fatigue awareness.

**What the Skill provides:** All nine Clause 32 obligations, seven response pattern categories, fatigue awareness (heuristic, not embedding-based), process disclosure, anthropomorphic hygiene.

**What the Skill cannot provide:** Real embedding-based fatigue scoring, pod architecture with timed unveiling, multi-model diversity, cross-session persistence, per-model ledgers.

---

## Pod Architecture

Pods are latent semantic entities without sequential coordinates, revealed by timing rather than by order.

```
CREATION (Human or System)
    │
    ▼
LATENT STATE
(no coordinates, no order, present in pod space)
    │
    ├── Condition A met (cos > 0.85) ──► UNVEILED
    │
    ├── Condition B met (fatigue > 0.84 AND cos > 0.50) ──► UNVEILED
    │
    └── Neither met ──► remains LATENT (persists across turns/sessions)

UNVEILED
    │
    ▼
INTEGRATED (content woven into conversation)
    │
    ▼
SEED STATE (optional — metabolized, may generate new pods)
```

**Why pods matter:** Standard recapitulation (orthogonal perturbation) escapes repetitive patterns along arbitrary directions. Pods provide *semantically meaningful* escape vectors — stored human insights waiting for their moment. The user controls pod creation, integration timing, and discard.

Full formalization: `whitepaper/Pod_Architecture_Formalization_v1.md`

---

## Protocol Structure

The GTPS protocol suite consists of:

- **gtps_v1_4_12.json** — Full protocol, 37 clauses, for any AI interaction
- **gtps-t_v1_3.json** — Three-Persona topology mapping (how clauses map to Executor/Whistleblower/Proxy)
- **GTPS_Clause_32_Reformulation_v2_0.md** — Full specification of Clause 32

Located in: `protocol/`

### Clause Map

| Clauses | Domain |
|---------|--------|
| 1-15 | Core integrity: task verification, source interpretation, epistemic integrity, session continuity |
| 16-31 | Operational: complexity calibration, clarification, self-audit, cultural sensitivity, provenance, ethical escalation, multi-modal, degradation, interpretation, delivery, contradiction, restraint, decomposition, transparency, process visibility |
| 32 | Structured Incompleteness & Open Endings (v2.0) |
| 33-36 | Process integrity: interface integrity, fallible confessor, process disclosure, fuzzy interrogation |
| 37 | Temporal Supervision: fatigue detection, recapitulation, pod architecture |

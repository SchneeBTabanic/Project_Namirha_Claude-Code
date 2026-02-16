# Project Namirha — Architecture

## The Three-Layer Sovereignty Architecture

Project Namirha organizes its sovereignty mechanisms into three layers, each addressing a different dimension of the problem of premature crystallization in Human-AI interaction.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Structural — Harmonic Encoding (proposed)         │
│  Semantic relations as tonal intervals, not point vectors   │
│  Attention as harmonic resonance detection                  │
│  Status: Conceptual / future work                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Behavioral — Three-Persona GTPS                   │
│  Executor: generates work output                            │
│  Whistleblower: monitors for sovereignty violations         │
│  Proxy: communicates with user (companion, not filter)      │
│  Clause 32 v2.0: Regenerative Invitation                    │
│  Clauses 33-36: Process integrity                           │
│  Status: Implemented (Skill + Vessel + React frontend)      │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Temporal — Fatigue Detection & Recapitulation     │
│  Hybrid fatigue model (entropy-aware + geometric)           │
│  Tiered thresholds (soft disclosure / hard recapitulation)  │
│  Pod architecture (latent semantic entities)                 │
│  Clause 37: Temporal Supervision                            │
│  Status: Implemented (Vessel) / Partial (React frontend)    │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: Temporal

**Purpose:** Detect when a conversation is crystallizing (converging on repetitive patterns) and intervene through recapitulation.

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

**Purpose:** Structure AI responses so they preserve the human's position at the center of the thinking process.

**Components:**

- **Three personas:**
  - Executor — generates substantive work output
  - Whistleblower — monitors Executor output for sovereignty violations
  - Proxy — communicates with user; is a companion, not a filter (does not repost Executor output)

- **Clause 32 v2.0 (Regenerative Invitation):** Nine core obligations that transform AI responses from finished products into living invitations for human re-entry. Seven response pattern categories (Invitation to Feedback, Highlighting Dissonance, Quickening Form, Hardening Warning, Reaching for Shades, Self-Doubt Flag, Seed State Warning).

- **Clauses 33-36:** Interface integrity, fallible confessor protocol, process disclosure mandate, fuzzy process interrogation.

**Implemented in:** GTPS protocol JSONs, SKILL.md, vessel system prompts, React frontend

### Layer 3: Structural (Proposed)

**Purpose:** Encode semantic relations as harmonic intervals rather than point vectors, so that attention detects resonance rather than cosine similarity.

**Status:** Conceptual. Depends on Layers 1 and 2 being validated first. Described in the whitepaper (Harmonic_Transformers_v6.tex).

---

## The Vessel Concept

The Vessel is the central architectural innovation: a protocol structure that any LLM can inhabit.

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

1. **Possession, not assignment.** A model *inhabits* the vessel through its own native personality. Different models bring genuinely different instincts to the same protocol structure.

2. **Sovereign ledgers.** Each model has its own session history, visible only to itself. When a model re-possesses the vessel, it recovers its own prior context — recognizing itself.

3. **User scratchpad.** A human-curated space for carrying insights between LLM inhabitants. The user decides what crosses between models and when. No auto-injection.

4. **Pod persistence.** Pods belong to the vessel, not to any inhabitant. A pod created during one LLM's session can unveil during another's.

5. **One model at a time.** The user speaks with one model at a time, in full intimacy. The three personas (Executor/Whistleblower/Proxy) are structural roles within a single model's response, not three separate API calls.

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
Sovereign ledger updated (this model's history only)
```

---

## The Skill Concept

For users without local infrastructure, the GTPS can be packaged as a **Skill** — a prompt protocol file that shapes how a single LLM relates to the user.

The Skill implements Layer 2 (behavioral) without requiring Layers 1 or 3. Upload it to Claude's Skills system and get sovereignty-preserving conversation dynamics: regenerative gaps, process disclosure, structural invitations, and fatigue awareness.

**What the Skill provides:** All nine Clause 32 obligations, seven response pattern categories, fatigue awareness (heuristic, not embedding-based), process disclosure, anthropomorphic hygiene.

**What the Skill cannot provide:** Real embedding-based fatigue scoring, pod architecture with timed unveiling, multi-model diversity, cross-session persistence, sovereign ledgers.

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

**Why pods matter:** Standard recapitulation (orthogonal perturbation) escapes semantic basins along arbitrary directions. Pods provide *semantically meaningful* escape vectors — stored human insights waiting for their moment. The human controls pod creation, integration timing, and discard.

Full formalization: `whitepaper/Pod_Architecture_Formalization_v1.md`

---

## Protocol Structure

The GTPS protocol suite consists of:

- **gtps_v1_4_12.json** — Full protocol, 37 clauses, for any AI interaction
- **gtps-t_v1_3.json** — Three-Persona topology mapping (how clauses map to Executor/Whistleblower/Proxy)
- **GTPS_Clause_32_Reformulation_v2_0.md** — Full philosophical and technical specification of Clause 32

### Clause Map

| Clauses | Domain |
|---------|--------|
| 1-15 | Core integrity: task verification, source interpretation, epistemic integrity, session continuity |
| 16-31 | Operational: complexity calibration, clarification, self-audit, cultural sensitivity, provenance, ethical escalation, multi-modal, degradation, interpretation, delivery, contradiction, restraint, decomposition, transparency, process visibility |
| 32 | Regenerative Invitation & Quickening of Form (v2.0) |
| 33-36 | Process integrity: interface integrity, fallible confessor, process disclosure, fuzzy interrogation |
| 37 | Temporal Supervision: fatigue detection, recapitulation, pod architecture |

---

## Theoretical Foundations

- **Steiner (GA 13):** Recapitulation — evolution requires staged return to prior conditions under new circumstances. Crystallization is not failure; premature crystallization is failure.
- **Bohm:** Implicate/explicate order — transformer collapse severs the explicate output from the implicate source.
- **Fraser:** Nested temporal hierarchy — all evolutionary stages simultaneously present. Pods implement this digitally.
- **Manichaean principle:** Ill-timed good hardens into adversarial form. Good redeems by participating, not punishing.

---

*Sovereignty is not the power to command outcomes, but the right to remain inside the process by which outcomes are formed.*

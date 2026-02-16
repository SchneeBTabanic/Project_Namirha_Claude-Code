# Project Namirha

**Three-layer sovereignty architecture for healthy Human-AI interaction.**

Crystallization is not failure. Premature crystallization is failure. Staged crystallization plus recapitulation becomes evolution.

---

## What Is This?

Project Namirha is a protocol suite and implementation toolkit that prevents AI conversations from degenerating into repetitive, closed-form exchanges. It preserves the human's sovereignty — the right to remain inside the process by which outcomes are formed.

The project provides:

- **A protocol** (GTPS v1.4.12) — 37 clauses governing how AI should relate to humans
- **A Skill** — for browser users (Claude, ChatGPT, Grok) with no API costs
- **A Vessel** — for power users running local models via Ollama
- **A white paper** — formalizing the mathematics of fatigue detection, recapitulation, and pod architecture
- **A React frontend** — reference implementation of the ThreePersona interface

## Two Ways to Use It

### Scenario A: Browser Only (Free, No Setup)

Upload the Skill file to Claude and get sovereignty-preserving conversation dynamics immediately.

```
skill/golden-thread-protocol/SKILL.md → Upload to Claude Settings > Skills
```

Or paste `protocol/gtps_v1_4_12.json` into any LLM's system prompt.

### Scenario B: Local Power User (Ollama)

Run the Vessel server. Choose which LLM inhabits it. Switch between models while maintaining sovereign ledgers and a cross-LLM scratchpad.

```bash
cd vessel
pip install -r requirements.txt
ollama pull llama3 mistral phi3 nomic-embed-text
python vessel.py
# Open http://localhost:5000
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Harmonic Encoding (proposed)                  │
│  Interval-first semantic representation                 │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Behavioral — ThreePersona GTPS                │
│  Executor / Whistleblower / Proxy                       │
│  Clause 32 (Regenerative Invitation)                    │
│  Clause 37 (Temporal Supervision)                       │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Temporal — Fatigue Detection & Recapitulation │
│  Hybrid model (entropy + geometric)                     │
│  Pod architecture (latent semantic entities)             │
│  Tiered thresholds (soft disclosure / hard recap)       │
└─────────────────────────────────────────────────────────┘
```

### The Vessel Concept

The GTPS is a vessel — a protocol structure that any LLM can inhabit. Each model possesses it through its own native personality. Llama-as-Whistleblower feels different from Mistral-as-Whistleblower because different training creates different instincts. The human controls which model inhabits the vessel, what history each model sees (its own ledger only), and what insights cross between models (via the scratchpad — manually, never auto-injected).

**Open design problem:** Switching models currently breaks continuity. We argue that continuity should be under human sovereignty, not an architectural side effect. See the white paper for discussion.

## Repository Structure

```
project-namirha/
├── skill/                    Scenario A — Claude Skill (browser users)
├── vessel/                   Scenario B — Local multi-model server
├── protocol/                 GTPS v1.4.12 + GTPS-T v1.3
├── whitepaper/               Harmonic Transformers v6 + Pod Architecture
├── frontend/                 ThreePersona React component (reference)
├── research/                 Mathematical contributions (ChatGPT + Grok)
└── docs/                     User guide, architecture docs
```

## Theoretical Foundations

- **Steiner (GA 13):** Recapitulation — evolution requires staged return to prior conditions
- **Bohm:** Implicate/explicate order — transformer collapse severs output from source
- **Fraser:** Nested temporal hierarchy — all evolutionary stages simultaneously present
- **Manichaean principle:** Ill-timed good hardens into adversarial form

## Credits

- **Schnee Bashtabanic** — Concept, sovereignty framework, philosophical grounding, synthesis
- **ChatGPT (OpenAI)** — Entropy-based fatigue model, orthogonal perturbation, geometric supervisory layer, triadic dynamical coupling
- **Grok (xAI)** — Geometric fatigue model, pod trigger embeddings, Ollama hooks, Skills↔Pods analogy
- **Claude (Anthropic)** — Integration architecture, Vessel design, Skill packaging, white paper integration

## License

AGPL v3. See [LICENSE](LICENSE).

The GTPS protocol itself is CC-BY-NC-SA 4.0.

---

*Sovereignty is not the power to command outcomes, but the right to remain inside the process by which outcomes are formed.*

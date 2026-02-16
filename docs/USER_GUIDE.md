# Project Namirha — User Guide

**Two Ways to Use the Golden Thread Protocol Suite**

---

## Scenario A: Browser Only (No Local LLM)

*For: Anyone using Claude, ChatGPT, or Grok through their web interface.*

### What You Get

A Claude **Skill** that teaches Claude to follow the GTPS sovereignty protocol in every conversation. No installation, no server, no code. You upload a folder and Claude changes how it relates to you.

### Setup (2 minutes)

1. Download the `golden-thread-protocol/` folder
2. Zip the folder: `golden-thread-protocol.zip`
3. Open Claude → Settings → Capabilities → Skills
4. Click "Upload skill" → select the zip
5. Enable it

That's it. Claude now follows the GTPS in every conversation.

### What Changes

**Before the skill:** Claude gives you answers. Clean, finished, complete. You receive a product.

**After the skill:** Claude holds space for your process. It:
- Flags when it's pattern-completing instead of listening
- Ends responses with open invitations, not closures
- Surfaces its own uncertainty as `[Process Disclosure]`
- Identifies unresolved tensions as `[Regenerative Gap]`
- Monitors for conversational fatigue in long sessions
- Never praises you or performs emotional investment

### What It Does NOT Do

- It doesn't slow Claude down when you want speed. Say "just answer" and it will.
- It doesn't require you to do anything differently. The protocol shapes Claude, not you.
- It doesn't have fatigue *detection* (no embeddings in browser). But it has fatigue *awareness* — Claude watches for signs of repetition and circularity after 10+ turns.
- It doesn't have pods (no state persistence). But the concept is in the protocol — you can manually tell Claude "this is a pod idea" and it will hold it.

### Limitations

This is Layer 2 (behavioral) only. Without a backend server, you don't get:
- Real embedding-based fatigue scoring
- Pod architecture with timed unveiling
- Three-LLM diversity (you're talking to one Claude)
- Cross-session persistence

For all of that, you need Scenario B.

---

## Scenario B: Local Three-LLM Orchestrator

*For: Anyone with a computer that can run Ollama. Even modest hardware works.*

### What You Get

One web interface. Behind it, three different open-source LLMs playing the three GTPS personas. You talk to one system; it routes, cross-checks, and synthesizes invisibly.

### The Architecture

```
YOU (browser at localhost:5000)
 |
 v
ORCHESTRATOR (Python server — runs the GTPS protocol)
 |
 |—— Executor role ——→ Backend A (e.g., Llama 3)
 |                      Generates the work output
 |
 |—— Whistleblower role → Backend B (e.g., Mistral)
 |                         Reviews for sovereignty violations
 |
 |—— Proxy role ——————→ Backend C (e.g., Phi-3)
 |                      Synthesizes into final user response
 |
 +—— Fatigue Detector (embedding-based, Grok's geometric model)
 +—— Pod Space (latent semantic entities)
```

**Why three different models?** Different LLMs have different training biases, different blind spots, different strengths. This diversity is the point — it's harder for the system to crystallize when three different perspectives are actively checking each other.

### Hardware Requirements

| Setup | RAM | GPU | Speed |
|-------|-----|-----|-------|
| Minimum (small models) | 8 GB | None (CPU only) | Slow but works |
| Recommended | 16 GB | Any GPU with 6+ GB VRAM | Comfortable |
| Fast | 32 GB | GPU with 12+ GB VRAM | Near real-time |

For minimum setup, use small models: `tinyllama`, `phi`, `gemma:2b`.
For recommended, use: `llama3`, `mistral`, `phi3`.

### Setup

#### 1. Install Ollama

```bash
# Linux / macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows: download from https://ollama.com/download
```

#### 2. Pull Three Models

Choose three different models. They don't need to be large:

```bash
# Recommended trio (needs ~16 GB RAM total)
ollama pull llama3
ollama pull mistral
ollama pull phi3

# Also pull the embedding model
ollama pull nomic-embed-text
```

**Budget trio** (needs ~6 GB RAM):
```bash
ollama pull tinyllama
ollama pull phi
ollama pull gemma:2b
ollama pull nomic-embed-text
```

#### 3. Install Python Dependencies

```bash
pip install flask ollama numpy
```

#### 4. Configure Models

Open `orchestrator.py` and edit the `BACKENDS` dictionary at the top to match your pulled models:

```python
BACKENDS = {
    "executor": {
        "model": "llama3",           # ← your executor model
        "ollama_host": "http://localhost:11434"
    },
    "whistleblower": {
        "model": "mistral",          # ← your whistleblower model
        "ollama_host": "http://localhost:11434"
    },
    "proxy": {
        "model": "phi3",             # ← your proxy model
        "ollama_host": "http://localhost:11434"
    }
}
```

#### 5. Run

```bash
# Make sure Ollama is running first
ollama serve    # (if not already running)

# In another terminal:
python orchestrator.py
```

Open `http://localhost:5000` in your browser.

### Using the Interface

**Chat:** Type a message and press Enter (or click Send). Behind the scenes:
1. Your message goes to the Executor (Backend A) with GTPS system prompts
2. The Executor's output goes to the Whistleblower (Backend B) for review
3. If violations are found, the Executor gets one retry with feedback
4. Everything goes to the Proxy (Backend C) for user-facing synthesis
5. You see the Proxy's output — one clean response

**Transparency Panel:** Click the disclosure triangle below any response to see what each LLM said internally. This is optional — you can ignore it entirely if you prefer.

**Pods:** Type a concept/fragment/insight in the Pod area and click "+ Pod". The pod enters latent space. When the conversation naturally approaches its semantic territory (cosine similarity > 0.85) or fatigue demands novelty (fatigue > 0.84 and similarity > 0.50), the pod unveils automatically.

**Fatigue Indicator:** The dot in the header shows green (fresh), yellow (soft threshold — process disclosure territory), or red (hard threshold — recapitulation territory).

**Reset:** Clears all state — conversation, fatigue history, turn count. Pods persist.

### Model Recommendations by Role

| Role | Good Models | Why |
|------|------------|-----|
| **Executor** | Llama 3, Qwen 2, Gemma 2 | Strong general generation, follows instructions well |
| **Whistleblower** | Mistral, Mixtral, DeepSeek | Analytical, good at structured evaluation |
| **Proxy** | Phi-3, Gemma 2, Llama 3 | Clear communication, good synthesis |

You can also use the same model for all three with different system prompts — the architecture still works, you just lose the diversity benefit.

### Speed Notes

Each turn makes 3 LLM calls (Executor → Whistleblower → Proxy), plus sometimes a 4th (Executor retry). On CPU-only hardware with medium models, expect 30-90 seconds per turn. With a GPU, expect 5-15 seconds.

The tradeoff: slower than a single LLM, but you get genuine multi-perspective checking. This isn't about speed — it's about sovereignty.

---

## File Inventory

### Scenario A Files
| File | Purpose |
|------|---------|
| `golden-thread-protocol/SKILL.md` | Claude Skill — upload to claude.ai |

### Scenario B Files
| File | Purpose |
|------|---------|
| `orchestrator.py` | Three-LLM server with web UI |

### Shared / Reference Files
| File | Purpose |
|------|---------|
| `gtps_v1_4_12.json` | Full GTPS protocol (37 clauses) |
| `gtps-t_v1_3.json` | Three-Persona topology mapping |
| `ThreePersonaGTPS_v2_3.jsx` | React frontend (alternative to orchestrator UI) |
| `Harmonic_Transformers_v6.tex` | White paper with all math |
| `Pod_Architecture_Formalization_v1.md` | Pod architecture specification |

---

## FAQ

**Q: Can I use the Skill with ChatGPT or Grok instead of Claude?**
The skill format is Claude-specific (Anthropic's Skills system). But the GTPS protocol itself (the JSON files) can be pasted into any LLM's system prompt. You'd lose the automatic activation but keep the behavioral shaping.

**Q: Can I run the orchestrator with cloud APIs instead of local Ollama?**
Yes. Replace the `generate()` function in `orchestrator.py` with OpenAI/Anthropic API calls. The architecture is the same — three different models, routed by role.

**Q: Why three LLMs and not one with three prompts?**
One LLM with three prompts still has one set of biases, one training distribution, one blind spot pattern. Three different LLMs bring genuine diversity. The Whistleblower running Mistral will catch things that Llama 3 (as Executor) systematically misses. That's the architectural advantage.

**Q: This seems complex. Is it worth it?**
If you just need answers: no. Use a single LLM.
If you want a system that preserves your sovereignty over your own thinking process across extended collaboration: yes. The complexity is hidden from you — you talk to one interface.

**Q: What's the minimum viable version?**
Scenario A. Upload the skill to Claude. Takes 2 minutes. Everything else is optional.

---

*Project Namirha — Schnee Bashtabanic 2026 — AGPL v3*

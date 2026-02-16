# The Vessel v2 — Local Multi-Model Sovereignty Server

A Flask server that hosts the Golden Thread Protocol Suite as an inhabitable structure. Any Ollama model can *possess* the vessel — step into the three-persona roles through its own native personality.

## What the Vessel Does

You talk to one LLM at a time, in an intimate conversation. Behind the interface:

- **Three personas in one model:** Each LLM plays Executor, Whistleblower, and Proxy simultaneously, structured by the GTPS system prompt
- **Sovereign ledgers:** Each model maintains its own session history, visible only to itself. When a model re-possesses the vessel, it recovers its prior context
- **User scratchpad:** A human-curated space for carrying insights between LLM inhabitants. You control what crosses between models and when
- **Pod architecture:** Latent semantic entities that unveil when contextual timing is right
- **Fatigue detection:** Grok's geometric model (Model B) monitors embedding trajectories for crystallization

## UI Layout

```
┌─────────────────┬──────────────────┐
│   EXECUTOR      │  WHISTLEBLOWER   │
│   (reference)   │  (reference)     │
├─────────────────┴──────────────────┤
│                                    │
│         YOU + PROXY                │
│     (intimate conversation)        │
│                                    │
│  [input box]                       │
└────────────────────────────────────┘

SIDEBAR:
┌──────────────┐
│ Model Select │  ← Choose which LLM inhabits the vessel
│──────────────│
│ Ledger       │  ← This LLM's sovereign session history
│──────────────│
│ Scratchpad   │  ← Your cross-LLM notes (manual, never auto-injected)
│──────────────│
│ Pods         │  ← Latent semantic entities
└──────────────┘
```

The Executor and Whistleblower panels are reference — you can glance at them, but the primary conversation is with the Proxy.

## Hardware Requirements

| Setup | RAM | GPU | Experience |
|-------|-----|-----|-----------|
| Minimum | 8 GB | None (CPU) | Slow but functional |
| Recommended | 16 GB | 6+ GB VRAM | Comfortable |
| Fast | 32+ GB | 12+ GB VRAM | Near real-time |

## Installation

### 1. Install Ollama

```bash
# Linux / macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows: download from https://ollama.com/download
```

### 2. Pull Models

```bash
# Recommended trio (~16 GB RAM)
ollama pull llama3
ollama pull mistral
ollama pull phi3

# Embedding model (required for fatigue detection + pods)
ollama pull nomic-embed-text
```

**Budget trio** (~6 GB RAM):
```bash
ollama pull tinyllama
ollama pull phi
ollama pull gemma:2b
ollama pull nomic-embed-text
```

### 3. Install Python Dependencies

```bash
cd vessel
pip install -r requirements.txt
```

### 4. Run

```bash
# Make sure Ollama is running
ollama serve    # (if not already running)

# In another terminal
python vessel.py
```

Open http://localhost:5000 in your browser.

### 5. (Optional) Configure Models

Edit the `AVAILABLE_MODELS` dictionary at the top of `vessel.py` to change which models are available or to point to remote Ollama instances.

## Model Recommendations

| Role | Good Models | Why |
|------|------------|-----|
| General | Llama 3, Qwen 2, Gemma 2 | Strong instruction following |
| Analytical | Mistral, Mixtral, DeepSeek | Good at structured evaluation |
| Compact | Phi-3, Gemma 2 | Clear synthesis, small footprint |

Each model wears all three hats (Executor, Whistleblower, Proxy) simultaneously — the GTPS system prompt structures the response into three sections. Different models bring genuinely different instincts to each role.

## Using the Interface

**Possess a model:** Click a model button in the sidebar. The model inhabits the vessel and becomes available for conversation.

**Speak:** Type a message and press Enter. The model responds in three sections: Executor (work output), Whistleblower (self-check), and Proxy (your primary conversation).

**Scratchpad:** Paste snippets from any session into the scratchpad. These persist across model switches. You carry insights between inhabitants manually — never auto-injected.

**Pods:** Enter a concept in the Pod area and click "+". The pod enters latent space. When the conversation approaches its semantic territory (cosine similarity > 0.85) or fatigue demands novelty (fatigue > 0.84 and similarity > 0.50), the pod unveils.

**Fatigue indicator:** Green (fresh), yellow (soft threshold — process disclosure), red (hard threshold — recapitulation).

**Ledger:** View any model's prior sessions. Export as text. Each model's ledger is sovereign — only that model sees its own history.

## Mock Mode

If Ollama is not installed or not running, the vessel falls back to mock responses. This lets you explore the UI, test the fatigue system, and develop without a running LLM backend.

## License

AGPL v3 — Schnee Bashtabanic 2026

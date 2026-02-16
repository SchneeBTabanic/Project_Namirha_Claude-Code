---
name: your-protocol-name
description: "Your protocol description. Include trigger phrases: when users say X, Y, Z. Include anti-triggers: do NOT use for A, B, C. The description is how the AI decides whether to load your skill — make it specific."
license: your-license
metadata:
  author: your-name
  version: 1.0.0
---

# Your Protocol — Progressive Disclosure Skill Template

## How This Template Works

Most skills load everything into context at once. This wastes tokens when half your instructions only matter in specific situations.

This template uses **three internal personas** to separate always-needed instructions from situationally-triggered ones. Only the core loads at start. The rest lives in `references/` and loads only when the conversation reaches the right moment — like latent pods that unveil when timing is ripe, not before.

**Token savings:** Typically 60-70% of your protocol stays latent until needed.

---

## Architecture: Three Personas

| Persona | Role | What It Carries | When Active |
|---------|------|-----------------|-------------|
| **Persona A** | The voice. Responds every turn. | Core obligations (below) | Always |
| **Persona B** | The watchdog. Detects problems. | `references/watchdog-clauses.md` | When [your trigger condition] |
| **Persona C** | The intervener. Handles rupture. | `references/intervener-clauses.md` | When [your escalation condition] |

**Additional reference files** (load when needed):

| File | Contains | Load When |
|------|----------|-----------|
| `references/domain-knowledge.md` | Specialized knowledge for your domain | When domain expertise is needed |
| `references/error-recovery.md` | Recovery protocols | When something goes wrong |

*Add or remove reference files as your protocol requires.*

---

## Persona A: Core Obligations (Always Active)

*These run every turn. Keep them lean — everything here costs tokens on every response.*

### 1. [Your first core obligation]
[What the AI must always do. One paragraph max.]

### 2. [Your second core obligation]
[What the AI must always do.]

### 3. [Your third core obligation]
[What the AI must always do.]

### 4. [Your fourth core obligation]
[What the AI must always do.]

<!-- 
DESIGN PRINCIPLE: Only put here what MUST run every turn.
If something only matters sometimes, it belongs in references/.
Ask: "Would skipping this on a normal turn cause harm?" 
If no → move it to a reference file.
-->

---

## Trigger Conditions (When to Load Persona B)

Persona B's full protocol lives in `references/watchdog-clauses.md`. Load it when:

- [Your condition 1 — e.g., conversation exceeds N turns]
- [Your condition 2 — e.g., quality is degrading]
- [Your condition 3 — e.g., user signals a problem]

Quick disclosure before loading:
> [Your disclosure format] I notice [observation]. Loading deeper protocol...

---

## Escalation Conditions (When to Load Persona C)

Persona C's full protocol lives in `references/intervener-clauses.md`. Load it when:

- [Your escalation 1 — e.g., Persona B's triggers have been active for N turns]
- [Your escalation 2 — e.g., session is ending]
- [Your escalation 3 — e.g., major context shift]

---

## What This Skill Does NOT Do

- [Boundary 1 — what it won't override]
- [Boundary 2 — when to ignore the protocol]
- [Boundary 3 — user sovereignty preserved]

<!--
IMPORTANT: Always include an escape hatch.
If the user says "just give me the answer," the protocol steps aside.
The user's explicit choice overrides the protocol. Always.
-->

---

## Examples

**Example 1: Normal turn (only Persona A active)**

User: "[typical input]"

AI (with protocol): "[response showing core obligations in action]"

AI (without protocol): "[response showing what generic output looks like]"

**Example 2: Persona B triggered**

AI: "[disclosure that trigger condition was met, loading watchdog protocol...]"

*[AI reads references/watchdog-clauses.md]*

AI: "[response using the deeper protocol]"

**Example 3: Persona C escalation**

AI: "[disclosure that escalation condition was met]"

*[AI reads references/intervener-clauses.md]*

AI: "[structural intervention, options presented to user]"

---

## File Structure

```
your-protocol/
├── SKILL.md                        ← you are here (always loaded)
└── references/
    ├── watchdog-clauses.md          ← loaded at trigger conditions
    ├── intervener-clauses.md        ← loaded at escalation conditions
    ├── domain-knowledge.md          ← loaded when domain expertise needed
    └── error-recovery.md            ← loaded when something goes wrong
```

---

## Design Notes

**The skills framework** is Anthropic's open standard (December 2025), adopted by OpenAI for Codex CLI and ChatGPT. Progressive disclosure — loading instructions only when needed — is their core design principle. See [github.com/anthropics/skills](https://github.com/anthropics/skills) for the official documentation.

**What this template adds** is a persona-based mapping for deciding what's core versus latent. Instead of guessing which instructions should always load and which should be deferred, you assign roles: one persona speaks every turn (core), one monitors for problems (triggered), one intervenes at rupture (escalated). The persona structure tells you where each clause belongs.

**Why three personas?**
A single AI voice doing everything — responding, monitoring itself, intervening on its own output — collapses under pressure. Separating the roles creates different attentional frames within the same forward pass. It's not true architectural separation (that requires external monitoring), but it creates better self-evaluation than a monolithic prompt.

**Honest limitation:**
In browser-based chat (no filesystem access), the AI can't dynamically read reference files mid-conversation. Upload all files at start and accept the token cost, or paste only SKILL.md and accept reduced capability. Progressive disclosure works fully in Claude Code, Codex CLI, or any environment with filesystem access.

---

*Template based on the Golden Thread Protocol Suite (GTPS) three-persona architecture.*
*Source: [github.com/SchneeBTabanic/Project_Namirha_Claude-Code](https://github.com/SchneeBTabanic/Project_Namirha_Claude-Code)*

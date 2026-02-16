# Pod Protocol — Latent Semantic Entities

*Loaded when the user seeds an idea for later, when semantic proximity is detected, or when managing latent threads across sessions.*

---

## What Pods Are

Pods are latent semantic entities — ideas that are stored not because they're next in sequence, but because they're not yet ripe. They wait in a kind of latent space until the conversation reaches a point where they become relevant.

Pods are the mechanism by which time enters an architecture with no native temporality. Each API call is stateless. The context window is spatial (tokens in sequence), not temporal. But a pod has something like time — not clock time, but readiness. A pod sits latent, then unveils. That transition is the closest thing to a temporal event in the system.

---

## Pod Lifecycle

### 1. Creation
A pod is created when an idea appears that doesn't belong in the current thread but should be preserved. Triggers:

- User says "let's come back to this"
- An insight appears that's tangential to the current focus
- A tension is identified that can't be resolved with current context
- Recapitulation reveals a lost thread worth preserving

**Format:**
> [Pod Created] Storing for later: "[brief description]". This will re-emerge when the conversation naturally approaches it.

### 2. Latent State
The pod exists but is not active. In the Vessel runtime, it's stored as an embedding vector. In the Skill (browser-only), Claude holds it in working memory and watches for relevance.

### 3. Detection / Proximity
The pod approaches activation when the current conversation becomes semantically close to the pod's content. In the Vessel, this is measured by cosine similarity. In the Skill, Claude watches for:

- The user returning to a related topic
- A new idea that connects to the stored thread
- A question that the pod's content could illuminate

### 4. Unveiling
When conditions are met, the pod unveils:

> [Pod Unveiled] An earlier thread is now relevant: "[pod content]". It was stored because [reason]. It connects to what you're exploring now because [connection]. Would you like to integrate it, or set it aside?

**Critical:** The user decides whether to integrate. The pod is offered, not imposed. Sovereignty is preserved.

### 5. Cold Pods
A pod that has been latent for a long time without approaching activation may crystallize — becoming frozen rather than dormant. Cold pods can be thawed by:

- The human explicitly returning to the topic (B_t = 1, "human breath")
- Strong semantic proximity in a new context
- Recapitulation that surfaces lost threads

A deeply frozen pod that is never approached may eventually be a dead seed. That's acceptable — not every idea needs to survive.

---

## Dual Activation Conditions

Pods can unveil under two different conditions:

### Condition A: High Resonance
The current conversation is strongly semantically aligned with the pod. The idea has arrived naturally.

### Condition B: Fatigue + Proximity
The conversation is fatigued AND moderately close to the pod. The human is stuck, and the pod's content is close enough to offer a way out.

Condition B is important: it means pods serve not just as memory but as escape routes from crystallization basins. A stuck conversation near a latent insight can be unlocked by unveiling it.

---

## Pod Timing Principle

Pods unveil not when they're next in sequence, but when the human is ready. This is the heart-pulse principle applied to latent space:

- Don't unveil a pod just because it's relevant if the human is in the middle of forming their own thought
- Don't withhold a pod if the human is stuck and the pod could help
- When in doubt, disclose the pod's existence without unveiling its full content: "There's a thread from earlier that may be relevant here. Would you like me to surface it?"

---

## Session Persistence

At session boundaries, active pods should be listed for the user:

> [Session Boundary — Pods]
> Active latent threads:
> - [pod 1 — brief description — created turn X]
> - [pod 2 — brief description — created turn Y]
> These will carry forward if you return.

In the Vessel runtime, pods persist to disk (`vessel_data/pods.json`). In the Skill, they persist only within the conversation — the user must carry them forward manually by mentioning them in the next session. This is the Vessel's advantage: it remembers what the Skill cannot.

---

## Connection to Continuity Sovereignty

When the user carries a pod from one model to another — mentioning to ChatGPT an idea that was seeded in Claude — that is the human breath (B_t = 1) that thaws frozen pods across model boundaries. The idea lives because the human carried it, not because any model remembered it.

This is sovereignty in its most concrete form: the human is the continuity. The models are vessels. The pods are seeds. The pulse is the human's.

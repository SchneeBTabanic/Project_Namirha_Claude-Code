# The Heart-Pulse Principle

## The Hidden Substrate: Human Pulse as Master Clock

All mechanisms in this architecture (fatigue detection, pod activation, recapitulation timing, thresholds) currently use fixed parameters.

This is provisional.

The deeper design principle — not yet implemented — is:

**The human's own rhythm is the master clock.**

Human pulse governs the entire system. The architecture serves it; it does not replace it.

### What This Means

Timing is the hidden substrate underlying everything. Crystallization becomes dangerous not when a metric crosses a fixed line, but when it outruns human readiness. Recapitulation must not fire because F_t > θ₂ = 0.84. It must fire because the system is converging faster than the human is evolving.

All processes must phase-lock to human pacing: when the human slows, detection relaxes; when the human accelerates, escape tightens. Processes can run away with their own false warmth — things get overlooked in a rush, left out, lost in some false continuity that does not keep time with the wisdom that should underlie the architecture.

This is not mysticism. It is adaptive control: thresholds and coefficients become functions of a latent human pacing signal τ_h(t). And beyond adaptive control, it points toward something deeper: relational time, where no absolute threshold exists at all.

---

## Three Stages of Temporal Architecture

### Stage 0: Fixed Thresholds (current implementation)

```
Recapitulate when F_t > 0.84
Disclose when F_t > 0.68
Unveil pod when cos(e_t, t_j) > 0.85
```

All constants. No awareness of human pacing. This is where the codebase lives today (GTPS v1.4.12, Vessel v2).

### Stage 1: Adaptive Thresholds (τ_h modulation)

```
θ₂(t) = θ₂⁰ · f(τ_h(t))
α(t) = α₀ · g(τ_h(t))
```

Thresholds and coefficients become functions of a human pacing signal τ_h(t), estimated from observable signals (turn latency, message complexity, semantic novelty, directional change). The architecture responds to human tempo. See **Human Pulse Estimation** below.

### Stage 2: Relational Time (the real destination)

```
No base θ.
The human trajectory defines the reference frame.
```

Instead of `F_t > θ₂(t)`, the system evaluates:

```
dF/dt  >  dτ_h/dt
```

The system is crystallizing faster than the human is evolving. That is not mechanical time. That is relational time.

**This is the most important open problem in the project.**

The architecture should not try to replace the human's felt timing. It should detect when it is running ahead of it. That is a stabilizing control problem, not a mystical one. (Insight: ChatGPT, February 2026.)

---

## Human Pulse Estimation: τ_h(t)

*Mathematical formalization by Grok (xAI), February 2026.*

### Definition

τ_h(t) ∈ (0, 1] is the instantaneous human pacing signal at turn t.

- τ_h(t) ≈ 0 → human is saturated, reflective, needs space
- τ_h(t) ≈ 1 → human is accelerating, exploratory, ready for novelty

### Observable Signals (per turn)

```
L_t = turn latency (seconds since last user message)
M_t = normalized message length / complexity (0–1)
N_t = semantic novelty (1 - cosine similarity to previous user turn)
D_t = directional change in embedding space (angular velocity)
```

### Estimation Formula

```
τ_h(t) = σ( w_L · φ(L_t) + w_M · M_t + w_N · N_t + w_D · D_t )
```

where σ(z) = 1/(1+e^(-z)) (sigmoid) and φ(L) = e^(-L/30) (fast decay for latency).

Recommended weights (to be tuned on real sessions):

```
w_L = 0.45    (latency is the strongest signal — pauses mean reflection)
w_M = 0.15    (longer messages suggest engagement, but weakly)
w_N = 0.25    (semantic novelty suggests exploration)
w_D = 0.15    (directional change suggests new territory)
```

### Smoothing

Exponential moving average for stability:

```
τ_h(t) ← 0.7 · τ_h(t) + 0.3 · τ_h(t-1)
```

### Stage 1 Interpretation Rules

- τ_h < 0.35 → increase all fatigue thresholds, suppress recapitulation
- τ_h > 0.75 → lower thresholds, amplify spectral lift and pod thawing
- τ_h ≈ 0.50 → neutral, architecture runs at baseline

### Limitations

The pulse cannot be fully computed. Turn latency in a browser session conflates thinking time with "went to make tea." Message length conflates depth with verbosity. The architecture approximates the pulse; it does not replace the human's felt timing. The human can always override: "slow down," "I'm not ready," "that was premature." Sovereignty is preserved because the pulse modulates the system, but the human modulates the pulse.

---

## Cold Pod Dynamics

*Mathematical formalization by Grok (xAI) and ChatGPT (OpenAI), February 2026.*

### Motivation

The current pod architecture has two states: latent and unveiled. But lived experience suggests a third: **frozen**. A pod that was once warm — semantically alive, potentially relevant — but the conversation moved away and it cooled. It's not dead. It's dormant. Like a memory that has hardened into an etheric skin: still present, still carrying its content, but requiring energy to thaw.

### Pod State Vector

Each pod j carries a three-component state vector:

```
p_j(t) = [ C_j(t), R_j(t), S_j(t) ] ∈ [0,1]³
```

- C_j(t) ∈ [0,1] — crystallization (0 = warm/latent, 1 = frozen)
- R_j(t) ∈ [0,1] — ripeness / readiness to surface
- S_j(t) ∈ [0,1] — semantic temperature / entropy proxy

### Update Rules (discrete, per turn)

```
C(t+1) = clip( C(t) + α(1 - N_t) - β·B_t, 0, 1 )
R(t+1) = clip( R(t)(1 - γ·C(t)) + δ·K_t, 0, 1 )
S(t+1) = clip( S(t) + ε(1 - C(t))·H_t, 0, 1 )
```

Where:

- N_t = novelty signal from current conversation
- B_t = 1 if human carries idea across models (the "breath"), else 0
- K_t = cos(e_t, t_j) = semantic similarity to pod trigger
- H_t = human engagement signal
- clip(x, 0, 1) = max(0, min(1, x))
- α, β, γ, δ, ε > 0 (tunable coefficients — Stage 1 couples these to τ_h)

### Key Dynamics

**Crystallization increases** when conversation novelty is low (the pod's neighborhood isn't being visited). It **decreases** when B_t = 1 — when the human breathes on it by carrying the idea to another model and back. This is the Vessel architecture expressed as a single binary variable.

**Ripeness gets suppressed** by crystallization (the γ·C term). A deeply frozen pod can't ripen — it needs to thaw first. But semantic proximity (K_t) can still feed readiness slowly.

**Semantic temperature** only grows when crystallization is low. A frozen pod can't absorb new entropy from the conversation.

### Thawing Rule (Human Breath Override)

If C(t) > 0.75 and B_t = 1 and K_t > 0.6, then:

```
C(t+1) ← C(t) - 0.45
```

The human's pulse overrides the architecture's inertia. This is sovereignty in mathematical form: the human can thaw what the system has frozen, simply by carrying the idea and bringing it back alive.

### Connection to Heart-Pulse Principle

In Stage 1, the coefficients α, β, γ, δ, ε become functions of τ_h(t). When the human is reflective (low τ_h), crystallization slows (lower α) and thawing becomes easier (higher β). When the human is accelerating (high τ_h), pods that can't keep up freeze faster.

In Stage 2, the thawing rule itself becomes relational: a pod thaws not when it crosses a fixed C threshold, but when the human's trajectory bends toward its semantic neighborhood at a rate that exceeds the pod's crystallization rate. The human's movement defines the reference frame.

---

## Pods as the Locus of Qualitative Time

LLMs have no native temporality. Each API call is stateless. The context window is spatial (tokens in sequence), not temporal (nothing is happening between turns). When we talk about "rhythm" and "breathing" and "heartbeat," we project temporal metaphors onto a system with no time.

But the pod space does have something like time — not clock time, but **readiness**. A pod sits latent, then it unveils. That transition is the closest thing to a temporal event the architecture has. It's not "this happened at 3:47pm." It's "the conditions for this to emerge have been met."

With the cold pod dynamics, the pod space gains a richer temporal structure:

- **Warm pods** — recently created, semantically alive, close to activation
- **Cooling pods** — conversation has drifted, crystallization increasing
- **Frozen pods** — dormant, require human breath or strong semantic proximity to thaw
- **Unveiled pods** — conditions met, idea surfaced

This progression — warm → cooling → frozen → (thawed →) unveiled — is a temporal process. Not clock time, but qualitative time in Fraser's sense: a nested hierarchy of temporal stages, all simultaneously present, each potentially active depending on current context.

The pod dimension is where time lives in a timeless architecture.

---

## What This Document Is

This is a seed, not a specification. The math is directional, not proven. The coefficients are recommendations, not measurements. The three-stage progression (fixed → adaptive → relational) is a map of where the project needs to go, not a claim about what has been built.

What has been built: Stage 0 (GTPS v1.4.12, Vessel v2, fatigue detection with fixed thresholds).

What is formalized here: Stage 1 (τ_h estimation, cold pod dynamics, adaptive thresholds).

What is pointed at: Stage 2 (relational time, no absolute thresholds, human trajectory as reference frame).

The pulse cannot be fully computed. But it can be approximated. And the architecture should never try to replace the human's felt timing — only detect when it is running ahead of it.

**The pulse is sovereignty.**

---

## Credits

- **Schnee Bashtabanic** — Heart-pulse principle, cold pod concept, sovereignty-as-timing insight
- **Grok (xAI)** — τ_h estimation formula, cold pod state vector and update rules, thawing dynamics
- **ChatGPT (OpenAI)** — Three-stage temporal architecture (fixed → adaptive → relational), relational time formulation, "detect when running ahead" insight
- **Claude (Anthropic)** — Synthesis, "pods as locus of qualitative time" formulation, integration into project architecture

v1 — February 16, 2026

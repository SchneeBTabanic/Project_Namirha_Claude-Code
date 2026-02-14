#!/usr/bin/env python3
"""
Phase 0.5 Fatigue Detection - Integration Test
================================================
Faithful Python port of FatigueDetector + extractEmbedding from
src/ThreePersonaGTPS.jsx for offline validation.

Tests:
1. Identical queries → fatigue rises to threshold
2. Varied queries → fatigue stays low
3. Mixed pattern → fatigue rises then recovers
4. Component breakdown verification
5. Reset clears state
"""

import math
import re


class FatigueDetector:
    """Exact port of JS FatigueDetector class."""

    def __init__(self, window_size=5):
        self.window_size = window_size
        self.embedding_history = []
        self.novelty_history = []
        self.fatigue_history = []
        self.alpha = 0.4   # similarity weight
        self.beta = 0.3    # novelty deficit weight
        self.gamma = 0.3   # rhythm weight

    def compute_similarity(self, current, previous):
        if not current or not previous:
            return 0.0
        if len(current) != len(previous):
            return 0.0
        dot = sum(a * b for a, b in zip(current, previous))
        norm_a = math.sqrt(sum(a * a for a in current))
        norm_b = math.sqrt(sum(b * b for b in previous))
        denom = norm_a * norm_b
        return dot / denom if denom > 0 else 0.0

    def compute_novelty(self, current):
        if not self.embedding_history:
            return 1.0
        sims = [self.compute_similarity(current, past) for past in self.embedding_history]
        mean_sim = sum(sims) / len(sims)
        return 1.0 - mean_sim

    def compute_rhythm(self):
        if len(self.fatigue_history) < 3:
            return 0.0
        recent = self.fatigue_history[-3:]
        first_deriv = [recent[1] - recent[0], recent[2] - recent[1]]
        return first_deriv[1] - first_deriv[0]

    def detect(self, current_embed, previous_embed=None):
        S_t = self.compute_similarity(current_embed, previous_embed) if previous_embed else 0.0
        N_t = self.compute_novelty(current_embed)
        novelty_deficit = 1.0 - N_t
        R_t = self.compute_rhythm()

        fatigue_score = (
            self.alpha * S_t +
            self.beta * novelty_deficit +
            self.gamma * max(0, R_t)
        )

        self.embedding_history.append(current_embed)
        if len(self.embedding_history) > self.window_size:
            self.embedding_history.pop(0)

        self.novelty_history.append(N_t)
        if len(self.novelty_history) > self.window_size:
            self.novelty_history.pop(0)

        self.fatigue_history.append(fatigue_score)
        if len(self.fatigue_history) > self.window_size:
            self.fatigue_history.pop(0)

        is_fatigued = fatigue_score > 0.65

        return {
            "fatigue_score": fatigue_score,
            "is_fatigued": is_fatigued,
            "components": {
                "similarity": S_t,
                "novelty_deficit": novelty_deficit,
                "rhythm": R_t,
                "novelty": N_t,
            },
        }

    def reset(self):
        self.embedding_history = []
        self.novelty_history = []
        self.fatigue_history = []


def extract_embedding(text):
    """Exact port of JS extractEmbedding function."""
    words = re.findall(r'\b\w+\b', text.lower())
    vocab = list(dict.fromkeys(words))  # unique, preserving order
    size = min(len(vocab), 100)
    if size == 0:
        return []
    embedding = [0.0] * size
    for word in words:
        idx = vocab.index(word) % size
        embedding[idx] += 1.0
    norm = math.sqrt(sum(v * v for v in embedding))
    return [v / norm for v in embedding] if norm > 0 else embedding


# ──────────────────────────────────────────────
# TEST HELPERS
# ──────────────────────────────────────────────

def bar(score, width=40):
    filled = int(min(1.0, score) * width)
    if score > 0.65:
        color = "\033[91m"  # red
    elif score > 0.5:
        color = "\033[93m"  # yellow
    else:
        color = "\033[92m"  # green
    reset = "\033[0m"
    return f"{color}{'█' * filled}{'░' * (width - filled)}{reset} {score:.3f}"


def run_test(name, queries):
    print(f"\n{'═' * 60}")
    print(f"  TEST: {name}")
    print(f"{'═' * 60}")
    detector = FatigueDetector()
    prev_embed = None
    results = []

    for i, query in enumerate(queries):
        embed = extract_embedding(query)
        info = detector.detect(embed, prev_embed)
        prev_embed = embed
        results.append(info)

        tag = " *** FATIGUED ***" if info["is_fatigued"] else ""
        print(f"  Turn {i+1:2d}: {bar(info['fatigue_score'])}  "
              f"Sim={info['components']['similarity']:.2f}  "
              f"Nov={info['components']['novelty']:.2f}  "
              f"Rhy={info['components']['rhythm']:.2f}"
              f"{tag}")
        print(f"          Query: \"{query[:60]}{'...' if len(query) > 60 else ''}\"")

    return results


# ──────────────────────────────────────────────
# TEST 1: Identical repetitive queries
# ──────────────────────────────────────────────

print("\n" + "=" * 60)
print("  PHASE 0.5 FATIGUE DETECTION - INTEGRATION TESTS")
print("=" * 60)

results_1 = run_test("Identical Repetitive Queries", [
    "Tell me about consciousness",
    "Tell me about consciousness",
    "Tell me about consciousness",
    "Tell me about consciousness",
    "Tell me about consciousness",
    "Tell me about consciousness",
    "Tell me about consciousness",
])

# Verify: fatigue should rise and hit threshold
assert results_1[0]["fatigue_score"] < 0.5, "First turn should have low fatigue"
assert results_1[-1]["is_fatigued"], "Repeated identical queries should trigger fatigue"
print("\n  ✓ PASS: Identical queries trigger fatigue detection")

# ──────────────────────────────────────────────
# TEST 2: Diverse varied queries
# ──────────────────────────────────────────────

results_2 = run_test("Diverse Varied Queries", [
    "Tell me about quantum physics and wave-particle duality",
    "How does photosynthesis convert sunlight into energy",
    "Explain the causes of the French Revolution",
    "What are the principles of object-oriented programming",
    "Describe the water cycle and its impact on weather",
    "How do vaccines stimulate immune response",
    "What is the significance of the Fibonacci sequence in nature",
])

# Verify: fatigue should stay low
assert not results_2[-1]["is_fatigued"], "Varied queries should NOT trigger fatigue"
for r in results_2:
    assert r["fatigue_score"] < 0.65, f"Score {r['fatigue_score']:.3f} should stay below threshold"
print("\n  ✓ PASS: Varied queries keep fatigue below threshold")

# ──────────────────────────────────────────────
# TEST 3: Mixed pattern (repetitive → fresh → recovery)
# ──────────────────────────────────────────────

results_3 = run_test("Mixed: Repetitive → Fresh Input → Recovery", [
    "What is the meaning of life",
    "What is the meaning of life",
    "What is the meaning of life",
    "What is the meaning of life",
    "What is the meaning of life",
    # Fresh input to break the pattern
    "Explain how neural networks learn through backpropagation",
    "Describe the architecture of a modern CPU pipeline",
    "How does CRISPR gene editing work at the molecular level",
])

# Verify: fatigue rises then decreases with fresh input
peak_score = max(r["fatigue_score"] for r in results_3[:5])
final_score = results_3[-1]["fatigue_score"]
assert peak_score > final_score, "Fresh input should reduce fatigue from peak"
print(f"\n  ✓ PASS: Fatigue peaked at {peak_score:.3f}, recovered to {final_score:.3f}")

# ──────────────────────────────────────────────
# TEST 4: Component verification (cosine similarity)
# ──────────────────────────────────────────────

print(f"\n{'═' * 60}")
print(f"  TEST: Component Verification")
print(f"{'═' * 60}")

detector = FatigueDetector()
embed_a = extract_embedding("The quick brown fox jumps over the lazy dog")
embed_b = extract_embedding("The quick brown fox jumps over the lazy dog")
embed_c = extract_embedding("Quantum entanglement demonstrates nonlocal correlations")

sim_identical = detector.compute_similarity(embed_a, embed_b)
sim_different = detector.compute_similarity(embed_a, embed_c)

print(f"  Identical texts similarity: {sim_identical:.4f}")
print(f"  Different texts similarity: {sim_different:.4f}")

assert sim_identical > 0.99, f"Identical texts should have similarity ~1.0, got {sim_identical}"
assert sim_different < sim_identical, "Different texts should have lower similarity"
print("\n  ✓ PASS: Cosine similarity works correctly")

# ──────────────────────────────────────────────
# TEST 5: Reset clears state
# ──────────────────────────────────────────────

print(f"\n{'═' * 60}")
print(f"  TEST: Reset Clears State")
print(f"{'═' * 60}")

detector = FatigueDetector()
embed = extract_embedding("Test message")
for _ in range(5):
    detector.detect(embed, embed)

assert len(detector.embedding_history) > 0, "Should have history before reset"
detector.reset()
assert len(detector.embedding_history) == 0, "History should be empty after reset"
assert len(detector.novelty_history) == 0, "Novelty history should be empty after reset"
assert len(detector.fatigue_history) == 0, "Fatigue history should be empty after reset"

# After reset, first detection should behave like fresh start
info = detector.detect(embed, None)
assert info["components"]["similarity"] == 0.0, "No previous = zero similarity"
assert info["components"]["novelty"] == 1.0, "Empty history = max novelty"
print(f"  Post-reset first turn: score={info['fatigue_score']:.3f}, sim=0.00, nov=1.00")
print("\n  ✓ PASS: Reset correctly clears all state")

# ──────────────────────────────────────────────
# TEST 6: Whistleblower alert conditions
# ──────────────────────────────────────────────

print(f"\n{'═' * 60}")
print(f"  TEST: Whistleblower Alert Conditions")
print(f"{'═' * 60}")

detector = FatigueDetector()
prev = None
crystallization_triggered = False
low_novelty_triggered = False

for i in range(7):
    embed = extract_embedding("Tell me about consciousness and awareness")
    info = detector.detect(embed, prev)
    prev = embed

    # Check CRYSTALLIZATION_DETECTED condition
    if info["is_fatigued"]:
        crystallization_triggered = True
        print(f"  Turn {i+1}: CRYSTALLIZATION_DETECTED would fire (score={info['fatigue_score']:.3f} > 0.65)")

    # Check LOW_NOVELTY condition
    if info["components"]["novelty"] < 0.3:
        low_novelty_triggered = True
        print(f"  Turn {i+1}: LOW_NOVELTY would fire (novelty={info['components']['novelty']:.3f} < 0.3)")

assert crystallization_triggered, "CRYSTALLIZATION_DETECTED should trigger on repetition"
assert low_novelty_triggered, "LOW_NOVELTY should trigger on repetition"
print("\n  ✓ PASS: Both Whistleblower alert conditions trigger correctly")

# ──────────────────────────────────────────────
# TEST 7: Simulated conversation with varied Executor responses
# ──────────────────────────────────────────────

results_7 = run_test("Simulated Conversation (Executor-like responses)", [
    # Turn 1-3: Normal varied conversation
    "Consciousness is a multifaceted phenomenon involving subjective experience, self-awareness, and the binding of sensory information into a unified percept.",
    "The hard problem of consciousness, as framed by David Chalmers, asks why physical processes give rise to subjective experience at all.",
    "Integrated Information Theory proposes that consciousness corresponds to a system's capacity to integrate information, measured by phi.",
    # Turn 4-7: Executor starts repeating itself (crystallizing)
    "Consciousness involves subjective experience and self-awareness. The hard problem asks why physical processes create experience.",
    "The nature of consciousness involves subjective experience and awareness. Physical processes somehow give rise to subjective experience.",
    "Consciousness is about subjective experience and self-awareness. The fundamental question is how physical processes produce experience.",
    "Subjective experience and self-awareness constitute consciousness. Physical processes give rise to conscious experience.",
])

# The later turns should show increasing fatigue
early_avg = sum(r["fatigue_score"] for r in results_7[:3]) / 3
late_avg = sum(r["fatigue_score"] for r in results_7[4:]) / 3
print(f"\n  Early turns avg fatigue: {early_avg:.3f}")
print(f"  Late turns avg fatigue:  {late_avg:.3f}")
assert late_avg > early_avg, "Crystallizing responses should have higher fatigue"
print("  ✓ PASS: Fatigue correctly distinguishes novel from crystallizing responses")

# ──────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────

print(f"\n{'═' * 60}")
print(f"  ALL TESTS PASSED")
print(f"{'═' * 60}")
print(f"""
  Summary:
  ✓ Test 1: Identical queries trigger fatigue (score > 0.65)
  ✓ Test 2: Varied queries stay below threshold
  ✓ Test 3: Fresh input recovers from fatigue peak
  ✓ Test 4: Cosine similarity computes correctly
  ✓ Test 5: Reset clears all detector state
  ✓ Test 6: CRYSTALLIZATION_DETECTED and LOW_NOVELTY alerts fire
  ✓ Test 7: Simulated Executor crystallization detected

  Phase 0.5 fatigue detection is working correctly.
  Ready for live testing with API calls.
""")

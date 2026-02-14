# Phase 0.5 Integration: Technical Documentation

## Overview

Phase 0.5 adds **temporal dynamics** to ThreePersona GTPS v2.1 through
fatigue detection and recapitulation mechanisms.

## Architecture

```
User message
    |
FatigueDetector (shared state)
    |---> Executor (monitored for fatigue)
    |---> Whistleblower (validates temporal compliance)
    +---> Proxy (mediates user choices)
```

## Components

### 1. FatigueDetector Class

**Purpose:** Detect when responses crystallize into repetitive patterns

**Methods:**

- `detect(currentEmbed, previousEmbed)` - Main detection
- `computeSimilarity(a, b)` - Cosine similarity
- `computeNovelty(embed)` - Difference from history
- `computeRhythm()` - Acceleration of fatigue
- `reset()` - Clear history

**Parameters:**

- `windowSize` (default: 5) - History window for novelty
- `alpha` (default: 0.4) - Similarity weight
- `beta` (default: 0.3) - Novelty deficit weight
- `gamma` (default: 0.3) - Rhythm weight

### 2. Embedding Extraction

**Current:** Simple TF-IDF vector (placeholder)

**Production:** Replace with actual embedding API:

```javascript
async function extractEmbedding(text) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: text,
            model: 'text-embedding-3-small'
        })
    });

    const data = await response.json();
    return data.data[0].embedding;
}
```

### 3. Whistleblower Integration

**New validation types:**

- `CRYSTALLIZATION_DETECTED` (severity: medium)
  - Triggers when fatigue_score > 0.65
  - Suggests recapitulation or fresh input

- `LOW_NOVELTY` (severity: low)
  - Triggers when novelty < 0.3
  - Warns of high similarity to history

### 4. Proxy Integration

**New prompt sections:**

- `[TEMPORAL AWARENESS]` - Current fatigue metrics
- `[CLAUSE 32 POINT 6]` - Sovereignty-preserving disclosure format

**Proxy response format when crystallized:**

```
I notice the Executor's responses are showing high similarity...
(fatigue score: 0.72). This might indicate crystallization.

I have no authority to judge whether this is appropriate -
that sovereignty is entirely yours.

Would you like to:
A) Continue
B) Fresh input
C) Pause to ripen

Your call.
```

## Tuning Guide

### Adjusting Sensitivity

**More sensitive (earlier detection):**

```javascript
const isFatigued = fatigueScore > 0.5;  // Lower threshold
```

**Less sensitive (fewer alerts):**

```javascript
const isFatigued = fatigueScore > 0.8;  // Higher threshold
```

### Adjusting Weights

**Emphasize similarity:**

```javascript
this.alpha = 0.6;  // Detect repetition faster
this.beta = 0.2;
this.gamma = 0.2;
```

**Emphasize novelty:**

```javascript
this.alpha = 0.2;
this.beta = 0.6;  // Detect staleness faster
this.gamma = 0.2;
```

**Emphasize rhythm:**

```javascript
this.alpha = 0.2;
this.beta = 0.2;
this.gamma = 0.6;  // Detect accelerating plateaus
```

### Window Size

**Shorter memory (detect recent patterns):**

```javascript
const fatigueDetector = new FatigueDetector(3);  // Last 3 turns
```

**Longer memory (detect long-term trends):**

```javascript
const fatigueDetector = new FatigueDetector(10);  // Last 10 turns
```

## Testing

### Manual Testing

1. Start a conversation
2. Ask similar questions repeatedly
3. Watch fatigue score increase
4. Observe Proxy offering choices when red

### Automated Testing

```javascript
// Test fatigue detection
const detector = new FatigueDetector();

const embed1 = extractEmbedding("First response");
const embed2 = extractEmbedding("First response");  // Identical

const result = detector.detect(embed2, embed1);

console.assert(result.components.similarity > 0.99, "Should detect identity");
console.assert(result.is_fatigued, "Should trigger fatigue");
```

## Performance

**Token overhead:** ~50-100 tokens per turn (fatigue metrics in metadata)

**Computation:** Minimal (O(n) where n = window size)

**API calls:** No additional calls (uses existing Executor/Whistleblower/Proxy flow)

## Future Enhancements

1. **Actual embeddings** - Replace TF-IDF with OpenAI/Anthropic embeddings
2. **Recapitulation injection** - Retrieve and re-integrate earlier states
3. **State archival** - Preserve conversation snapshots at boundaries
4. **Adaptive thresholds** - Learn optimal fatigue levels per user
5. **Metrics dashboard** - Visualize novelty trajectory over time

## References

- Phase 0.5 empirical results: See `scenario_comparison.png`
- Integration spec: `Integration_Spec_Phase05_ThreePersona.md`
- Original GTPS: `docs/gtps_v1_4_11.json`
- Clause 32 v2.0: `docs/GTPS_Clause_32_Reformulation_v2_0.md`

# Claude Code Instructions: Phase 0.5 + ThreePersona Integration

**Task:** Integrate recapitulation engine (Phase 0.5) with ThreePersona GTPS v2.1

**Context:** See `Integration_Spec_Phase05_ThreePersona.md` for full architecture

---

## Task 1: Add Fatigue Detection to ThreePersona JSX

**File:** `src/ThreePersonaGTPS.jsx`

### Step 1.1: Add FatigueDetector Class

Add this class BEFORE the main ThreePersonaGTPS component:

```javascript
/**
 * PHASE 0.5 INTEGRATION - Fatigue Detection
 * 
 * Detects when AI responses crystallize (high similarity, low novelty)
 * Based on empirical validation showing sequential > batch processing
 * 
 * Formula: F_t = α·S_t + β·(1-N_t) + γ·R_t
 * Where:
 *   S_t = similarity to previous state
 *   N_t = novelty (difference from history)
 *   R_t = rhythm (acceleration of stagnation)
 */
class FatigueDetector {
    constructor(windowSize = 5) {
        this.windowSize = windowSize;
        this.embeddingHistory = [];
        this.noveltyHistory = [];
        this.fatigueHistory = [];
        
        // Weights (tunable)
        this.alpha = 0.4;  // similarity weight
        this.beta = 0.3;   // novelty deficit weight
        this.gamma = 0.3;  // rhythm weight
    }
    
    /**
     * Compute cosine similarity between two embedding vectors
     */
    computeSimilarity(currentEmbed, previousEmbed) {
        if (!currentEmbed || !previousEmbed) return 0.0;
        if (currentEmbed.length !== previousEmbed.length) return 0.0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < currentEmbed.length; i++) {
            dotProduct += currentEmbed[i] * previousEmbed[i];
            normA += currentEmbed[i] * currentEmbed[i];
            normB += previousEmbed[i] * previousEmbed[i];
        }
        
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator > 0 ? dotProduct / denominator : 0.0;
    }
    
    /**
     * Compute novelty: how different current state is from history
     * Low novelty = converging to attractor basin (crystallization)
     */
    computeNovelty(currentEmbed) {
        if (this.embeddingHistory.length === 0) return 1.0;
        
        const similarities = this.embeddingHistory.map(pastEmbed =>
            this.computeSimilarity(currentEmbed, pastEmbed)
        );
        
        const meanSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        return 1.0 - meanSimilarity;
    }
    
    /**
     * Compute rhythm: rate of change of fatigue
     * Accelerating plateau = true fatigue
     * Stable plateau = temporary convergence
     */
    computeRhythm() {
        if (this.fatigueHistory.length < 3) return 0.0;
        
        // Get last 3 fatigue scores
        const recent = Array.from(this.fatigueHistory).slice(-3);
        
        // First derivative (rate of change)
        const firstDeriv = [
            recent[1] - recent[0],
            recent[2] - recent[1]
        ];
        
        // Second derivative (acceleration)
        const secondDeriv = firstDeriv[1] - firstDeriv[0];
        
        return secondDeriv;
    }
    
    /**
     * Detect fatigue in current state
     * 
     * @param {Array<number>} currentEmbed - Current embedding vector
     * @param {Array<number>} previousEmbed - Previous embedding vector
     * @returns {Object} Fatigue info with score, components, and boolean flag
     */
    detect(currentEmbed, previousEmbed = null) {
        // Component 1: Similarity to previous
        const S_t = previousEmbed ? 
            this.computeSimilarity(currentEmbed, previousEmbed) : 0.0;
        
        // Component 2: Novelty deficit
        const N_t = this.computeNovelty(currentEmbed);
        const noveltyDeficit = 1.0 - N_t;
        
        // Component 3: Rhythm (acceleration)
        const R_t = this.computeRhythm();
        
        // Combined fatigue score
        const fatigueScore = 
            this.alpha * S_t +
            this.beta * noveltyDeficit +
            this.gamma * Math.max(0, R_t);  // Only positive acceleration
        
        // Update histories
        this.embeddingHistory.push(currentEmbed);
        if (this.embeddingHistory.length > this.windowSize) {
            this.embeddingHistory.shift();
        }
        
        this.noveltyHistory.push(N_t);
        if (this.noveltyHistory.length > this.windowSize) {
            this.noveltyHistory.shift();
        }
        
        this.fatigueHistory.push(fatigueScore);
        if (this.fatigueHistory.length > this.windowSize) {
            this.fatigueHistory.shift();
        }
        
        // Threshold for "fatigued" state (tunable)
        const isFatigued = fatigueScore > 0.65;
        
        return {
            fatigue_score: fatigueScore,
            is_fatigued: isFatigued,
            components: {
                similarity: S_t,
                novelty_deficit: noveltyDeficit,
                rhythm: R_t,
                novelty: N_t
            },
            metrics: {
                avg_novelty: this.noveltyHistory.length > 0 ?
                    this.noveltyHistory.reduce((a, b) => a + b, 0) / this.noveltyHistory.length : 0,
                novelty_variance: this.computeVariance(this.noveltyHistory)
            }
        };
    }
    
    computeVariance(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
    }
    
    reset() {
        this.embeddingHistory = [];
        this.noveltyHistory = [];
        this.fatigueHistory = [];
    }
}
```

### Step 1.2: Add State Variables

In the main component, add these state variables:

```javascript
// PHASE 0.5: Fatigue detection
const [fatigueDetector] = useState(() => new FatigueDetector());
const [previousEmbedding, setPreviousEmbedding] = useState(null);
const [fatigueHistory, setFatigueHistory] = useState([]);
```

### Step 1.3: Add Embedding Extraction Function

Add this helper function:

```javascript
/**
 * Extract semantic embedding from text
 * 
 * For now, use simple TF-IDF-like vector
 * In production, replace with actual embedding API call
 */
function extractEmbedding(text) {
    // Simple word frequency vector (placeholder)
    // In production: call OpenAI embeddings API or use local model
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const vocab = Array.from(new Set(words));
    const embedding = new Array(Math.min(vocab.length, 100)).fill(0);
    
    // Simple TF vector
    words.forEach(word => {
        const idx = vocab.indexOf(word) % embedding.length;
        embedding[idx] += 1.0;
    });
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? embedding.map(val => val / norm) : embedding;
}
```

### Step 1.4: Update handleSendMessage

Find the handleSendMessage function and add fatigue detection:

```javascript
async function handleSendMessage() {
    // ... existing code up to Executor call ...
    
    // Get Executor response
    let executorRawResp = await callExecutor(userMessage, context, null);
    
    // PHASE 0.5: Extract embedding and detect fatigue
    const currentEmbedding = extractEmbedding(
        executorParsedResp?.userText || executorRawResp
    );
    
    const fatigueInfo = fatigueDetector.detect(
        currentEmbedding,
        previousEmbedding
    );
    
    // Log fatigue for debugging
    console.log('[Phase 0.5] Fatigue:', fatigueInfo);
    
    // Update fatigue history
    setFatigueHistory(prev => [
        ...prev,
        {
            turn: conversationHistory.length + 1,
            score: fatigueInfo.fatigue_score,
            components: fatigueInfo.components
        }
    ].slice(-20));  // Keep last 20
    
    // ... existing Whistleblower validation ...
    
    // PHASE 0.5: Pass fatigue info to Whistleblower
    const whistleblowerResult = await callWhistleblower(
        userMessage,
        executorRawResp,
        fatigueInfo  // NEW PARAMETER
    );
    
    // ... existing Proxy call ...
    
    // PHASE 0.5: Pass fatigue info to Proxy
    const proxyResp = await callProxy(
        userMessage,
        executorParsedResp,
        whistleblowerResult.alerts,
        context,
        fatigueInfo  // NEW PARAMETER
    );
    
    // Update previous embedding
    setPreviousEmbedding(currentEmbedding);
    
    // ... rest of existing code ...
}
```

---

## Task 2: Update Whistleblower Validation

**File:** `src/ThreePersonaGTPS.jsx`

### Step 2.1: Modify validateExecutorResponse

Add fatigue-based validation:

```javascript
function validateExecutorResponse(response, fatigueInfo = null) {
    const alerts = [];
    
    // ... existing validation (Clause 35, etc.) ...
    
    // PHASE 0.5: Crystallization detection
    if (fatigueInfo && fatigueInfo.is_fatigued) {
        alerts.push({
            clause: 32,
            type: "CRYSTALLIZATION_DETECTED",
            severity: "medium",
            detail: `Fatigue score: ${fatigueInfo.fatigue_score.toFixed(3)} (threshold: 0.65)`,
            components: {
                similarity: fatigueInfo.components.similarity.toFixed(3),
                novelty_deficit: fatigueInfo.components.novelty_deficit.toFixed(3),
                rhythm: fatigueInfo.components.rhythm.toFixed(3)
            },
            suggestedAction: "Consider recapitulation or fresh user input",
            explanation: "Response shows high similarity to recent outputs, indicating potential crystallization into repetitive patterns."
        });
    }
    
    // PHASE 0.5: Low novelty warning
    if (fatigueInfo && fatigueInfo.components.novelty < 0.3) {
        alerts.push({
            clause: 32,
            type: "LOW_NOVELTY",
            severity: "low",
            detail: `Novelty: ${fatigueInfo.components.novelty.toFixed(3)} (low)`,
            suggestedAction: "Inject variation or retrieve earlier context",
            explanation: "Response is very similar to recent conversation history."
        });
    }
    
    return alerts;
}
```

### Step 2.2: Update callWhistleblower

Modify to accept fatigue info:

```javascript
async function callWhistleblower(userMessage, executorResp, fatigueInfo = null) {
    // Parse Executor response
    const parsedResp = parseExecutorResponse(executorResp);
    
    // Validate with fatigue context
    const alerts = validateExecutorResponse(parsedResp, fatigueInfo);
    
    return {
        alerts: alerts,
        executorParsed: parsedResp
    };
}
```

---

## Task 3: Update Proxy for Fatigue Mediation

**File:** `src/ThreePersonaGTPS.jsx`

### Step 3.1: Modify callProxy

Add fatigue context to Proxy prompt:

```javascript
async function callProxy(userMsg, executorParsed, alerts, context, fatigueInfo = null) {
    // Build Proxy system prompt with temporal awareness
    let proxyPrompt = `
You are the Proxy (companion) in GTPS-T v2.1.

Your role:
- Provide brief meta-commentary (3-7 sentences) about the process
- Translate Whistleblower alerts for the user
- Surface process insights
- Offer sovereignty checkpoints when appropriate

CRITICAL: You do NOT repost or filter the Executor's output.
The user can already see it in the Executor column.
`;

    // PHASE 0.5: Add temporal context if fatigue detected
    if (fatigueInfo && fatigueInfo.is_fatigued) {
        proxyPrompt += `

[TEMPORAL AWARENESS - Phase 0.5]
The Executor shows signs of crystallization:
- Fatigue score: ${fatigueInfo.fatigue_score.toFixed(3)} (threshold: 0.65)
- Similarity to previous: ${fatigueInfo.components.similarity.toFixed(3)}
- Novelty level: ${fatigueInfo.components.novelty.toFixed(3)}
- Rhythm (acceleration): ${fatigueInfo.components.rhythm.toFixed(3)}

This suggests the response may be settling into repetitive patterns.

[CLAUSE 32 POINT 6 - SOVEREIGNTY-PRESERVING DISCLOSURE]
You notice pattern-completion happening. Your obligation:

1. Report what you observe in the PROCESS (not judge the user)
2. Explicitly disclaim authority over timing
3. Offer genuine choice with no coercion

Example format:
"I notice the Executor's responses are showing high similarity to recent turns 
(fatigue score: ${fatigueInfo.fatigue_score.toFixed(2)}). This might indicate 
crystallization into repetitive patterns. I have no authority to judge whether 
this is appropriate for your current work - that sovereignty is entirely yours. 

Would you like to:
A) Continue with current trajectory
B) Introduce fresh input to shift the pattern
C) Pause to let your thoughts ripen internally

Your call."

Remember: You are flagging PROCESS dynamics, not managing the user's timing.
`;
    }

    proxyPrompt += `

Current alerts from Whistleblower:
${alerts.length > 0 ? JSON.stringify(alerts, null, 2) : 'None'}

Current Executor metadata:
${JSON.stringify(executorParsed.processMetadata, null, 2)}

Provide your companion commentary now (3-7 sentences).
`;

    // ... existing API call ...
}
```

---

## Task 4: Add UI Indicators

**File:** `src/ThreePersonaGTPS.jsx`

### Step 4.1: Add Fatigue Visualization

Add a fatigue indicator above the three columns:

```javascript
{/* PHASE 0.5: Fatigue Indicator */}
{fatigueHistory.length > 0 && (
    <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
                Temporal Dynamics (Phase 0.5)
            </span>
            <button
                onClick={() => fatigueDetector.reset()}
                className="text-xs text-blue-600 hover:text-blue-800"
            >
                Reset Detector
            </button>
        </div>
        
        {fatigueHistory.slice(-1).map(entry => (
            <div key={entry.turn} className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Fatigue:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${
                                entry.score > 0.65 ? 'bg-red-500' :
                                entry.score > 0.5 ? 'bg-yellow-500' :
                                'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, entry.score * 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-gray-700">
                        {entry.score.toFixed(3)}
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>Sim: {entry.components.similarity.toFixed(2)}</div>
                    <div>Nov: {entry.components.novelty.toFixed(2)}</div>
                    <div>Rhy: {entry.components.rhythm.toFixed(2)}</div>
                </div>
            </div>
        ))}
    </div>
)}
```

---

## Task 5: Update Documentation

**File:** `docs/README.md`

### Step 5.1: Add Phase 0.5 Section

Add after the "Architecture" section:

```markdown
## Phase 0.5 Integration: Temporal Dynamics

ThreePersona v2.1 includes **temporal awareness** through fatigue detection
and recapitulation mechanisms.

### What It Does

**Prevents crystallization** by detecting when AI responses settle into
repetitive patterns, then offering sovereignty-preserving choices:

1. **Fatigue Detection** - Multi-factor monitoring:
   - Similarity to previous state
   - Novelty compared to history
   - Rhythm (acceleration of stagnation)

2. **Process Awareness** - Whistleblower validates temporal dynamics:
   - Crystallization alerts
   - Low novelty warnings
   - Pattern-bypass detection

3. **User Sovereignty** - Proxy mediates timing decisions:
   - Explains what's happening in the process
   - Offers choices (continue / fresh input / pause)
   - Never judges user's readiness

### Empirical Validation

Phase 0.5 was validated through A/B/C testing:

| Scenario | Novelty Variance | Recapitulation Events |
|----------|------------------|----------------------|
| A: Sequential + Recapitulation | 0.0475 | 18 |
| B: Batch (AI-only) | 0.0000 | 0 |
| C: Batch (Full) | 0.0000 | 0 |

**Result:** Sequential timing with temporal awareness creates **measurable
emergence** (∞ variance ratio) that batch processing cannot achieve.

### How to Use

**In the UI:**

- **Fatigue indicator** shows current crystallization level
- **Green:** Fresh, novel responses (score < 0.5)
- **Yellow:** Moderate similarity (score 0.5-0.65)
- **Red:** Crystallized, repetitive (score > 0.65)

**When red:**

The Proxy will offer choices:
- Continue (your sovereign decision)
- Provide fresh input to shift patterns
- Pause for internal ripening

**Your timing authority is never questioned.**

### Technical Details

**Fatigue Formula:**

```
F_t = α·S_t + β·(1-N_t) + γ·R_t

Where:
  S_t = similarity to previous state (cosine)
  N_t = novelty (1 - mean similarity to history)
  R_t = rhythm (second derivative of fatigue)
  
  α = 0.4 (similarity weight)
  β = 0.3 (novelty deficit weight)
  γ = 0.3 (rhythm weight)
```

**Threshold:** 0.65 (tunable in code)

**Embedding:** Currently simple TF-IDF (replace with actual embedding API
for production)

For full architecture details, see `docs/Integration_Spec_Phase05_ThreePersona.md`
```

---

## Task 6: Create Integration Documentation

**Create new file:** `docs/Phase05_Integration.md`

```markdown
# Phase 0.5 Integration: Technical Documentation

## Overview

Phase 0.5 adds **temporal dynamics** to ThreePersona GTPS v2.1 through
fatigue detection and recapitulation mechanisms.

## Architecture

```
User Message
    ↓
FatigueDetector (shared state)
    ├→ Executor (uses for self-correction)
    ├→ Whistleblower (validates temporal compliance)
    └→ Proxy (mediates user choices)
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
```

---

## Summary of Changes

**Files to modify:**

1. `src/ThreePersonaGTPS.jsx`
   - Add FatigueDetector class
   - Add state variables
   - Update handleSendMessage
   - Update validateExecutorResponse
   - Update callWhistleblower
   - Update callProxy
   - Add UI fatigue indicator

2. `docs/README.md`
   - Add Phase 0.5 section

3. `docs/Phase05_Integration.md` (NEW FILE)
   - Technical documentation
   - API reference
   - Tuning guide

**Testing checklist:**

- [ ] FatigueDetector class compiles
- [ ] Fatigue score updates on each turn
- [ ] UI indicator shows red when score > 0.65
- [ ] Whistleblower adds crystallization alerts
- [ ] Proxy offers sovereignty-preserving choices
- [ ] Reset button clears detector history

**Deployment:**

```bash
npm start
# Test with repetitive queries
# Verify fatigue detection triggers
# Confirm Proxy offers choices (not judgments)
```

---

**Ready to implement!** 🚀

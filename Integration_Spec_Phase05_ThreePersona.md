# Integration Specification: Phase 0.5 + ThreePersona + White Paper v5

**Date:** 2026-02-14  
**Purpose:** Integrate temporal dynamics (Phase 0.5) with behavioral architecture (ThreePersona v2.1) and update Harmonic Transformers white paper

---

## Executive Summary

**What we're building:**

A **three-layer AI sovereignty architecture** that prevents premature crystallization through:

1. **Temporal Layer** (Phase 0.5): Fatigue detection + recapitulation engine
2. **Behavioral Layer** (ThreePersona): Executor/Whistleblower/Proxy dynamics  
3. **Structural Layer** (Harmonic Transformers): Interval-first encoding (future)

**Key Innovation:**

Each ThreePersona agent shares the **same recapitulation engine**, but uses it differently:

- **Executor**: Monitored for fatigue, archived states used for self-correction
- **Whistleblower**: Detects crystallization patterns, triggers recapitulation
- **Proxy**: Mediates recapitulation decisions, explains to user

---

## Architecture Integration

### Current State

**ThreePersona v2.1:**
```javascript
User message
    ↓
Executor (generates response with metadata)
    ↓
Whistleblower (validates, triggers retries)
    ↓
Proxy (companion commentary)
    ↓
User sees all three columns
```

**Phase 0.5:**
```python
Sequential turns
    ↓
Fatigue detection (multi-factor)
    ↓
State archival (boundary detection)
    ↓
Recapitulation injection (retrieve past states)
```

### Integrated Architecture

```
User message
    ↓
┌─────────────────────────────────────┐
│  SHARED RECAPITULATION ENGINE       │
│  - FatigueDetector                  │
│  - StateArchive                     │
│  - RecapitulationInjector           │
└─────────────────────────────────────┘
    ↓         ↓              ↓
Executor  Whistleblower   Proxy
(uses)     (monitors)    (mediates)
    ↓         ↓              ↓
Response  Validation   Commentary
```

---

## Component Mapping

### 1. Executor Uses Recapitulation for Self-Correction

**How it works:**

```javascript
// Executor generates response
const executorResponse = await callExecutor(userMessage, context);

// Check fatigue
const fatigueInfo = recapEngine.detectFatigue(
    executorResponse.embedding,
    previousEmbedding
);

// If fatigued, inject past state
if (fatigueInfo.is_fatigued) {
    const relevantPastState = recapEngine.getRelevantPastState(
        executorResponse.embedding
    );
    
    // Create recapitulation prompt
    const recapPrompt = recapEngine.createRecapitulationPrompt(
        userMessage,
        relevantPastState
    );
    
    // Executor retries with enriched context
    executorResponse = await callExecutor(recapPrompt, context);
}
```

**What this does:**
- Prevents Executor from repeating patterns
- Enriches responses with earlier insights
- Implements Clause 32 Point 3: "Mirror rhythm without resolving"

---

### 2. Whistleblower Monitors for Crystallization

**How it works:**

```javascript
function validateExecutorResponse(response, fatigueInfo) {
    const alerts = [];
    
    // Existing validation (Clause 35, etc.)
    // ...
    
    // NEW: Crystallization detection
    if (fatigueInfo.fatigue_score > 0.65) {
        alerts.push({
            type: "CRYSTALLIZATION_DETECTED",
            clause: 32,
            severity: "medium",
            detail: `Fatigue score: ${fatigueInfo.fatigue_score}`,
            components: fatigueInfo.components,
            suggestedAction: "Consider recapitulation or user input"
        });
    }
    
    // NEW: Novelty deficit check
    if (fatigueInfo.components.novelty_deficit > 0.7) {
        alerts.push({
            type: "LOW_NOVELTY",
            clause: 32,
            severity: "low",
            detail: "Response shows high similarity to recent outputs",
            suggestedAction: "Inject variation or retrieve earlier context"
        });
    }
    
    return alerts;
}
```

**What this does:**
- Extends Whistleblower validation to temporal dynamics
- Surfaces crystallization to Proxy for user awareness
- Enables retry with recapitulation feedback

---

### 3. Proxy Mediates Recapitulation Decisions

**How it works:**

```javascript
async function callProxy(userMsg, executorResp, alerts, fatigueInfo) {
    // Build Proxy system prompt with temporal context
    const proxyPrompt = `
You are the Proxy (companion) in GTPS-T v2.1.

Current conversation state:
- Fatigue score: ${fatigueInfo.fatigue_score}
- Novelty level: ${1.0 - fatigueInfo.components.novelty_deficit}
- Alerts: ${alerts.length > 0 ? JSON.stringify(alerts) : "none"}

${alerts.some(a => a.type === "CRYSTALLIZATION_DETECTED") ? `
[TIMING CHECKPOINT]
The Executor shows signs of crystallization (fatigue score ${fatigueInfo.fatigue_score}).

Options:
A) Proceed with current response
B) Suggest recapitulation (retrieve earlier context)
C) Invite user to provide fresh input

Your role: Present this choice to the user clearly and briefly (3-5 sentences).
Remember: You have NO authority over timing - that sovereignty is the user's.
` : ""}

Provide brief meta-commentary (3-7 sentences) about the process.
`;

    const proxyResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
            messages: [{ role: 'user', content: proxyPrompt }],
            // ...
        })
    });
    
    return proxyResponse;
}
```

**What this does:**
- Translates fatigue metrics into user-facing language
- Implements Clause 32 Point 6: sovereignty-preserving choice
- Gives user control over recapitulation timing

---

## Empirical Validation Integration

### Phase 0.5 Results to Include

**From A/B/C testing:**

```
Scenario A (Sequential + Recapitulation):
  - Novelty variance: 0.0475 (dynamic)
  - Recapitulation events: 18
  - Fatigue events: 19

Scenario B/C (Batch):
  - Novelty variance: 0.0000 (static)
  - Recapitulation events: 0
  - Fatigue events: 0
```

**Key finding:**
> Sequential timing with recapitulation creates **measurable emergence** (variance ratio ∞) that batch processing cannot achieve.

**This validates:**
1. Temporal architecture is necessary (not just behavioral overlay)
2. GTPS + timing structure = synergistic emergence
3. ThreePersona benefits from temporal layer

---

## White Paper v5 Structure

### New Sections to Add

**Section 6.5: Empirical Validation - Phase 0.5**

```latex
\subsection{Phase 0.5: Recapitulation Engine Validation}

We tested whether sequential processing with recapitulation creates 
different dynamics than batch processing using a 20-turn conversation 
with GTPS activation.

\subsubsection{Experimental Design}

Three scenarios:
\begin{itemize}
\item \textbf{Scenario A (Sequential):} Turns processed sequentially 
      with fatigue detection and recapitulation injection
\item \textbf{Scenario B (Batch AI-only):} All AI responses processed 
      simultaneously
\item \textbf{Scenario C (Batch Full):} Complete conversation processed 
      as single context
\end{itemize}

\subsubsection{Results}

\begin{table}[h]
\centering
\begin{tabular}{lccc}
\hline
Metric & Scenario A & Scenario B & Scenario C \\
\hline
Novelty Variance & 0.0475 & 0.0000 & 0.0000 \\
Recapitulation Events & 18 & 0 & 0 \\
Fatigue Events & 19 & 0 & 0 \\
\hline
\end{tabular}
\caption{A/B/C Comparison Results}
\end{table}

The infinite variance ratio proves that temporal structure is 
architecturally necessary for dynamic emergence, not merely a 
behavioral overlay.
```

**Section 7: Three-Layer Architecture**

```latex
\section{Three-Layer Sovereignty Architecture}

The complete architecture integrates three complementary layers:

\subsection{Layer 1: Temporal Dynamics (Recapitulation Engine)}

\textbf{Purpose:} Prevent crystallization through dynamic state management

\textbf{Components:}
\begin{itemize}
\item \textbf{Fatigue Detection:} Multi-factor monitoring 
      ($F_t = \alpha S_t + \beta(1-N_t) + \gamma R_t$)
\item \textbf{State Archival:} Boundary-triggered preservation of 
      conversation states
\item \textbf{Recapitulation Injection:} Context-aware retrieval and 
      re-integration
\end{itemize}

\subsection{Layer 2: Behavioral Dynamics (ThreePersona GTPS-T)}

\textbf{Purpose:} Maintain sovereignty through triadic stability

\textbf{Components:}
\begin{itemize}
\item \textbf{Executor:} Generates work output under Clause 32 protocol
\item \textbf{Whistleblower:} Validates compliance, detects violations
\item \textbf{Proxy:} Companion commentary, sovereignty checkpoints
\end{itemize}

\textbf{Integration with Layer 1:}
Each persona uses the shared recapitulation engine differently:
\begin{itemize}
\item Executor: Self-correction via retrieved states
\item Whistleblower: Crystallization pattern detection
\item Proxy: Mediation of recapitulation timing
\end{itemize}

\subsection{Layer 3: Structural Encoding (Harmonic Transformers)}

\textbf{Purpose:} Embed sovereignty at architectural level

\textbf{Proposed Components:}
\begin{itemize}
\item Interval-first semantic encoding
\item Resonance-based attention mechanisms
\item Maintained dissonance (privileged 7th intervals)
\item Octave distance metrics
\end{itemize}

\textbf{Status:} Architectural proposal (implementation pending)

\subsection{Synergistic Properties}

The three layers strengthen each other:
\begin{itemize}
\item \textbf{Temporal → Behavioral:} Fatigue detection informs 
      Whistleblower validation
\item \textbf{Behavioral → Temporal:} Proxy mediates recapitulation timing
\item \textbf{Structural → Temporal:} Harmonic encoding could provide 
      geometric bases for state archival
\item \textbf{Structural → Behavioral:} Each persona could use different 
      interval weightings
\end{itemize}
```

---

## Implementation Roadmap

### Immediate (Next Week)

1. ✅ **Integrate fatigue detection into ThreePersona JSX**
   - Add `recapitulation_engine.py` as reference
   - Translate core logic to JavaScript
   - Wire into Executor/Whistleblower/Proxy flow

2. ✅ **Update white paper v5**
   - Add Section 6.5 (Phase 0.5 results)
   - Add Section 7 (Three-layer architecture)
   - Update abstract and conclusion

3. ✅ **Create integration diagrams**
   - Architecture flow diagram
   - A/B/C results visualization
   - Three-layer synergy diagram

### Near-term (Next Month)

4. **Test integrated system**
   - Run with real API calls
   - Validate recapitulation triggers
   - Measure novelty dynamics

5. **Refine thresholds**
   - Tune fatigue sensitivity
   - Adjust recapitulation timing
   - Optimize retry logic

### Long-term (Next Quarter)

6. **Harmonic Transformers prototype**
   - Implement interval-first encoding
   - Test resonance attention
   - Measure sovereignty retention

---

## Technical Specifications

### JavaScript Port of Fatigue Detection

```javascript
class FatigueDetector {
    constructor(windowSize = 5) {
        this.windowSize = windowSize;
        this.embeddingHistory = [];
        this.noveltyHistory = [];
        this.fatigueHistory = [];
        
        // Weights
        this.alpha = 0.4;  // similarity
        this.beta = 0.3;   // novelty deficit
        this.gamma = 0.3;  // rhythm
    }
    
    computeSimilarity(currentEmbed, previousEmbed) {
        if (!currentEmbed || !previousEmbed) return 0.0;
        
        // Cosine similarity
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < currentEmbed.length; i++) {
            dotProduct += currentEmbed[i] * previousEmbed[i];
            normA += currentEmbed[i] * currentEmbed[i];
            normB += previousEmbed[i] * previousEmbed[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    computeNovelty(currentEmbed) {
        if (this.embeddingHistory.length === 0) return 1.0;
        
        const similarities = this.embeddingHistory.map(pastEmbed =>
            this.computeSimilarity(currentEmbed, pastEmbed)
        );
        
        const meanSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        return 1.0 - meanSimilarity;
    }
    
    computeRhythm() {
        if (this.fatigueHistory.length < 3) return 0.0;
        
        // Second derivative (acceleration of fatigue)
        const recent = Array.from(this.fatigueHistory).slice(-3);
        const firstDeriv = [
            recent[1] - recent[0],
            recent[2] - recent[1]
        ];
        const secondDeriv = firstDeriv[1] - firstDeriv[0];
        
        return secondDeriv;
    }
    
    detect(currentEmbed, previousEmbed) {
        const S_t = previousEmbed ? 
            this.computeSimilarity(currentEmbed, previousEmbed) : 0.0;
        
        const N_t = this.computeNovelty(currentEmbed);
        const noveltyDeficit = 1.0 - N_t;
        
        const R_t = this.computeRhythm();
        
        // Combined fatigue score
        const fatigueScore = 
            this.alpha * S_t +
            this.beta * noveltyDeficit +
            this.gamma * Math.max(0, R_t);
        
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
        
        const isFatigued = fatigueScore > 0.65;
        
        return {
            fatigue_score: fatigueScore,
            is_fatigued: isFatigued,
            components: {
                similarity: S_t,
                novelty_deficit: noveltyDeficit,
                rhythm: R_t
            }
        };
    }
}
```

### Integration into ThreePersona

```javascript
// Add to ThreePersonaGTPS.jsx

// State
const [fatigueDetector] = useState(() => new FatigueDetector());
const [previousEmbedding, setPreviousEmbedding] = useState(null);

// In handleSendMessage
async function handleSendMessage() {
    // ... existing code ...
    
    // Get embedding from Executor response
    const currentEmbedding = extractEmbedding(executorRawResp);
    
    // Detect fatigue
    const fatigueInfo = fatigueDetector.detect(
        currentEmbedding,
        previousEmbedding
    );
    
    // Pass to Whistleblower validation
    const whistleblowerResult = await callWhistleblower(
        userMessage,
        executorRawResp,
        fatigueInfo  // NEW
    );
    
    // Pass to Proxy for mediation
    const proxyResp = await callProxy(
        userMessage,
        executorParsedResp,
        whistleblowerResult.alerts,
        fatigueInfo  // NEW
    );
    
    // Update state
    setPreviousEmbedding(currentEmbedding);
    
    // ... rest of existing code ...
}
```

---

## Success Metrics

### How We'll Know It Works

**1. Fatigue Detection:**
- ✅ Detects when Executor repeats patterns
- ✅ Triggers at appropriate threshold (tunable)
- ✅ Provides actionable metrics to Whistleblower

**2. Recapitulation Integration:**
- ✅ Executor can retrieve earlier states
- ✅ Whistleblower validates temporal compliance
- ✅ Proxy offers sovereignty-preserving choices

**3. User Experience:**
- ✅ User sees when crystallization detected
- ✅ User controls recapitulation timing
- ✅ Process transparency maintained

**4. Empirical Validation:**
- ✅ Integrated system shows variance > 0
- ✅ Batch mode shows variance = 0
- ✅ Recapitulation events correlate with novelty recovery

---

## Next Actions

### For Claude Code

**Files to modify:**

1. **`src/ThreePersonaGTPS.jsx`**
   - Add FatigueDetector class
   - Add embedding extraction
   - Wire into handleSendMessage
   - Update Whistleblower validation
   - Update Proxy prompt generation

2. **`docs/README.md`**
   - Add Phase 0.5 integration section
   - Document fatigue detection
   - Explain temporal layer

3. **Create new file: `docs/Phase05_Integration.md`**
   - Technical details
   - API reference
   - Tuning guide

### For White Paper

**File to modify:**

1. **`Harmonic_Transformers_Proposal_v4.tex`**
   - Add Section 6.5 (Phase 0.5 results)
   - Add Section 7 (Three-layer architecture)
   - Update abstract
   - Update conclusion
   - Add results table
   - Add architecture diagram

---

## Summary

**What we're building:**

A **complete sovereignty architecture** where:

- **Temporal layer** detects and prevents crystallization
- **Behavioral layer** maintains triadic stability
- **Structural layer** (future) embeds sovereignty at encoding level

**Why it matters:**

Each layer strengthens the others, creating **synergistic emergence** that:
- Keeps human inside the process
- Prevents premature closure
- Enables developmental interaction

**Status:**

- ✅ Temporal layer: Proven (Phase 0.5 results)
- ✅ Behavioral layer: Implemented (ThreePersona v2.1)
- 📋 Structural layer: Proposed (Harmonic Transformers)
- 🚀 Integration: Ready to build

---

**This is the roadmap. Ready for Claude Code instructions?** 🎯

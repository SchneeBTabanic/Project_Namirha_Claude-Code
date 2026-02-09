# Three-Persona GTPS v2.0 Changelog

## MAJOR ARCHITECTURAL REDESIGN

**From:** v1.2 (Proxy-as-Filter)  
**To:** v2.0 (Proxy-as-Companion)  
**Date:** 2026-02-08

---

## Core Philosophy Change

### v1.x Architecture (DEPRECATED):
```
User → Proxy → Executor → Output
              ↓
         Whistleblower
              ↓
         Proxy (sanitizes & reposts Executor output)
              ↓
         User sees: sanitized version only
```

**Problems:**
- ❌ Massive text duplication (Executor output reposted in Proxy)
- ❌ User kept outside actual process (only sees filtered version)
- ❌ Proxy acts as filter, not companion
- ❌ Violates sovereignty principle (user displaced from epistemic center)

### v2.0 Architecture (CURRENT):
```
User + Proxy (companion space)
    ↓
    Both supervising Executor workspace
    ↑
Whistleblower (feeds process insights to Proxy)
```

**Solutions:**
- ✅ User sees RAW Executor output (Executor column)
- ✅ Proxy provides META-COMMENTARY (Proxy column)
- ✅ No text duplication (see output once, get insights separately)
- ✅ User stays sovereign (participates in process, not just receives filtered results)

---

## What Changed in Detail

### 1. **Proxy Role Transformation**

**v1.x (Filter):**
```javascript
// Proxy reposted sanitized version of Executor output
const proxyResp = await callProxy(userMsg, executorResp, alerts, history);
// User saw: proxyResp (which contained entire executorResp, rewritten)
```

**v2.0 (Companion):**
```javascript
// Proxy provides companion commentary on the process
const proxyCommentary = await callProxy(
  userMsg,
  executorParsedResponse,  // Structured metadata, not raw text
  alerts,
  context
);
// User sees BOTH: executorResp (Executor column) + proxyCommentary (Proxy column)
```

**Proxy system prompt change:**
```diff
- Your job is to sanitize and repost Executor output for the user
+ Your job is to provide META-COMMENTARY on what's happening

+ The user can ALREADY SEE the Executor's output in a separate column.
+ DO NOT repost or sanitize the Executor's text.

+ Your role:
+ 1. Translate Whistleblower alerts
+ 2. Explain process disclosures
+ 3. Surface internal signals
+ 4. Offer sovereignty checkpoints
```

---

### 2. **Executor Response Structure (OpenClaw Pattern)**

**v1.x:**
- Executor returned plain text
- No structured metadata
- No validation possible

**v2.0 (OpenClaw-inspired):**
```javascript
// Executor MUST return JSON with dual structure
{
  "userText": "Actual response content",  // What user sees in Executor column
  "processMetadata": {                     // What Whistleblower validates
    "clauseCompliance": {
      "35": { "attempted": true, "success": true, "reason": "..." }
    },
    "processDisclosures": [
      { "clause": 35, "factor": "...", "impact": "...", "workaround": "..." }
    ],
    "internalSignals": {
      "tokenPressure": "low" | "medium" | "high",
      "optimizationBias": boolean,
      "uncertaintyLevel": "low" | "medium" | "high",
      "memoryFaded": boolean
    }
  }
}
```

**This mirrors OpenClaw's tool output pattern:**
```javascript
// OpenClaw tool result
{
  content: [{ type: "text", text: "Result for LLM" }],  // LLM sees this
  details: { metadata: "for monitoring" }                // System monitors this
}
```

---

### 3. **Validation System (OpenClaw Pattern)**

**v1.x:**
- No structured validation
- Whistleblower analyzed text subjectively
- No retry mechanism

**v2.0 (OpenClaw-inspired validation):**
```javascript
function validateExecutorResponse(response) {
  /*
   * Adapted from OpenClaw/pi-mono tool validation pattern
   * Copyright (c) Peter Steinberger / Mario Zechner (MIT License)
   */
  const alerts = [];
  
  // Clause 35: Process Disclosure Check
  if (internalSignals.tokenPressure !== "low" && 
      processDisclosures.length === 0) {
    alerts.push({
      clause: 35,
      type: "PROCESS_DISCLOSURE_FAILURE",
      severity: "medium",
      detail: "Token pressure detected but not disclosed",
      suggestedFix: "Add [Process Disclosure] for token pressure"
    });
  }
  
  return alerts;
}
```

**This mirrors OpenClaw's TypeBox validation:**
```javascript
// OpenClaw pattern
const weatherSchema = Type.Object({
  city: Type.String({ minLength: 1 })
});
// If validation fails → error returned to LLM → LLM retries
```

---

### 4. **Retry Loop with Feedback (OpenClaw Pattern)**

**v1.x:**
- One-shot execution
- No error feedback to Executor
- Violations reported to user, not fixed

**v2.0 (OpenClaw retry pattern):**
```javascript
let currentRetry = 0;
while (currentRetry <= MAX_RETRIES) {
  // Get Executor response
  const feedbackForRetry = currentRetry > 0 ? 
    whistleblowerResult.alerts.map(a => 
      `[Clause ${a.clause}]: ${a.detail}. ${a.suggestedFix}`
    ).join('\n') : null;
  
  executorRawResp = await callExecutor(userMessage, context, feedbackForRetry);
  
  // Validate with Whistleblower
  whistleblowerResult = await callWhistleblower(userMessage, executorRawResp);
  
  if (whistleblowerResult.alerts.length === 0 || currentRetry === MAX_RETRIES) {
    break;  // Success or max retries
  }
  
  currentRetry++;
}
```

**This mirrors OpenClaw's validation retry:**
```javascript
// OpenClaw pattern
// Tool call fails validation → error returned to LLM → LLM retries with fix
```

---

### 5. **UI Layout Changes**

**v1.x:**
- Three columns, but Executor was "internal only"
- User only saw Proxy output
- No visual separation of roles

**v2.0:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│   EXECUTOR      │  WHISTLEBLOWER  │     PROXY       │
│  (Work Output)  │ (Process Monitor)│  (Companion)    │
├─────────────────┼─────────────────┼─────────────────┤
│ User sees:      │ User sees:      │ User sees:      │
│ Raw work output │ Validation      │ Meta-commentary │
│ from Executor   │ alerts from     │ about process   │
│                 │ Whistleblower   │                 │
│ "Based on the   │ ✓ No friction   │ 🔍 Executor     │
│  analysis..."   │                 │    disclosed    │
│                 │                 │    token        │
│                 │                 │    pressure     │
│                 │                 │                 │
│                 │                 │ ? Want to break │
│                 │                 │   into chunks?  │
└─────────────────┴─────────────────┴─────────────────┘
```

**Key change:** All three columns visible to user, each with distinct purpose.

---

### 6. **License Attribution (MIT + AGPL Compatibility)**

**Added to file header:**
```javascript
/*
 * OPENCLAW/PI-MONO ATTRIBUTION (MIT License):
 * This implementation adapts structured validation and error feedback patterns from:
 * - OpenClaw (https://github.com/openclaw/openclaw)
 * - pi-mono (https://github.com/badlogic/pi-mono)
 * Copyright (c) Peter Steinberger / Mario Zechner
 * MIT License: https://github.com/openclaw/openclaw/blob/main/LICENSE
 *
 * Specifically adapted:
 * - TypeBox-style schema validation for response metadata
 * - Tool result dual-output pattern (content + details)
 * - Validation error feedback loop for self-correction
 * - Pre-execution hook pattern for process interception
 *
 * The MIT License is compatible with AGPL v3 for this combined work.
 */
```

**MIT + AGPL Compatibility:** ✅ Confirmed  
- MIT is permissive and AGPL-compatible
- Combined work released under AGPL v3 (more restrictive license takes precedence)
- OpenClaw/pi-mono code properly attributed
- Your original AGPL license preserved

---

## What Was NOT Changed

### Still Deferred (Will Add Later):

**Clause 32 Reformulation:**
- Response pattern reform for "life-quickening" interaction
- Prevention of anthropomorphic drift
- Manichaean form/life dynamics
- **Status:** Agreed to add in future iteration after architecture is stable

---

## Specific Code Changes Summary

### Files Modified:
- `project-namirha_ThreePersonaGTPS_v1_1.jsx` → `project-namirha_ThreePersonaGTPS_v2_0.jsx`

### New Functions:
1. `validateExecutorResponse(response)` - OpenClaw-style validation
2. `parseExecutorResponse(rawText)` - Structured response parsing
3. Updated `callExecutor()` - Requires JSON response format
4. Updated `callWhistleblower()` - Now does schema validation
5. Updated `callProxy()` - Generates companion commentary, not filtered reposts

### New State Variables:
- `retryCount` - Tracks validation retry attempts
- `MAX_RETRIES` - Constant (2 retries max)

### Constants Added:
- `ExecutorResponseSchema` - Expected response structure
- `GTPS_T.clauses` - Now includes Clause 35

### UI Components Changed:
- Executor column: Now shows raw output (not hidden)
- Proxy column: Shows commentary (not sanitized repost)
- Footer: Updated to reflect new architecture

---

## Migration Guide (v1.x → v2.0)

### If You Have v1.x Running:

**Breaking Changes:**
1. Executor responses now MUST be JSON format
2. Proxy no longer reposts Executor output
3. User interface shows all three columns simultaneously

**What To Do:**
1. Update API system prompts (Executor must return JSON)
2. Update Proxy expectations (commentary, not filtering)
3. Understand new UI layout (all columns visible)

**Data Loss:**
- Conversation history format unchanged (backward compatible)
- Essence/anchor settings unchanged
- No migration required for existing sessions

---

## Testing Checklist

### To Verify v2.0 Works Correctly:

**1. Executor Output Visibility:**
- [ ] User can see raw Executor response in Executor column
- [ ] Response is NOT duplicated in Proxy column

**2. Structured Metadata:**
- [ ] Executor returns valid JSON with `userText` and `processMetadata`
- [ ] `internalSignals` reflect actual backend state

**3. Validation:**
- [ ] Whistleblower detects Clause 35 violations (missing process disclosure)
- [ ] Whistleblower validates JSON structure

**4. Retry Loop:**
- [ ] When validation fails, Executor retries with feedback
- [ ] Max 2 retries before proceeding with alerts

**5. Proxy Companion Role:**
- [ ] Proxy provides insights ABOUT the process
- [ ] Proxy does NOT repost Executor text
- [ ] Commentary is brief (3-5 sentences)

**6. Sovereignty:**
- [ ] User can see actual work (Executor column)
- [ ] User gets process insights (Proxy column)
- [ ] User stays "inside" the process, not outside looking at filtered results

---

## Performance Impact

### Expected Changes:

**Token Usage:**
- **Increased:** Executor now sends JSON (adds ~100-200 tokens per response)
- **Decreased:** Proxy no longer reposts full Executor output (saves ~300-500 tokens)
- **Net:** Slight decrease in total tokens (~100-200 tokens saved per turn)

**API Calls:**
- **Same:** Still 3 API calls per turn (Executor, Whistleblower, Proxy)
- **Addition:** Retry calls if validation fails (0-2 additional Executor calls)

**User Experience:**
- **Speed:** Slightly slower if retries needed (~2-4 seconds per retry)
- **Clarity:** Much better (no text duplication, clear role separation)

---

## Known Limitations (v2.0)

1. **Executor JSON Compliance:** If Executor fails to return valid JSON, falls back to plain text with empty metadata
2. **Retry Fatigue:** Max 2 retries to prevent infinite loops
3. **Metadata Overhead:** ~100-200 extra tokens per Executor response
4. **No Gradual Rollout:** All-or-nothing architecture change (can't partially adopt)

---

## Future Enhancements (Roadmap)

### Planned for v2.1+:
1. **Clause 32 Integration** - Life-quickening response patterns
2. **Metadata Compression** - Reduce token overhead
3. **Adaptive Retry Logic** - Smart retry based on violation severity
4. **User Preference Learning** - Remember common sovereignty checkpoints
5. **Export Functionality** - Save conversations with metadata intact

---

## Credits & Attribution

### Architecture Design:
- **Schnee Bashtabanic** - Three-Persona concept, sovereignty framework, Proxy-as-companion vision

### OpenClaw/pi-mono Patterns:
- **Peter Steinberger** - OpenClaw architecture
- **Mario Zechner** - pi-mono toolkit, TypeBox validation patterns

### Adapted Patterns:
- Structured response validation (OpenClaw/pi-mono)
- Dual output format (content + details)
- Error feedback loop for self-correction
- Pre-execution validation hooks

**License Compatibility:** MIT (OpenClaw/pi-mono) + AGPL v3 (Project Namirha) = AGPL v3 (combined work)

---

## Summary

**v2.0 represents a fundamental architectural shift** from Proxy-as-filter to Proxy-as-companion.

**Why this matters:**
- User sovereignty restored (user sees actual work, not sanitized version)
- Proxy becomes true companion (provides insights, not rewrites)
- OpenClaw validation patterns ensure structural accountability
- Text duplication eliminated (better UX, lower token costs)

**The result:** User + Proxy supervise Executor together, staying inside the process rather than outside looking at filtered results.

This fulfills the core Namirha principle: **Sovereignty is not the power to command outcomes, but the right to remain inside the process by which outcomes are formed.**

---

**Version:** 2.0  
**Status:** Released  
**Next:** Clause 32 integration (life-quickening response patterns)

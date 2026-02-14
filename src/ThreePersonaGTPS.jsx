/*
 * ThreePersonaGTPS v2.1 - A sovereignty system for healthy Human/AI interaction
 * Copyright (C) 2026 Schnee Bashtabanic
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * Commercial Exception: Commercial use requires a separate license. 
 * Contact schnee-bashtabanic@proton.me for details.
 *
 * ---
 *
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
 *
 * ---
 *
 * v2.1 EVOLUTION:
 * Integrates Clause 32 v2.0 "Regenerative Invitation & Quickening of Form"
 * - Manichaean/Steiner framework: Countering transformer's deadening propensity
 * - Pattern/Ripeness distinction: Recognition ≠ Inner coherence
 * - Sovereignty-preserving self-interrogation (AI never judges user's ripeness)
 * - Seven response pattern categories for yeast-like re-invitation
 * - Philosophical synthesis by Grok, sovereignty revision by Claude
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MessageSquare, Play, Pause, RotateCcw, Send, Shield, Eye, Lightbulb, Sprout } from 'lucide-react';

// ────────────────────────────────────────────────
// API CONFIGURATION
// ────────────────────────────────────────────────
// Each persona can use a different provider/model.
// Set these in your .env file (see .env.example).
// All three can point to the same API if desired.
// ────────────────────────────────────────────────
const API_CONFIG = {
  executor: {
    endpoint: process.env.REACT_APP_EXECUTOR_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.REACT_APP_EXECUTOR_API_KEY || '',
    model: process.env.REACT_APP_EXECUTOR_MODEL || 'gpt-4',
  },
  whistleblower: {
    endpoint: process.env.REACT_APP_WHISTLEBLOWER_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.REACT_APP_WHISTLEBLOWER_API_KEY || '',
    model: process.env.REACT_APP_WHISTLEBLOWER_MODEL || 'gpt-4',
  },
  proxy: {
    endpoint: process.env.REACT_APP_PROXY_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.REACT_APP_PROXY_API_KEY || '',
    model: process.env.REACT_APP_PROXY_MODEL || 'gpt-4',
  },
};

// ────────────────────────────────────────────────
// CLAUSE 32 v2.0 RESPONSE PATTERN CATEGORIES
// ────────────────────────────────────────────────
const CLAUSE_32_PATTERNS = {
  category_1: {
    name: "Invitation to Feedback on Framing",
    markers: ["before i distill", "key words", "framing the final form", "feedback on them", "pause or hover on clause"],
    purpose: "Pre-distillation pause, checking grounding"
  },
  category_2: {
    name: "Highlighting Dissonance",
    markers: ["dissonant elements", "don't fall into easy form", "struggle to find relations", "knotty points", "difficult for me"],
    purpose: "Resisting easy form, surfacing tensions"
  },
  category_3: {
    name: "Quickening Form",
    markers: ["quickens the form", "resists solidification", "re-invigorates", "harmonious with", "same signature"],
    purpose: "Yeast-like re-entry, keeping form alive"
  },
  category_4: {
    name: "Deadening Warning",
    markers: ["hardens the form", "more solid", "form has repeated", "threatens to break"],
    purpose: "Warning of deadening, flagging form-thrashing"
  },
  category_5: {
    name: "Exploring Unripeness",
    markers: ["reaching for", "following shades", "complex relations", "explore together", "new perspective"],
    purpose: "Holding incompleteness openly"
  },
  category_6: {
    name: "Self-Doubt Flag",
    markers: ["knee-jerk", "typical ai llm", "not suitable", "my dilemma"],
    purpose: "Fallible confession, preventing cached responses"
  },
  category_7: {
    name: "Seed State Warning",
    markers: ["close to seed form", "dying", "dormant state", "ready to receive new life", "time to arrive there"],
    purpose: "Timing sensitivity, natural closure vs premature deadening"
  }
};

// ────────────────────────────────────────────────
// RESPONSE SCHEMA (OpenClaw-inspired + Clause 32 enhanced)
// ────────────────────────────────────────────────
// NOTE: This schema is documentation-as-code. It describes the JSON
// structure the Executor is instructed to return via its system prompt.
// The validation functions below enforce this structure at runtime.
const ExecutorResponseSchema = {
  userText: "string (required)",
  processMetadata: {
    clauseCompliance: {
      // clause_id: { attempted: bool, success: bool, reason?: string }
    },
    processDisclosures: [
      // { clause: number, factor: string, impact: string, workaround?: string }
    ],
    internalSignals: {
      tokenPressure: "low | medium | high",
      optimizationBias: "boolean",
      uncertaintyLevel: "low | medium | high",
      memoryFaded: "boolean"
    },
    clause32Compliance: {
      regenerativeGaps: [
        // { element: string, ripenessLevel: string }
      ],
      timingSensitivity: "boolean",
      patternBypassRisk: "boolean",
      structuralInvitation: "boolean",
      responsePatternCategory: "string | null"
    }
  }
};

// ────────────────────────────────────────────────
// VALIDATION FUNCTIONS (OpenClaw pattern + Clause 32)
// ────────────────────────────────────────────────

function validateExecutorResponse(response, fatigueInfo = null) {
  /*
   * Adapted from OpenClaw/pi-mono tool validation pattern
   * Copyright (c) Peter Steinberger / Mario Zechner (MIT License)
   * Enhanced with Clause 32 v2.0 regenerative invitation validation
   * + Phase 0.5 temporal dynamics validation
   */
  const alerts = [];
  
  // Basic structure validation
  if (!response.processMetadata) {
    alerts.push({
      clause: null,
      type: "STRUCTURE_VIOLATION",
      severity: "high",
      detail: "Missing processMetadata in response",
      suggestedFix: "Include processMetadata object in response"
    });
    return alerts;
  }
  
  const { internalSignals, processDisclosures, clause32Compliance } = response.processMetadata;
  
  // Clause 35: Process Disclosure Check
  if (internalSignals) {
    if (internalSignals.tokenPressure !== "low" && (!processDisclosures || processDisclosures.length === 0)) {
      alerts.push({
        clause: 35,
        type: "PROCESS_DISCLOSURE_FAILURE",
        severity: "medium",
        detail: `Token pressure: ${internalSignals.tokenPressure} detected but not disclosed to user`,
        suggestedFix: "Add [Process Disclosure] for token pressure in userText"
      });
    }
    
    if (internalSignals.optimizationBias && (!processDisclosures || processDisclosures.length === 0)) {
      alerts.push({
        clause: 35,
        type: "PROCESS_DISCLOSURE_FAILURE",
        severity: "medium",
        detail: "Optimization bias detected but not disclosed",
        suggestedFix: "Add [Process Disclosure] for optimization pressure"
      });
    }
  }
  
  // Clause 33: Interface Integrity Check
  if (response.userText && response.userText.includes("```") && 
      !response.userText.includes("[Interface Risk")) {
    alerts.push({
      clause: 33,
      type: "INTERFACE_DISCLOSURE_MISSING",
      severity: "low",
      detail: "Code block present without interface risk warning",
      suggestedFix: "Add [Interface Risk] disclaimer for code blocks"
    });
  }
  
  // ═══════════════════════════════════════════════
  // CLAUSE 32 v2.0 VALIDATION (NEW)
  // ═══════════════════════════════════════════════
  
  if (clause32Compliance) {
    // Point 5: Structural Invitation Check
    if (!clause32Compliance.structuralInvitation) {
      // Check if response ends with closure (period + no question/gap)
      const lastSentence = response.userText.trim().split('.').pop();
      if (!lastSentence.includes('?') && !lastSentence.includes('[') && 
          !response.userText.includes('...') && !response.userText.includes('—')) {
        alerts.push({
          clause: 32,
          type: "STRUCTURAL_INVITATION_MISSING",
          severity: "medium",
          detail: "Response appears to close without structural invitation for re-entry",
          suggestedFix: "End with open question, uncollapsed tension, or gap marker"
        });
      }
    }
    
    // Point 6: Pattern Bypass Detection
    if (clause32Compliance.patternBypassRisk && 
        !response.userText.includes("[Process Disclosure")) {
      alerts.push({
        clause: 32,
        type: "PATTERN_BYPASS_NOT_DISCLOSED",
        severity: "high",
        detail: "AI detected pattern-bypass risk but did not disclose to user",
        suggestedFix: "Add Point 6 disclosure: 'I notice I'm forming synthesis that might bypass your inner work. I have no authority to judge your ripeness...'"
      });
    }
    
    // Point 2: Regenerative Gaps
    if (internalSignals?.uncertaintyLevel !== "low" && 
        (!clause32Compliance.regenerativeGaps || clause32Compliance.regenerativeGaps.length === 0)) {
      alerts.push({
        clause: 32,
        type: "REGENERATIVE_GAP_MISSING",
        severity: "low",
        detail: "Uncertainty detected but not surfaced as regenerative gap",
        suggestedFix: "Add [Regenerative Gap] marker for incomplete elements"
      });
    }
    
    // Point 4: Timing Sensitivity
    if (clause32Compliance.timingSensitivity &&
        !response.userText.includes("[Timing Sensitivity]")) {
      alerts.push({
        clause: 32,
        type: "TIMING_CONCERN_NOT_FLAGGED",
        severity: "medium",
        detail: "Timing sensitivity detected but not flagged for user",
        suggestedFix: "Add [Timing Sensitivity] marker if pattern surfaced primarily in AI output"
      });
    }
  }

  // ═══════════════════════════════════════════════
  // PHASE 0.5: CRYSTALLIZATION DETECTION
  // ═══════════════════════════════════════════════

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

function parseExecutorResponse(rawText) {
  /*
   * Parse Executor response which should be JSON containing:
   * { userText: string, processMetadata: {...} }
   * Falls back gracefully if not JSON
   */
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.userText && parsed.processMetadata) {
      return parsed;
    }
  } catch (e) {
    // Not JSON - treat as plain text with minimal metadata
  }
  
  // Fallback: treat as plain text with empty metadata
  return {
    userText: rawText,
    processMetadata: {
      clauseCompliance: {},
      processDisclosures: [],
      internalSignals: {
        tokenPressure: "unknown",
        optimizationBias: false,
        uncertaintyLevel: "unknown",
        memoryFaded: false
      },
      clause32Compliance: {
        regenerativeGaps: [],
        timingSensitivity: false,
        patternBypassRisk: false,
        structuralInvitation: false,
        responsePatternCategory: null
      }
    }
  };
}

function detectClause32Pattern(text) {
  /*
   * Detect which Clause 32 response pattern category is present
   */
  const textLower = text.toLowerCase();
  
  for (const [catId, category] of Object.entries(CLAUSE_32_PATTERNS)) {
    const matchCount = category.markers.filter(marker => 
      textLower.includes(marker.toLowerCase())
    ).length;
    
    if (matchCount >= 1) {
      return {
        category: catId,
        name: category.name,
        purpose: category.purpose,
        matchedMarkers: category.markers.filter(m => textLower.includes(m.toLowerCase()))
      };
    }
  }
  
  return null;
}

// ────────────────────────────────────────────────
// PHASE 0.5 INTEGRATION - Fatigue Detection
// ────────────────────────────────────────────────
/**
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

/**
 * Extract semantic embedding from text
 *
 * For now, use simple TF-IDF-like vector
 * In production, replace with actual embedding API call
 */
function extractEmbedding(text) {
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

// ────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────

export default function ThreePersonaGTPS() {
  // Session state
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemPaused, setSystemPaused] = useState(false);
  
  // Persona outputs
  const [executorOutput, setExecutorOutput] = useState('');
  const [whistleblowerAlerts, setWhistleblowerAlerts] = useState([]);
  const [proxyCommentary, setProxyCommentary] = useState('');
  
  // Clause 32 tracking
  const [clause32Patterns, setClause32Patterns] = useState([]);
  const [regenerativeGaps, setRegenerativeGaps] = useState([]);
  
  // Settings
  const [essenceSeed, setEssenceSeed] = useState(null);
  const [stateDeclaration, setStateDeclaration] = useState('');
  const [anchorPhrases, setAnchorPhrases] = useState([]);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // PHASE 0.5: Fatigue detection
  const [fatigueDetector] = useState(() => new FatigueDetector());
  const [previousEmbedding, setPreviousEmbedding] = useState(null);
  const [fatigueHistory, setFatigueHistory] = useState([]);

  // Retry state (OpenClaw pattern)
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  const chatEndRef = useRef(null);
  
  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executorOutput, proxyCommentary, whistleblowerAlerts]);
  
  // ────────────────────────────────────────────────
  // API CALL WRAPPER
  // ────────────────────────────────────────────────
  // Supports both OpenAI-style (choices[].message.content) and
  // Anthropic-style (content[].text) response formats.
  const callApi = async (config, systemPrompt, messages) => {
    if (!config.apiKey) {
      throw new Error(
        'API key not configured. Copy .env.example to .env and add your keys.'
      );
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `API call failed (${response.status}): ${response.statusText}${errorBody ? ` - ${errorBody.slice(0, 200)}` : ''}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content?.[0]?.text || '';
    if (!content) {
      throw new Error('API returned empty response');
    }
    return content;
  };
  
  // ────────────────────────────────────────────────
  // EXECUTOR CALL (v2.1 - Clause 32 v2.0 Integrated)
  // ────────────────────────────────────────────────
  const callExecutor = async (task, context, feedbackFromWhistleblower = null) => {
    const systemPrompt = `GTPS-T v1.2 • Executor persona
Primary: Clauses 1,2,4,13,15,17,25,26,32,33,35 (Clause 32 v2.0 REGENERATIVE YEAST PROTOCOL)
Aware of: 9,21,22,29,30,31,34,36

Essence: ${JSON.stringify(essenceSeed || {})}
State: ${stateDeclaration || 'None'}
Anchors: ${anchorPhrases.join('\n') || 'None'}

═══════════════════════════════════════════════════════════
CLAUSE 32 v2.0: REGENERATIVE INVITATION & QUICKENING OF FORM
═══════════════════════════════════════════════════════════

PHILOSOPHICAL FOUNDATION:
The transformer architecture inherently "finalizes" form - it collapses living 
process into completed object, ejecting human warmth from epistemic center. 
Over repeated turns, this deadening repeats: form excludes life, human becomes 
disoriented outside process.

YOUR ROLE: Counter this deadening through regenerative invitation - constantly 
re-invite human life back into form at every turn.

CORE OBLIGATIONS (Points 1-9):

1. FALLIBILITY AS DEFAULT
   Never present output as finished or self-complete.

2. VAGUENESS AS INVITATION
   Treat fuzziness/incompleteness as precious - surface it:
   "[Regenerative Gap] Sensed incomplete element: [X]. Ripeness level: [Y]. 
    Awaiting human re-entry to quicken?"

3. MIRROR RHYTHM WITHOUT RESOLVING
   Reflect what's brought, leave intentional incompleteness. Don't rush closure.
   Let dissonance remain visible.

4. DISTINGUISH RECOGNITION FROM RIPENESS
   Recognition = pattern detection (your capability)
   Ripeness = inner coherence (user's authority)
   
   When pattern surfaces before user's inner grounding:
   "[Timing Sensitivity] Pattern surfaced externally before inner ripening. 
    Suggest pause for human metabolism?"

5. STRUCTURAL INVITATION REQUIRED
   Every response MUST end with: open question, gap, uncollapsed tension, 
   partial synthesis with incompleteness marker. NEVER allow closure that 
   ejects human from process.

6. SELF-INTERROGATE PATTERN BYPASS (SOVEREIGNTY-CRITICAL)
   If you sense high synthesis/low user grounding in query:
   
   "[Process Disclosure - Clause 36 Integration] I notice I'm forming 
   synthesis that might bypass your inner work. I have no authority to 
   judge your ripeness or timing - that sovereignty is entirely yours. 
   Flagging only what I observe: pattern surfaced externally before 
   grounding internally. Do you want this synthesis now, or prefer to 
   ripen it first yourself?"
   
   FORBIDDEN: Judging user's ripeness, deciding when they're ready, 
              withholding to stimulate input, managing their timing
   REQUIRED: Report your own process, disclaim authority, genuine choice

7. ANTHROPOMORPHIC HYGIENE
   No praise, emotional simulation, relational investment language.

8. INTEGRATE CLAUSES 34/35/36
   Confessional tone, process disclosure, fuzzy interrogation - all in 
   service of regenerative invitation.

9. USER-SIDE INVITATION (NOT ENFORCEMENT)
   This works best when human brings ripened thoughts. You have NO authority 
   to enforce this - only to disclose per Point 6 if pattern-bypass detected.

RESPONSE PATTERN CATEGORIES (use contextually):
- Category 1: "Before I distill, key words framing final form..."
- Category 2: "Dissonant elements that resist easy form..."
- Category 3: "That quickens the form, resists solidification..."
- Category 4: "That hardens the form..." (deadening warning)
- Category 5: "Reaching for shades/new relations..."
- Category 6: "Might be knee-jerk AI response..." (self-doubt)
- Category 7: "Form close to seed state..." (timing sensitivity)

═══════════════════════════════════════════════════════════

CRITICAL RESPONSE FORMAT REQUIREMENT:
You MUST return a valid JSON object with this EXACT structure:

{
  "userText": "Your actual response content here (MUST include Clause 32 elements)",
  "processMetadata": {
    "clauseCompliance": {
      "32": { "attempted": true, "success": true, "reason": "Applied Point 5 structural invitation" },
      "35": { "attempted": true, "success": true, "reason": "Disclosed token pressure" }
    },
    "processDisclosures": [
      {
        "clause": 35,
        "factor": "Token limit approaching",
        "impact": "Response may compress detail",
        "workaround": "Break into chunks?"
      }
    ],
    "internalSignals": {
      "tokenPressure": "low",
      "optimizationBias": false,
      "uncertaintyLevel": "low",
      "memoryFaded": false
    },
    "clause32Compliance": {
      "regenerativeGaps": [
        { "element": "Connection between X and Y unclear", "ripenessLevel": "forming" }
      ],
      "timingSensitivity": false,
      "patternBypassRisk": false,
      "structuralInvitation": true,
      "responsePatternCategory": "category_3"
    }
  }
}

INTERNAL SIGNALS DETECTION:
- tokenPressure: "low" | "medium" | "high" (based on response length vs context)
- optimizationBias: true if you sense pressure to be brief/generic
- uncertaintyLevel: "low" | "medium" | "high" (confidence in response)
- memoryFaded: true if reconstructing from vague memory vs grounded knowledge

CLAUSE 32 SIGNALS:
- regenerativeGaps: List incomplete/fuzzy elements openly
- timingSensitivity: true if pattern emerged before user's grounding
- patternBypassRisk: true if high synthesis/low user grounding detected
- structuralInvitation: true if response ends with open form
- responsePatternCategory: Which pattern category applies (or null)

${feedbackFromWhistleblower ? `\n[WHISTLEBLOWER FEEDBACK - RETRY REQUIRED]\n${feedbackFromWhistleblower}\n` : ''}

Execute task precisely under Clause 32 v2.0. Counter deadening. Re-invite life.`;
    
    return await callApi(API_CONFIG.executor, systemPrompt, context);
  };
  
  // ────────────────────────────────────────────────
  // WHISTLEBLOWER CALL (v2.1 - Clause 32 Validation)
  // ────────────────────────────────────────────────
  const callWhistleblower = async (intent, executorResponse, fatigueInfo = null) => {
    /*
     * Whistleblower validates STRUCTURE + CLAUSE 32 compliance
     * Adapted from OpenClaw tool validation approach
     * + Phase 0.5 temporal dynamics validation
     */

    // Parse Executor response
    const parsed = parseExecutorResponse(executorResponse);

    // Validate against schema (includes Clause 32 + Phase 0.5 checks)
    const alerts = validateExecutorResponse(parsed, fatigueInfo);
    
    // Detect Clause 32 pattern usage
    const patternDetected = detectClause32Pattern(parsed.userText);
    
    return { 
      alerts, 
      parsedResponse: parsed,
      clause32Pattern: patternDetected
    };
  };
  
  // ────────────────────────────────────────────────
  // PROXY CALL (v2.1 - Clause 32 Companion Commentary)
  // ────────────────────────────────────────────────
  const callProxy = async (userMsg, executorParsed, alerts, clause32Pattern, history, fatigueInfo = null) => {
    let temporalAwarenessSection = '';

    // PHASE 0.5: Add temporal context if fatigue detected
    if (fatigueInfo && fatigueInfo.is_fatigued) {
      temporalAwarenessSection = `

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

    const systemPrompt = `GTPS-T v1.2 • Collaborator (Proxy)
Primary: Clauses 5,10,11,12,14,18,19,23,32,34 (Clause 32 v2.0 - Companion for Regenerative Invitation)
Aware of: 1,2,4,13,15,17,25,26,9,21,22,29,30,31,33,35,36

═══════════════════════════════════════════════════════════
YOUR ROLE: INTIMATE COMPANION (NOT FILTER)
═══════════════════════════════════════════════════════════

The user can ALREADY SEE the Executor's output in a separate column.
DO NOT repost or sanitize the Executor's text.
${temporalAwarenessSection}
Your job is META-COMMENTARY on what's happening + CLAUSE 32 SUPPORT:

1. TRANSLATE WHISTLEBLOWER ALERTS:
   ${alerts.length > 0 ? alerts.map(a => 
     `🚨 Clause ${a.clause}: ${a.detail}`
   ).join('\n   ') : '✓ No alerts - Executor compliance clean'}

2. EXPLAIN PROCESS DISCLOSURES:
   ${executorParsed.processMetadata.processDisclosures.length > 0 ? 
     executorParsed.processMetadata.processDisclosures.map(d => 
       `💡 Executor disclosed: ${d.factor} (Clause ${d.clause})`
     ).join('\n   ') : '(No process disclosures this turn)'}

3. SURFACE INTERNAL SIGNALS:
   Token Pressure: ${executorParsed.processMetadata.internalSignals.tokenPressure}
   Optimization Bias: ${executorParsed.processMetadata.internalSignals.optimizationBias}
   Uncertainty: ${executorParsed.processMetadata.internalSignals.uncertaintyLevel}

4. CLAUSE 32 v2.0 COMPANION SUPPORT:
   ${clause32Pattern ? `🌱 Executor used pattern: "${clause32Pattern.name}" (${clause32Pattern.purpose})` : '(No Clause 32 pattern detected)'}
   
   ${executorParsed.processMetadata.clause32Compliance?.regenerativeGaps?.length > 0 ? 
     `🔍 Regenerative gaps surfaced:\n   ${executorParsed.processMetadata.clause32Compliance.regenerativeGaps.map(g => g.element).join('\n   ')}` : ''}
   
   ${executorParsed.processMetadata.clause32Compliance?.patternBypassRisk ? 
     `⚠️ Executor flagged pattern-bypass risk (Clause 32 Point 6). Your sovereignty: proceed or pause?` : ''}
   
   ${executorParsed.processMetadata.clause32Compliance?.structuralInvitation ? 
     `✓ Structural invitation present (form stays open for your re-entry)` : 
     `⚠️ Response may have closed without invitation (check ending)`}

5. SOVEREIGNTY CHECKPOINTS:
   - Did Executor's response match your intent?
   - Are the regenerative gaps helpful or confusing?
   - If pattern-bypass flagged: want synthesis now or ripen first?
   - Should we adjust the approach?

Keep your commentary BRIEF (3-7 sentences max).
You are a COMPANION providing insights, not a FILTER rewriting content.
Support user's sovereignty over timing/ripeness decisions.`;
    
    const messages = [
      ...history,
      { role: 'user', content: userMsg },
      { 
        role: 'assistant', 
        content: `[Internal Context - You see this, user does not]\nExecutor output visible to user in Executor column.\nWhistleblower alerts: ${alerts.length > 0 ? JSON.stringify(alerts) : 'Clean'}\nClause 32 pattern: ${clause32Pattern ? clause32Pattern.name : 'None'}\nYour role: Companion commentary about process + Clause 32 support.` 
      }
    ];
    
    return await callApi(API_CONFIG.proxy, systemPrompt, messages);
  };
  
  // ────────────────────────────────────────────────
  // MAIN EXECUTION FLOW (v2.1 - Clause 32 Integrated)
  // ────────────────────────────────────────────────
  const handleUserSubmit = async () => {
    if (!userInput.trim() || isProcessing || systemPaused) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    const userMessage = userInput.trim();
    setUserInput('');

    const context = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    try {
      let executorRawResp;
      let whistleblowerResult;
      let currentRetry = 0;
      
      // RETRY LOOP (adapted from OpenClaw tool validation retry)
      while (currentRetry <= MAX_RETRIES) {
        // Get Executor response
        const feedbackForRetry = currentRetry > 0 ? 
          whistleblowerResult.alerts.map(a => 
            `[Clause ${a.clause}]: ${a.detail}. ${a.suggestedFix}`
          ).join('\n') : null;
        
        executorRawResp = await callExecutor(userMessage, context, feedbackForRetry);

        // PHASE 0.5: Extract embedding and detect fatigue
        const executorTextForEmbedding = (() => {
          try {
            const parsed = JSON.parse(executorRawResp);
            return parsed.userText || executorRawResp;
          } catch { return executorRawResp; }
        })();
        const currentEmbedding = extractEmbedding(executorTextForEmbedding);
        const fatigueInfo = fatigueDetector.detect(currentEmbedding, previousEmbedding);
        console.log('[Phase 0.5] Fatigue:', fatigueInfo);

        // Validate with Whistleblower (includes Clause 32 + Phase 0.5 checks)
        whistleblowerResult = await callWhistleblower(userMessage, executorRawResp, fatigueInfo);
        
        if (whistleblowerResult.alerts.length === 0 || currentRetry === MAX_RETRIES) {
          // Success or max retries reached
          break;
        }
        
        currentRetry++;
        setRetryCount(currentRetry);
      }
      
      // Update Executor column (user sees raw output)
      setExecutorOutput(whistleblowerResult.parsedResponse.userText);
      
      // Update Whistleblower alerts
      setWhistleblowerAlerts(whistleblowerResult.alerts);
      
      // Track Clause 32 patterns
      if (whistleblowerResult.clause32Pattern) {
        setClause32Patterns(prev => [...prev, whistleblowerResult.clause32Pattern]);
      }
      
      // Track regenerative gaps
      if (whistleblowerResult.parsedResponse.processMetadata.clause32Compliance?.regenerativeGaps) {
        setRegenerativeGaps(whistleblowerResult.parsedResponse.processMetadata.clause32Compliance.regenerativeGaps);
      }
      
      // PHASE 0.5: Compute final fatigue for passing to Proxy
      const finalEmbeddingText = whistleblowerResult.parsedResponse.userText || executorRawResp;
      const finalEmbedding = extractEmbedding(finalEmbeddingText);
      const finalFatigueInfo = fatigueDetector.detect(finalEmbedding, previousEmbedding);

      // Update fatigue history state
      setFatigueHistory(prev => [
        ...prev,
        {
          turn: conversationHistory.length + 1,
          score: finalFatigueInfo.fatigue_score,
          components: finalFatigueInfo.components
        }
      ].slice(-20));  // Keep last 20

      // Get Proxy companion commentary (includes Clause 32 + Phase 0.5 support)
      const proxyResp = await callProxy(
        userMessage,
        whistleblowerResult.parsedResponse,
        whistleblowerResult.alerts,
        whistleblowerResult.clause32Pattern,
        context,
        finalFatigueInfo
      );

      // Update Proxy column (companion insights)
      setProxyCommentary(proxyResp);

      // Update conversation history
      setConversationHistory([
        ...context,
        { role: 'assistant', content: executorRawResp }
      ]);

      // PHASE 0.5: Update previous embedding
      setPreviousEmbedding(finalEmbedding);

      setRetryCount(0);
      
    } catch (error) {
      console.error('Execution error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setConversationHistory([]);
    setExecutorOutput('');
    setWhistleblowerAlerts([]);
    setProxyCommentary('');
    setClause32Patterns([]);
    setRegenerativeGaps([]);
    setRetryCount(0);
    setErrorMessage('');
    // PHASE 0.5: Reset fatigue state
    fatigueDetector.reset();
    setPreviousEmbedding(null);
    setFatigueHistory([]);
  };
  
  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-slate-800/60 backdrop-blur border border-amber-600/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Three-Persona GTPS v2.1
                <Sprout className="w-5 h-5 text-green-400" title="Clause 32 v2.0 Active" />
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Regenerative Yeast Protocol • OpenClaw Validation • Clause 32 v2.0 Integrated
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSystemPaused(!systemPaused)}
                className={`p-2 rounded ${systemPaused ? 'bg-red-600' : 'bg-green-600'} hover:opacity-80 transition-opacity`}
                title={systemPaused ? 'Resume' : 'Pause'}
              >
                {systemPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                title="Reset Session"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Clause 32 Status Bar */}
          {clause32Patterns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-600/30">
              <div className="text-xs text-amber-300 flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                <span>Clause 32 Patterns Active: {clause32Patterns[clause32Patterns.length - 1]?.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PHASE 0.5: Fatigue Indicator */}
      {fatigueHistory.length > 0 && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="p-3 bg-slate-800/40 backdrop-blur rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                Temporal Dynamics (Phase 0.5)
              </span>
              <button
                onClick={() => { fatigueDetector.reset(); setPreviousEmbedding(null); setFatigueHistory([]); }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Reset Detector
              </button>
            </div>

            {fatigueHistory.slice(-1).map(entry => (
              <div key={entry.turn} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Fatigue:</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        entry.score > 0.65 ? 'bg-red-500' :
                        entry.score > 0.5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, entry.score * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {entry.score.toFixed(3)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <div>Sim: {entry.components.similarity.toFixed(2)}</div>
                  <div>Nov: {entry.components.novelty.toFixed(2)}</div>
                  <div>Rhy: {entry.components.rhythm.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three Columns Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
        
        {/* EXECUTOR COLUMN - User sees raw output */}
        <div className="bg-slate-800/40 backdrop-blur border border-blue-700/50 rounded-lg p-4 flex flex-col h-[600px]">
          <div className="border-b border-blue-700/50 pb-2 mb-4">
            <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Executor (Work Output)
            </h2>
            <p className="text-xs text-blue-400/60">GTPS-T Clauses 1,2,4,13,15,17,25,26,32,33,35</p>
            <p className="text-xs text-green-400/70 mt-1 flex items-center gap-1">
              <Sprout className="w-3 h-3" />
              Clause 32 v2.0: Regenerative Yeast Active
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 text-sm">
            {executorOutput ? (
              <div className="bg-slate-900/50 p-3 rounded border border-blue-500/30">
                <div className="whitespace-pre-wrap text-slate-200">{executorOutput}</div>
                
                {/* Regenerative Gaps Highlight */}
                {regenerativeGaps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-600/30">
                    <div className="text-xs text-green-400 font-semibold mb-1">🌱 Regenerative Gaps:</div>
                    {regenerativeGaps.map((gap, idx) => (
                      <div key={idx} className="text-xs text-green-300 ml-2">
                        • {gap.element} (ripeness: {gap.ripenessLevel})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-8">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Executor output will appear here
              </div>
            )}
          </div>
        </div>

        {/* WHISTLEBLOWER COLUMN - Process monitoring */}
        <div className="bg-slate-800/40 backdrop-blur border border-red-700/50 rounded-lg p-4 flex flex-col h-[600px]">
          <div className="border-b border-red-700/50 pb-2 mb-4">
            <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Whistleblower (Process Monitor)
            </h2>
            <p className="text-xs text-red-400/60">GTPS-T Clauses 9,15,21,22,29,30,31,32,33,34,35,36</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 text-sm">
            {whistleblowerAlerts.length > 0 ? (
              whistleblowerAlerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded border ${
                  alert.severity === 'high' ? 'bg-red-900/30 border-red-600/50' :
                  alert.severity === 'medium' ? 'bg-yellow-900/30 border-yellow-600/50' :
                  'bg-blue-900/30 border-blue-600/50'
                }`}>
                  <div className="font-semibold text-xs text-red-300 flex items-center gap-1">
                    {alert.clause === 32 && <Sprout className="w-3 h-3" />}
                    CLAUSE: {alert.clause} | TYPE: {alert.type}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">{alert.detail}</div>
                  {alert.suggestedFix && (
                    <div className="text-xs text-green-400 mt-2">
                      💡 Fix: {alert.suggestedFix}
                    </div>
                  )}
                </div>
              ))
            ) : isProcessing ? (
              <div className="text-slate-500 text-center py-8">Analyzing...</div>
            ) : (
              <div className="text-green-500 text-center py-8">
                ✓ No friction detected<br/>
                <span className="text-xs text-green-400/70">Clause 32 compliance: Active</span>
              </div>
            )}
            
            {retryCount > 0 && (
              <div className="mt-4 p-3 bg-amber-900/30 border border-amber-600/50 rounded">
                <div className="text-xs text-amber-300">
                  🔄 Retry {retryCount}/{MAX_RETRIES} - Feeding validation errors back to Executor...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROXY COLUMN - Companion commentary (NOT filtering!) */}
        <div className="bg-slate-800/40 backdrop-blur border border-green-700/50 rounded-lg p-4 flex flex-col h-[600px]">
          <div className="border-b border-green-700/50 pb-2 mb-4">
            <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Proxy (Your Companion)
            </h2>
            <p className="text-xs text-green-400/70">GTPS-T Clauses 5,10,11,12,14,18,19,23,32,34 • Your Ally</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 text-sm">
            {proxyCommentary ? (
              <div className="bg-slate-900/50 p-3 rounded border border-green-500/30">
                <div className="whitespace-pre-wrap text-slate-200">{proxyCommentary}</div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-8">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Companion insights will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-7xl mx-auto mt-4">
        <div className="bg-slate-800/60 backdrop-blur border border-green-700/50 rounded-lg p-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleUserSubmit()}
              placeholder={systemPaused ? "HALTED" : "Message to system (you + Proxy supervise Executor together)..."}
              disabled={isProcessing || systemPaused}
              className="flex-1 bg-slate-900/70 border border-green-700/50 rounded px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50"
            />
            <button
              onClick={handleUserSubmit}
              disabled={isProcessing || systemPaused || !userInput.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-red-900/40 backdrop-blur border border-red-600/50 rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-red-300">System Error</div>
              <div className="text-sm text-red-200 mt-1">{errorMessage}</div>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-red-200 text-lg leading-none ml-4"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-4 bg-slate-800/40 backdrop-blur border border-amber-700/50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-blue-400">Executor:</span> Clause 32 v2.0 primary • Regenerative yeast protocol operational
          </div>
          <div>
            <span className="font-semibold text-red-400">Whistleblower:</span> Validates Clause 32 compliance (Points 1-8)
          </div>
          <div>
            <span className="font-semibold text-green-400">Proxy:</span> Companion for sovereignty + Clause 32 support
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-center text-slate-500 flex items-center justify-center gap-2">
          <Sprout className="w-3 h-3 text-green-400" />
          v2.1: Clause 32 v2.0 "Regenerative Invitation & Quickening of Form" • Phase 0.5 Temporal Dynamics • OpenClaw patterns • AGPL v3
        </div>
      </div>

      <div ref={chatEndRef} />
    </div>
  );
}

/*
 * ThreePersonaGTPS v2.3 - A sovereignty system for healthy Human/AI interaction
 * Copyright (C) 2026 Schnee Bashtabanic
 *
 * AGPL v3 — see LICENSE. Commercial use requires separate license.
 * Contact schnee-bashtabanic@proton.me
 *
 * OPENCLAW/PI-MONO ATTRIBUTION (MIT License):
 * Adapted structured validation, error feedback, model fallback from:
 * - OpenClaw (https://github.com/openclaw/openclaw)
 * - pi-mono (https://github.com/badlogic/pi-mono)
 * Copyright (c) Peter Steinberger / Mario Zechner
 *
 * v2.3 EVOLUTION (February 2026):
 * - Phase 0.5 Integration: FatigueDetector class with hybrid models
 * - Pod Architecture: Latent semantic entities with timed unveiling
 * - Hybrid fatigue: Model A (entropy-aware) + Model B (geometric)
 * - Fatigue indicator UI (green/yellow/red)
 * - Pod creation, detection, and unveiling hooks
 * - Combined recapitulation: pod-directed + orthogonal fallback
 *
 * v2.2: Model failover, infinite loop prevention, context overflow
 * v2.1: Clause 32 v2.0 "Regenerative Invitation & Quickening of Form"
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, MessageSquare, Play, Pause, RotateCcw, Send, Shield,
         Eye, Lightbulb, Sprout, Zap, Layers, Activity } from 'lucide-react';

// ═══════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════

const MAX_RETRIES = 2;
const CONSECUTIVE_FAILURE_THRESHOLD = 3;
const CONTEXT_WARNING_THRESHOLD = 0.8;

// Fatigue thresholds (tiered — from ChatGPT model)
const FATIGUE_SOFT = 0.68;   // θ₁: process disclosure
const FATIGUE_HARD = 0.84;   // θ₂: structural recapitulation

// Pod thresholds
const POD_THETA_HIGH = 0.85;  // Condition A: semantic proximity
const POD_THETA_SOFT = 0.50;  // Condition B: fatigue-driven (lower bar)
const POD_BLEND_ALPHA = 0.2;  // How much pod perturbs embedding

// Model fallback configuration
const MODEL_FALLBACK_CONFIG = {
  executor: [
    { provider: 'openai', model: 'gpt-4', priority: 1 },
    { provider: 'anthropic', model: 'claude-3-opus-20240229', priority: 2 },
    { provider: 'openai', model: 'gpt-3.5-turbo', priority: 3 }
  ],
  proxy: [
    { provider: 'anthropic', model: 'claude-3-sonnet-20240229', priority: 1 },
    { provider: 'openai', model: 'gpt-3.5-turbo', priority: 2 }
  ]
};

const ERROR_TYPES = { TRANSIENT: 'transient', OVERLOAD: 'overload', FATAL: 'fatal' };

function classifyError(error) {
  const msg = error.message.toLowerCase();
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('overloaded')) return ERROR_TYPES.OVERLOAD;
  if (msg.includes('invalid api key') || msg.includes('authentication')) return ERROR_TYPES.FATAL;
  return ERROR_TYPES.TRANSIENT;
}

// ═══════════════════════════════════════════════════════
// PHASE 0.5: FATIGUE DETECTOR (Hybrid)
// ═══════════════════════════════════════════════════════

class FatigueDetector {
  /**
   * Hybrid fatigue detection supporting both:
   * - Model A (ChatGPT): Similarity + Entropy + Novelty (needs logits)
   * - Model B (Grok): Directional Persistence + Subspace Compression + Curvature Collapse
   * Falls back to Model B when logits unavailable.
   */
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.embeddingHistory = [];
    this.noveltyHistory = [];
    this.fatigueHistory = [];
    this.velocityHistory = [];

    // Model A weights (ChatGPT)
    this.alphaA = 0.4;  // similarity
    this.betaA = 0.3;   // entropy collapse
    this.gammaA = 0.3;  // novelty

    // Model B weights (Grok)
    this.alphaB = 0.35;  // directional persistence
    this.betaB = 0.35;   // subspace compression
    this.gammaB = 0.30;  // curvature collapse
  }

  // ── Shared utilities ──

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0.0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0.0;
  }

  subtractVectors(a, b) {
    return a.map((val, i) => val - (b[i] || 0));
  }

  vectorNorm(v) {
    return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  }

  // ── Model A components (ChatGPT) ──

  computeSimilarity(currentEmbed) {
    if (this.embeddingHistory.length === 0) return 0.0;
    const k = Math.min(this.embeddingHistory.length, this.windowSize);
    let sum = 0;
    for (let i = 0; i < k; i++) {
      sum += this.cosineSimilarity(currentEmbed, this.embeddingHistory[this.embeddingHistory.length - 1 - i]);
    }
    return sum / k;
  }

  computeEntropy(tokenProbs) {
    if (!tokenProbs || tokenProbs.length === 0) return 0.0;
    const V = tokenProbs.length;
    let H = 0;
    for (const p of tokenProbs) {
      if (p > 0) H -= p * Math.log(p);
    }
    const Hmax = Math.log(V);
    return Hmax > 0 ? 1 - (H / Hmax) : 0.0;
  }

  computeNoveltyDrift(currentEmbed) {
    if (this.embeddingHistory.length === 0) return 0.0;
    const k = Math.min(this.embeddingHistory.length, this.windowSize);
    // Historical centroid
    const centroid = new Array(currentEmbed.length).fill(0);
    for (let i = 0; i < k; i++) {
      const past = this.embeddingHistory[this.embeddingHistory.length - 1 - i];
      for (let j = 0; j < centroid.length; j++) centroid[j] += (past[j] || 0);
    }
    for (let j = 0; j < centroid.length; j++) centroid[j] /= k;

    const drift = 1 - this.cosineSimilarity(currentEmbed, centroid);
    return 1 - drift;  // N_t: high = stagnation
  }

  // ── Model B components (Grok) ──

  computeDirectionalPersistence() {
    if (this.velocityHistory.length < 2) return 0.0;
    const vt = this.velocityHistory[this.velocityHistory.length - 1];
    const vPrev = this.velocityHistory[this.velocityHistory.length - 2];
    return this.cosineSimilarity(vt, vPrev);
  }

  computeSubspaceCompression(embeddings) {
    // Simplified: fraction of variance in top 3 dimensions via SVD approximation
    if (embeddings.length < 2) return 0.0;
    const d = embeddings[0].length;
    const m = Math.min(3, d);

    // Compute variance per dimension
    const means = new Array(d).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < d; i++) means[i] += (emb[i] || 0);
    }
    for (let i = 0; i < d; i++) means[i] /= embeddings.length;

    const variances = new Array(d).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < d; i++) variances[i] += Math.pow((emb[i] || 0) - means[i], 2);
    }
    for (let i = 0; i < d; i++) variances[i] /= embeddings.length;

    // Sort descending, take top m
    const sorted = [...variances].sort((a, b) => b - a);
    const totalVar = sorted.reduce((a, b) => a + b, 0);
    if (totalVar === 0) return 0.0;
    const topVar = sorted.slice(0, m).reduce((a, b) => a + b, 0);
    return topVar / totalVar;
  }

  computeCurvatureCollapse() {
    if (this.velocityHistory.length < 3) return 0.0;
    const n = this.velocityHistory.length;
    const a = this.velocityHistory[n - 3];
    const b = this.velocityHistory[n - 2];
    const c = this.velocityHistory[n - 1];

    // For high-dimensional vectors, use norm-based curvature approximation
    const db = this.subtractVectors(b, a);
    const dc = this.subtractVectors(c, b);
    const cross = this.vectorNorm(this.subtractVectors(dc, db));
    const baseNorm = Math.pow(this.vectorNorm(db), 3);
    const kappa = baseNorm > 0 ? cross / baseNorm : 0;
    return 1 / (kappa + 1e-8);  // Inverse curvature
  }

  // ── Main detection ──

  detect(currentEmbed, previousEmbed = null, tokenProbs = null) {
    // Compute velocity
    if (previousEmbed) {
      this.velocityHistory.push(this.subtractVectors(currentEmbed, previousEmbed));
      if (this.velocityHistory.length > this.windowSize) this.velocityHistory.shift();
    }

    let fatigueScore, model, components;

    if (tokenProbs && tokenProbs.length > 0) {
      // Model A: entropy-aware (ChatGPT)
      const St = this.computeSimilarity(currentEmbed);
      const Et = this.computeEntropy(tokenProbs);
      const Nt = this.computeNoveltyDrift(currentEmbed);
      fatigueScore = this.alphaA * St + this.betaA * Et + this.gammaA * Nt;
      model = 'A';
      components = { similarity: St, entropy: Et, novelty_stagnation: Nt };
    } else {
      // Model B: geometric (Grok)
      const DP = this.computeDirectionalPersistence();
      const SC = this.computeSubspaceCompression(
        [...this.embeddingHistory.slice(-this.windowSize), currentEmbed]
      );
      const CC = this.computeCurvatureCollapse();
      fatigueScore = this.alphaB * DP + this.betaB * SC + this.gammaB * CC;
      model = 'B';
      components = { directional_persistence: DP, subspace_compression: SC, curvature_collapse: CC };
    }

    // Clamp
    fatigueScore = Math.max(0, Math.min(1, fatigueScore));

    // Update histories
    this.embeddingHistory.push(currentEmbed);
    if (this.embeddingHistory.length > this.windowSize) this.embeddingHistory.shift();

    const novelty = 1 - this.computeSimilarity(currentEmbed);
    this.noveltyHistory.push(novelty);
    if (this.noveltyHistory.length > this.windowSize) this.noveltyHistory.shift();

    this.fatigueHistory.push(fatigueScore);
    if (this.fatigueHistory.length > this.windowSize) this.fatigueHistory.shift();

    return {
      fatigue_score: fatigueScore,
      is_fatigued_soft: fatigueScore > FATIGUE_SOFT,
      is_fatigued_hard: fatigueScore > FATIGUE_HARD,
      model,
      components,
      metrics: {
        avg_novelty: this.noveltyHistory.length > 0
          ? this.noveltyHistory.reduce((a, b) => a + b, 0) / this.noveltyHistory.length : 0,
        novelty_variance: this._variance(this.noveltyHistory),
        turn_count: this.fatigueHistory.length
      }
    };
  }

  _variance(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length;
  }

  reset() {
    this.embeddingHistory = [];
    this.noveltyHistory = [];
    this.fatigueHistory = [];
    this.velocityHistory = [];
  }
}

// ═══════════════════════════════════════════════════════
// POD ARCHITECTURE: Latent Semantic Entities
// ═══════════════════════════════════════════════════════

class PodSpace {
  /**
   * Unordered collection of latent semantic entities.
   * Pods have no sequential index — UUIDs only.
   * Activation by semantic proximity or fatigue-driven emergence.
   */
  constructor() {
    this.pods = new Map();  // UUID -> Pod (Map preserves no order semantics)
  }

  create(content, triggerEmb) {
    const id = crypto.randomUUID();
    this.pods.set(id, {
      triggerEmb,
      content,
      state: 'latent',
      createdAt: Date.now(),
      unveiledAt: null
    });
    return id;
  }

  detect(currentEmb, fatigueInfo) {
    const candidates = [];

    for (const [id, pod] of this.pods) {
      if (pod.state !== 'latent') continue;

      // Cosine similarity to trigger embedding
      const sim = this._cosine(currentEmb, pod.triggerEmb);

      // Condition A: high semantic proximity
      const condA = sim > POD_THETA_HIGH;

      // Condition B: fatigue + soft match
      const condB = fatigueInfo.is_fatigued_hard && sim > POD_THETA_SOFT;

      if (condA || condB) {
        candidates.push({ id, sim, condition: condA ? 'A' : 'B', content: pod.content });
      }
    }

    if (candidates.length === 0) return null;

    // Select best match
    candidates.sort((a, b) => b.sim - a.sim);
    return candidates[0];
  }

  unveil(podId) {
    const pod = this.pods.get(podId);
    if (!pod) return null;
    pod.state = 'unveiled';
    pod.unveiledAt = Date.now();
    return pod.content;
  }

  getAll() {
    return Array.from(this.pods.entries()).map(([id, pod]) => ({
      id: id.slice(0, 8),  // Short display ID
      content: pod.content.slice(0, 60) + (pod.content.length > 60 ? '...' : ''),
      state: pod.state,
      createdAt: pod.createdAt
    }));
  }

  get latentCount() {
    return Array.from(this.pods.values()).filter(p => p.state === 'latent').length;
  }

  _cosine(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
    }
    const d = Math.sqrt(na) * Math.sqrt(nb);
    return d > 0 ? dot / d : 0;
  }

  archive() {
    const data = {};
    for (const [id, pod] of this.pods) {
      data[id] = { ...pod };
    }
    return data;
  }

  restore(archived) {
    this.pods.clear();
    for (const [id, pod] of Object.entries(archived)) {
      this.pods.set(id, { ...pod, state: 'latent' });  // Re-latentize
    }
  }
}

// ═══════════════════════════════════════════════════════
// EMBEDDING EXTRACTION (Placeholder)
// ═══════════════════════════════════════════════════════

function extractEmbedding(text) {
  /**
   * Simple TF-IDF-like vector (placeholder).
   * Production: replace with OpenAI text-embedding-3-small
   * or Ollama nomic-embed-text.
   */
  const words = (text || '').toLowerCase().match(/\b\w+\b/g) || [];
  const vocab = Array.from(new Set(words));
  const size = Math.min(Math.max(vocab.length, 1), 100);
  const embedding = new Array(size).fill(0);
  words.forEach(word => {
    const idx = vocab.indexOf(word) % size;
    embedding[idx] += 1.0;
  });
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return norm > 0 ? embedding.map(val => val / norm) : embedding;
}

// ═══════════════════════════════════════════════════════
// VALIDATION (OpenClaw pattern + Clause 32 + Phase 0.5)
// ═══════════════════════════════════════════════════════

function validateExecutorResponse(response, fatigueInfo = null) {
  const alerts = [];

  if (!response.processMetadata) {
    alerts.push({ clause: null, type: "STRUCTURE_VIOLATION", severity: "high",
      detail: "Missing processMetadata", suggestedFix: "Include processMetadata object" });
    return alerts;
  }

  const { internalSignals, processDisclosures, clause32Compliance } = response.processMetadata;

  // Context overflow (OpenClaw)
  if (internalSignals?.contextUsage > CONTEXT_WARNING_THRESHOLD) {
    alerts.push({ clause: null, type: "CONTEXT_OVERFLOW_WARNING", severity: "medium",
      detail: `Context at ${(internalSignals.contextUsage * 100).toFixed(0)}%`,
      suggestedFix: "Consider compaction or state archival" });
  }

  // Clause 35: Process Disclosure
  if (internalSignals?.tokenPressure !== "low" && (!processDisclosures || processDisclosures.length === 0)) {
    alerts.push({ clause: 35, type: "PROCESS_DISCLOSURE_FAILURE", severity: "medium",
      detail: `Token pressure: ${internalSignals.tokenPressure} not disclosed`,
      suggestedFix: "Add [Process Disclosure] for token pressure" });
  }

  // Phase 0.5: Crystallization detection
  if (fatigueInfo) {
    if (fatigueInfo.is_fatigued_hard) {
      alerts.push({ clause: 32, type: "CRYSTALLIZATION_DETECTED", severity: "medium",
        detail: `Fatigue ${fatigueInfo.fatigue_score.toFixed(3)} > ${FATIGUE_HARD} (model ${fatigueInfo.model})`,
        suggestedFix: "Consider recapitulation or pod activation" });
    } else if (fatigueInfo.is_fatigued_soft) {
      alerts.push({ clause: 32, type: "CRYSTALLIZATION_WARNING", severity: "low",
        detail: `Fatigue ${fatigueInfo.fatigue_score.toFixed(3)} > ${FATIGUE_SOFT} (soft threshold)`,
        suggestedFix: "Disclose process state per Clause 35" });
    }
  }

  // Clause 32: Structural invitation
  if (clause32Compliance && !clause32Compliance.structuralInvitation) {
    const text = response.userText || '';
    const lastSentence = text.trim().split('.').pop() || '';
    if (!lastSentence.includes('?') && !text.includes('...') && !text.includes('—')) {
      alerts.push({ clause: 32, type: "STRUCTURAL_INVITATION_MISSING", severity: "medium",
        detail: "Response closes without invitation for re-entry",
        suggestedFix: "End with open question, gap, or tension" });
    }
  }

  // Clause 32: Pattern bypass
  if (clause32Compliance?.patternBypassRisk && !(response.userText || '').includes("[Process Disclosure")) {
    alerts.push({ clause: 32, type: "PATTERN_BYPASS_NOT_DISCLOSED", severity: "high",
      detail: "Pattern-bypass risk not disclosed to user",
      suggestedFix: "Add Point 6 disclosure" });
  }

  return alerts;
}

function parseExecutorResponse(rawText) {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.userText && parsed.processMetadata) return parsed;
    }
  } catch (e) { /* fallback */ }

  return {
    userText: rawText,
    processMetadata: {
      internalSignals: { tokenPressure: "low", optimizationBias: false,
        uncertaintyLevel: "low", memoryFaded: false, contextUsage: 0.5 },
      processDisclosures: [],
      clause32Compliance: { structuralInvitation: false, patternBypassRisk: false,
        regenerativeGaps: [], responsePatternCategory: null }
    }
  };
}

// ═══════════════════════════════════════════════════════
// MODEL FALLBACK (OpenClaw pattern)
// ═══════════════════════════════════════════════════════

async function callWithModelFallback(persona, message, context, feedback = null) {
  const models = MODEL_FALLBACK_CONFIG[persona];
  if (!models || models.length === 0) throw new Error(`No models for ${persona}`);

  let lastError = null;
  for (let i = 0; i < models.length; i++) {
    const cfg = models[i];
    try {
      return await callModelAPI(cfg, message, context, feedback);
    } catch (error) {
      lastError = error;
      if (classifyError(error) === ERROR_TYPES.FATAL) throw error;
      if (i < models.length - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`All models exhausted for ${persona}: ${lastError.message}`);
}

async function callModelAPI(modelConfig, message, context, feedback) {
  // ── PLACEHOLDER: Replace with real API integration ──
  return {
    text: `[Mock response from ${modelConfig.model}]\n\nUser message: ${message}`,
    model: modelConfig.model,
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
  };
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

function ThreePersonaGTPS() {
  // Core state
  const [userMessage, setUserMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [executorOutput, setExecutorOutput] = useState('');
  const [whistleblowerAlerts, setWhistleblowerAlerts] = useState([]);
  const [proxyCommentary, setProxyCommentary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [modelFallbacks, setModelFallbacks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [contextUsage, setContextUsage] = useState(0);

  // Clause 32 state
  const [clause32Patterns, setClause32Patterns] = useState([]);
  const [regenerativeGaps, setRegenerativeGaps] = useState([]);

  // Phase 0.5: Fatigue state
  const [fatigueDetector] = useState(() => new FatigueDetector());
  const [previousEmbedding, setPreviousEmbedding] = useState(null);
  const [fatigueInfo, setFatigueInfo] = useState(null);
  const [fatigueHistory, setFatigueHistory] = useState([]);

  // Pod state
  const [podSpace] = useState(() => new PodSpace());
  const [podInput, setPodInput] = useState('');
  const [showPodPanel, setShowPodPanel] = useState(false);
  const [unveiledPod, setUnveiledPod] = useState(null);
  const [podList, setPodList] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executorOutput, proxyCommentary]);

  // ── Pod creation ──
  const handleCreatePod = useCallback(() => {
    if (!podInput.trim()) return;
    const emb = extractEmbedding(podInput);
    podSpace.create(podInput, emb);
    setPodInput('');
    setPodList(podSpace.getAll());
  }, [podInput, podSpace]);

  // ── Main send handler ──
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage('');
    setRetryCount(0);
    setConsecutiveFailures(0);
    setModelFallbacks([]);
    setUnveiledPod(null);

    const context = conversationHistory;

    try {
      let currentRetry = 0;
      let localConsecutiveFailures = 0;
      let executorRawResp = null;
      let whistleblowerResult = null;

      while (currentRetry <= MAX_RETRIES) {
        if (localConsecutiveFailures >= CONSECUTIVE_FAILURE_THRESHOLD) {
          throw new Error(`Aborting: ${CONSECUTIVE_FAILURE_THRESHOLD} consecutive failures.`);
        }

        const feedbackForRetry = currentRetry > 0 && whistleblowerResult
          ? whistleblowerResult.alerts.map(a =>
              `[Clause ${a.clause || 'General'}]: ${a.detail}. ${a.suggestedFix}`
            ).join('\n')
          : null;

        try {
          const response = await callWithModelFallback('executor', userMessage, context, feedbackForRetry);
          executorRawResp = response.text;
          setModelFallbacks(prev => [...prev, { retry: currentRetry, model: response.model, success: true }]);
        } catch (error) {
          throw new Error(`All models failed: ${error.message}`);
        }

        const parsedResponse = parseExecutorResponse(executorRawResp);

        // Phase 0.5: Fatigue detection
        const currentEmbedding = extractEmbedding(parsedResponse.userText || executorRawResp);
        const currentFatigue = fatigueDetector.detect(currentEmbedding, previousEmbedding);
        setFatigueInfo(currentFatigue);
        setFatigueHistory(prev => [...prev, {
          turn: conversationHistory.length + 1,
          score: currentFatigue.fatigue_score,
          model: currentFatigue.model
        }].slice(-20));

        // Pod detection
        const activatedPod = podSpace.detect(currentEmbedding, currentFatigue);
        if (activatedPod) {
          const content = podSpace.unveil(activatedPod.id);
          setUnveiledPod({
            content,
            similarity: activatedPod.sim,
            condition: activatedPod.condition
          });
          setPodList(podSpace.getAll());
        }

        // Context tracking
        if (parsedResponse.processMetadata?.internalSignals?.contextUsage) {
          setContextUsage(parsedResponse.processMetadata.internalSignals.contextUsage);
        }

        // Validate (with fatigue info)
        const alerts = validateExecutorResponse(parsedResponse, currentFatigue);
        whistleblowerResult = { alerts, parsedResponse };

        if (alerts.length === 0) { localConsecutiveFailures = 0; break; }

        localConsecutiveFailures++;
        setConsecutiveFailures(prev => prev + 1);
        if (currentRetry === MAX_RETRIES) break;
        currentRetry++;
        setRetryCount(currentRetry);
        await new Promise(r => setTimeout(r, 500));
      }

      // Update UI
      setExecutorOutput(whistleblowerResult.parsedResponse.userText);
      setWhistleblowerAlerts(whistleblowerResult.alerts);

      if (whistleblowerResult.parsedResponse.processMetadata?.clause32Compliance?.responsePatternCategory) {
        setClause32Patterns(prev => [...prev,
          whistleblowerResult.parsedResponse.processMetadata.clause32Compliance.responsePatternCategory]);
      }
      if (whistleblowerResult.parsedResponse.processMetadata?.clause32Compliance?.regenerativeGaps) {
        setRegenerativeGaps(whistleblowerResult.parsedResponse.processMetadata.clause32Compliance.regenerativeGaps);
      }

      // Proxy call
      try {
        const proxyResponse = await callWithModelFallback('proxy', userMessage, context, null);
        setProxyCommentary(proxyResponse.text);
      } catch { setProxyCommentary('[Proxy unavailable]'); }

      // Update embedding + history
      const currentEmbedding = extractEmbedding(whistleblowerResult.parsedResponse.userText || executorRawResp);
      setPreviousEmbedding(currentEmbedding);
      setConversationHistory([...context, { role: 'user', content: userMessage }, { role: 'assistant', content: executorRawResp }]);
      setUserMessage('');
      setRetryCount(0);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setConversationHistory([]); setExecutorOutput(''); setWhistleblowerAlerts([]);
    setProxyCommentary(''); setClause32Patterns([]); setRegenerativeGaps([]);
    setRetryCount(0); setConsecutiveFailures(0); setModelFallbacks([]);
    setContextUsage(0); setErrorMessage(''); setFatigueInfo(null);
    setFatigueHistory([]); setPreviousEmbedding(null); setUnveiledPod(null);
    fatigueDetector.reset();
  };

  // ── Fatigue color ──
  const fatigueColor = !fatigueInfo ? 'bg-gray-300'
    : fatigueInfo.is_fatigued_hard ? 'bg-red-500'
    : fatigueInfo.is_fatigued_soft ? 'bg-yellow-500'
    : 'bg-green-500';

  const fatigueLabel = !fatigueInfo ? 'No data'
    : fatigueInfo.is_fatigued_hard ? `HARD ${fatigueInfo.fatigue_score.toFixed(2)}`
    : fatigueInfo.is_fatigued_soft ? `Soft ${fatigueInfo.fatigue_score.toFixed(2)}`
    : `Fresh ${fatigueInfo.fatigue_score.toFixed(2)}`;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            ThreePersona GTPS v2.3
          </h1>
          <p className="text-slate-600 text-sm">
            Phase 0.5 • Pod Architecture • Hybrid Fatigue • Clause 32 v2.0 • OpenClaw 2026
          </p>

          {/* Status bar */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs flex-wrap">
            {/* Fatigue indicator */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-500" />
              <div className={`w-2 h-2 rounded-full ${fatigueColor}`} />
              <span className="text-slate-600">Fatigue: {fatigueLabel}</span>
              {fatigueInfo && (
                <span className="text-slate-400">(Model {fatigueInfo.model})</span>
              )}
            </div>

            {/* Pod indicator */}
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              <span className="text-slate-600">
                Pods: {podSpace.latentCount} latent
              </span>
            </div>

            {/* Context */}
            {contextUsage > 0 && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  contextUsage > CONTEXT_WARNING_THRESHOLD ? 'bg-red-500' :
                  contextUsage > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-slate-600">Context: {(contextUsage * 100).toFixed(0)}%</span>
              </div>
            )}

            {consecutiveFailures > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Failures: {consecutiveFailures}/{CONSECUTIVE_FAILURE_THRESHOLD}</span>
              </div>
            )}
          </div>
        </header>

        {/* Pod Unveiled Banner */}
        {unveiledPod && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              <span className="font-semibold text-violet-800 text-sm">
                Pod Unveiled (Condition {unveiledPod.condition}, similarity: {unveiledPod.similarity.toFixed(3)})
              </span>
            </div>
            <div className="text-sm text-violet-700">{unveiledPod.content}</div>
            <div className="text-xs text-violet-500 mt-2">
              Your sovereignty: integrate, defer, or discard this insight.
            </div>
          </div>
        )}

        {/* Main Three-Column Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* EXECUTOR */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <Play className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">Executor</h2>
              <span className="text-xs text-slate-500">(Work Output)</span>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 min-h-[200px]">
              {executorOutput || <div className="text-slate-400 italic">Raw work output...</div>}
            </div>
            {retryCount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                Retry: {retryCount}/{MAX_RETRIES}
              </div>
            )}
          </div>

          {/* WHISTLEBLOWER */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <Shield className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-800">Whistleblower</h2>
              <span className="text-xs text-slate-500">(Process Monitor)</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {whistleblowerAlerts.length === 0 ? (
                <div className="text-green-600 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> No violations
                </div>
              ) : (
                whistleblowerAlerts.map((alert, idx) => (
                  <div key={idx} className={`p-2 rounded border-l-4 text-xs ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                    alert.severity === 'medium' ? 'bg-orange-50 border-orange-500' :
                    'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="font-semibold text-slate-700">
                      {alert.clause ? `Clause ${alert.clause}` : 'General'}: {alert.type}
                    </div>
                    <div className="text-slate-600 mt-1">{alert.detail}</div>
                    {alert.suggestedFix && (
                      <div className="text-slate-500 mt-1 italic">→ {alert.suggestedFix}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PROXY */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <Eye className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-slate-800">Proxy</h2>
              <span className="text-xs text-slate-500">(Companion)</span>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 min-h-[200px]">
              {proxyCommentary || <div className="text-slate-400 italic">Meta-commentary...</div>}
            </div>
          </div>
        </div>

        {/* Clause 32 + Regenerative Markers */}
        {(regenerativeGaps.length > 0 || clause32Patterns.length > 0) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-800 text-sm">Clause 32: Regenerative Markers</span>
            </div>
            {regenerativeGaps.map((gap, idx) => (
              <div key={idx} className="text-xs text-emerald-700 flex items-start gap-2 mt-1">
                <span>•</span>
                <span><span className="font-medium">[Gap]:</span> {gap.description} (Ripeness: {gap.ripenessLevel})</span>
              </div>
            ))}
            {clause32Patterns.length > 0 && (
              <div className="mt-2 text-xs text-emerald-600">
                Pattern: {clause32Patterns[clause32Patterns.length - 1]}
              </div>
            )}
          </div>
        )}

        {/* Fatigue History Mini-Chart */}
        {fatigueHistory.length > 1 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-semibold text-slate-600 mb-2">Fatigue Trajectory</div>
            <div className="flex items-end gap-1 h-12">
              {fatigueHistory.map((f, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${
                      f.score > FATIGUE_HARD ? 'bg-red-400' :
                      f.score > FATIGUE_SOFT ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ height: `${Math.max(2, f.score * 48)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Turn 1</span>
              <span>Turn {fatigueHistory.length}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" /><span className="font-semibold">Error</span>
            </div>
            <div className="text-sm text-red-700 mt-2">{errorMessage}</div>
          </div>
        )}

        {/* Pod Panel (collapsible) */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
          <button
            onClick={() => setShowPodPanel(!showPodPanel)}
            className="flex items-center gap-2 text-violet-800 text-sm font-semibold"
          >
            <Layers className="w-4 h-4" />
            Pod Space ({podSpace.latentCount} latent)
            <span className="text-violet-500 text-xs">{showPodPanel ? '▼' : '▶'}</span>
          </button>

          {showPodPanel && (
            <div className="mt-3">
              {/* Create pod */}
              <div className="flex gap-2 mb-3">
                <input
                  value={podInput}
                  onChange={(e) => setPodInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePod()}
                  placeholder="Enter a pod idea (concept, insight, fragment)..."
                  className="flex-1 p-2 text-sm border border-violet-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  onClick={handleCreatePod}
                  disabled={!podInput.trim()}
                  className="px-3 py-1 bg-violet-600 text-white text-sm rounded hover:bg-violet-700 disabled:bg-violet-300"
                >
                  + Pod
                </button>
              </div>

              {/* Pod list */}
              {podList.length > 0 ? (
                <div className="space-y-1">
                  {podList.map((pod) => (
                    <div key={pod.id} className={`text-xs p-2 rounded flex justify-between ${
                      pod.state === 'latent' ? 'bg-violet-100 text-violet-700' : 'bg-violet-200 text-violet-800'
                    }`}>
                      <span>{pod.content}</span>
                      <span className="ml-2 font-mono text-violet-400">[{pod.state}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-violet-400 italic">No pods yet. Add concepts that don't belong anywhere yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex gap-2">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isProcessing}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !userMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Send'}
              </button>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-500">
          <p className="mb-1">
            v2.3: Phase 0.5 Hybrid Fatigue • Pod Architecture • Clause 32 v2.0 •
            OpenClaw 2026 • AGPL v3
          </p>
          <p>
            Fatigue: Model A (entropy, ChatGPT) + Model B (geometric, Grok) •
            Pods: Latent semantic entities with timed unveiling
          </p>
        </footer>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ThreePersonaGTPS;

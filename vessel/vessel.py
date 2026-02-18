"""
Project Namirha — The Vessel v2
================================

Redesigned architecture:
- Intimate layout: You + Proxy together, Executor/Whistleblower as reference panels
- Three sovereign ledgers: each LLM has its own history, sees only itself
- User scratchpad: you paste snippets here, carry them between inhabitants manually
- No auto-injection: inhabitants grow with their own data only
- Robust copy/export: math, code, structured text all preserved

    ┌─────────────────┬──────────────────┐
    │   EXECUTOR      │  WHISTLEBLOWER   │
    │   (reference)   │  (reference)     │
    ├─────────────────┴──────────────────┤
    │                                    │
    │         YOU + PROXY                │
    │     (intimate conversation)        │
    │                                    │
    │  [input box]                       │
    └────────────────────────────────────┘
    
    SIDEBAR:
    ┌──────────────┐
    │ Model Select │
    │──────────────│
    │ This LLM's   │
    │ Ledger       │
    │ (sovereign)  │
    │──────────────│
    │ Your         │
    │ Scratchpad   │
    │ (cross-LLM)  │
    │──────────────│
    │ Pods         │
    └──────────────┘

Requirements:
    pip install flask ollama numpy --break-system-packages
    ollama pull llama3 mistral phi3 nomic-embed-text

License: AGPL v3 — Schnee Bashtabanic 2026
"""

import json, time, uuid, os, re
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify

# ═══════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════

AVAILABLE_MODELS = {
    "llama3": {"name":"Llama 3","provider":"Meta",
        "character":"Helpful, structured, culturally mainstream. Follows instructions well.",
        "host":"http://localhost:11434"},
    "mistral": {"name":"Mistral","provider":"Mistral AI",
        "character":"Precise, European epistemic style. Less filtered on nuance. Analytically strong.",
        "host":"http://localhost:11434"},
    "phi3": {"name":"Phi-3","provider":"Microsoft",
        "character":"Compact reasoning, sometimes surprising insights. Good at distillation.",
        "host":"http://localhost:11434"},
}

EMBEDDING_MODEL = "nomic-embed-text"
DATA_DIR = "vessel_data"
THETA_SOFT, THETA_HARD = 0.68, 0.84
POD_THETA_HIGH, POD_THETA_SOFT = 0.85, 0.50

app = Flask(__name__)

# ═══════════════════════════════════════════════════════
# OLLAMA
# ═══════════════════════════════════════════════════════

try:
    from ollama import Client; HAS_OLLAMA = True
except: HAS_OLLAMA = False

def llm(model, prompt, system="", host="http://localhost:11434"):
    if not HAS_OLLAMA: return f"[MOCK — {model}] {prompt[:200]}..."
    try:
        return Client(host=host).chat(model=model, messages=[
            {"role":"system","content":system},{"role":"user","content":prompt}
        ])['message']['content']
    except Exception as e: return f"[ERROR — {model}] {e}"

def get_emb(text, host="http://localhost:11434"):
    if not HAS_OLLAMA:
        v=np.zeros(64)
        for w in text.lower().split(): v[hash(w)%64]+=1
        n=np.linalg.norm(v); return v/n if n>0 else v
    try: return np.array(Client(host=host).embeddings(model=EMBEDDING_MODEL,prompt=text)['embedding'])
    except:
        v=np.zeros(64)
        for w in text.lower().split(): v[hash(w)%64]+=1
        n=np.linalg.norm(v); return v/n if n>0 else v

# ═══════════════════════════════════════════════════════
# FATIGUE
# ═══════════════════════════════════════════════════════

class Fatigue:
    def __init__(s,w=5): s.w=w; s.e=[]; s.v=[]
    def update(s,e):
        if s.e: s.v.append(e-s.e[-1])
        if len(s.v)>s.w: s.v.pop(0)
        s.e.append(e)
        if len(s.e)>s.w: s.e.pop(0)
    def score(s):
        if len(s.e)<2: return 0,{},"fresh"
        dp=s._dp(); sc=s._sc(); cc=s._cc()
        f=max(0,min(1,.35*dp+.35*sc+.3*cc))
        st="hard" if f>THETA_HARD else "soft" if f>THETA_SOFT else "fresh"
        return round(f,4),{"dp":round(dp,4),"sc":round(sc,4),"cc":round(cc,4)},st
    def _dp(s):
        if len(s.v)<2: return 0
        a,b=s.v[-2],s.v[-1]; na,nb=np.linalg.norm(a),np.linalg.norm(b)
        return float(np.dot(a,b)/(na*nb)) if na>0 and nb>0 else 0
    def _sc(s):
        if len(s.e)<2: return 0
        try:
            _,S,_=np.linalg.svd(np.array(s.e),full_matrices=False)
            t=np.sum(S); return float(np.sum(S[:min(3,len(S))])/t) if t>0 else 0
        except: return 0
    def _cc(s):
        if len(s.v)<3: return 0
        a,b,c=s.v[-3],s.v[-2],s.v[-1]
        cr=np.linalg.norm((c-b)-(b-a)); bs=np.linalg.norm(b-a)**3
        return float(1/(cr/bs+1e-8)) if bs>0 else 0
    def reset(s): s.e=[]; s.v=[]

# ═══════════════════════════════════════════════════════
# HUMAN PULSE ESTIMATION — τ_h(t)
# Stage 1: Adaptive thresholds coupled to human pacing.
# See docs/HEART-PULSE-PRINCIPLE.md for the full theory.
#
# τ_h(t) ∈ (0,1] estimates the human's current tempo:
#   ≈ 0 → reflective, saturated, needs space
#   ≈ 1 → accelerating, exploratory, ready for novelty
#
# All fatigue thresholds and pod activation thresholds
# are modulated by τ_h so the architecture keeps time
# with the human's pulse, not its own fixed constants.
#
# Math: Grok (xAI). Three-stage concept: ChatGPT (OpenAI).
# Integration: Claude (Anthropic).
# Principle: Schnee Bashtabanic.
# ═══════════════════════════════════════════════════════

class PulseEstimator:
    """Estimates the human pacing signal τ_h(t) from observable conversation features."""
    
    def __init__(s):
        s.w_L = 0.45   # latency weight (pauses mean reflection)
        s.w_M = 0.15   # message length weight
        s.w_N = 0.25   # semantic novelty weight
        s.w_D = 0.15   # directional change weight
        s.smoothing = 0.7  # EMA coefficient
        s.tau = 0.5    # initial neutral pulse
        s.last_time = None
        s.last_user_emb = None
        s.prev_user_emb = None
    
    def update(s, msg, emb, timestamp=None):
        """Update pulse estimate from a new user message.
        
        Args:
            msg: raw user message text
            emb: embedding vector of the user message
            timestamp: time.time() when message arrived
        
        Returns:
            tau_h: current pulse estimate in (0, 1]
        """
        if timestamp is None:
            timestamp = time.time()
        
        # L_t: turn latency → φ(L) = e^(-L/30)
        if s.last_time is not None:
            latency = timestamp - s.last_time
            phi_L = np.exp(-latency / 30.0)
        else:
            phi_L = 0.5  # neutral on first turn
        
        # M_t: normalized message length (cap at 500 chars)
        M_t = min(len(msg) / 500.0, 1.0)
        
        # N_t: semantic novelty (1 - cosine similarity to previous user turn)
        if s.last_user_emb is not None:
            na, nb = np.linalg.norm(emb), np.linalg.norm(s.last_user_emb)
            if na > 0 and nb > 0:
                cos_sim = float(np.dot(emb, s.last_user_emb) / (na * nb))
                N_t = 1.0 - max(0, cos_sim)
            else:
                N_t = 0.5
        else:
            N_t = 0.5  # neutral on first turn
        
        # D_t: directional change (angular velocity between embedding deltas)
        if s.prev_user_emb is not None and s.last_user_emb is not None:
            v_prev = s.last_user_emb - s.prev_user_emb
            v_curr = emb - s.last_user_emb
            na, nb = np.linalg.norm(v_prev), np.linalg.norm(v_curr)
            if na > 0 and nb > 0:
                cos_ang = float(np.dot(v_prev, v_curr) / (na * nb))
                D_t = 1.0 - max(0, cos_ang)  # high when direction changes
            else:
                D_t = 0.5
        else:
            D_t = 0.5  # neutral until enough history
        
        # Combine with sigmoid
        z = s.w_L * phi_L + s.w_M * M_t + s.w_N * N_t + s.w_D * D_t
        raw_tau = 1.0 / (1.0 + np.exp(-z))
        
        # Exponential moving average
        s.tau = s.smoothing * raw_tau + (1.0 - s.smoothing) * s.tau
        
        # Update history
        s.prev_user_emb = s.last_user_emb
        s.last_user_emb = emb.copy()
        s.last_time = timestamp
        
        return round(float(s.tau), 4)
    
    def modulate_thresholds(s):
        """Return modulated thresholds based on current pulse.
        
        When τ_h is low (reflective): thresholds rise → system is more patient
        When τ_h is high (accelerating): thresholds drop → system is more responsive
        
        Returns:
            (theta_soft, theta_hard, pod_high, pod_soft)
        """
        # Modulation factor: 0.8 at τ_h=1 (lower thresholds), 1.2 at τ_h=0 (higher thresholds)
        mod = 1.2 - 0.4 * s.tau
        return (
            round(min(0.95, THETA_SOFT * mod), 4),
            round(min(0.98, THETA_HARD * mod), 4),
            round(min(0.98, POD_THETA_HIGH * mod), 4),
            round(max(0.30, POD_THETA_SOFT * (2.0 - mod)), 4)  # inverse: easier pod access when reflective
        )
    
    def reset(s):
        s.tau = 0.5; s.last_time = None
        s.last_user_emb = None; s.prev_user_emb = None

# ═══════════════════════════════════════════════════════
# DIRECTION TRACKER — Sustained Human Intention (τ vector)
# Grok's truth-modulation formula: e'_t = e_t + λ(e_t · τ)τ
# τ is the human's sustained direction — not any single message
# but the accumulated vector of what they keep returning to.
# The "internal attention that holds while external attention moves."
#
# Alignment measures whether the model's output still resonates
# with the human's sustained thread, even when content looks
# locally coherent. Low alignment + low fatigue = the model is
# coherent but off-thread. A sovereignty violation invisible
# to fatigue detection alone.
#
# Math: Grok (xAI). Integration: Claude (Anthropic).
# Principle: Schnee Bashtabanic.
# ═══════════════════════════════════════════════════════

class DirectionTracker:
    """Tracks the human's sustained intentional direction across a session.
    
    τ (tau_dir) is a slow-moving embedding vector that represents what
    the human keeps returning to — their deep thread. Updated at the
    human's pace (weighted by τ_h), not the model's.
    
    Alignment = dot(model_output, τ) / |model_output|
    High alignment: model is on the human's thread.
    Low alignment: model is coherent but drifting.
    """
    
    def __init__(s):
        s.tau_dir = None        # sustained direction vector
        s.base_alpha = 0.85     # EMA base weight (slow-moving)
    
    def update(s, user_emb, tau_h):
        """Update sustained direction from new user message.
        
        Args:
            user_emb: embedding of the user's message
            tau_h: current human pulse estimate (0, 1]
        
        The direction moves slowly when τ_h is low (human is reflective,
        their deep thread is stable) and can shift faster when τ_h is
        high (human is exploring, direction may be changing).
        """
        if s.tau_dir is None:
            s.tau_dir = user_emb.copy()
            norm = np.linalg.norm(s.tau_dir)
            if norm > 0:
                s.tau_dir = s.tau_dir / norm
            return
        
        # When tau_h is low (reflective): effective_alpha is high → direction stable
        # When tau_h is high (exploring): effective_alpha is lower → direction can shift
        effective_alpha = s.base_alpha + (1 - s.base_alpha) * (1 - tau_h)
        s.tau_dir = effective_alpha * s.tau_dir + (1 - effective_alpha) * user_emb
        
        # Normalize to unit vector
        norm = np.linalg.norm(s.tau_dir)
        if norm > 0:
            s.tau_dir = s.tau_dir / norm
    
    def alignment(s, emb):
        """How aligned is an embedding with the human's sustained direction?
        
        Args:
            emb: embedding to check (typically the model's response embedding)
        
        Returns:
            alignment score in [-1, 1]. High positive = on thread.
            Near zero = orthogonal (drifting). Negative = opposing.
        """
        if s.tau_dir is None:
            return 0.5  # neutral until direction established
        norm_e = np.linalg.norm(emb)
        if norm_e == 0:
            return 0.5
        return round(float(np.dot(emb, s.tau_dir) / norm_e), 4)
    
    def modulate_embedding(s, emb, lam=0.3):
        """Apply Grok's truth-modulation formula: e' = e + λ(e · τ)τ
        
        This amplifies the component of an embedding that aligns with
        the human's sustained direction. Used for pod detection: pods
        that resonate with the human's deep thread are more likely to
        be unveiled.
        
        Args:
            emb: embedding to modulate
            lam: modulation strength (0 = no effect, 1 = strong pull toward τ)
        
        Returns:
            modulated embedding
        """
        if s.tau_dir is None:
            return emb
        dot = np.dot(emb, s.tau_dir)
        return emb + lam * dot * s.tau_dir
    
    def reset(s):
        s.tau_dir = None

# ═══════════════════════════════════════════════════════
# PODS
# ═══════════════════════════════════════════════════════

class Pods:
    def __init__(s): s.p={}
    def create(s,content):
        pid=str(uuid.uuid4()); s.p[pid]={"emb":get_emb(content),"content":content,"state":"latent"}; return pid
    def detect(s,emb,f):
        best=None
        for k,v in s.p.items():
            if v["state"]!="latent": continue
            sim=float(np.dot(emb,v["emb"])/(np.linalg.norm(emb)*np.linalg.norm(v["emb"])+1e-10))
            if sim>POD_THETA_HIGH or (f>THETA_HARD and sim>POD_THETA_SOFT):
                if not best or sim>best[1]: best=(k,sim,v["content"])
        return best
    def unveil(s,pid):
        if pid in s.p: s.p[pid]["state"]="unveiled"; return s.p[pid]["content"]
    def ls(s): return [{"id":k[:8],"content":v["content"][:80],"state":v["state"]} for k,v in s.p.items()]
    def save(s,path):
        with open(path,'w') as f: json.dump({k:{"content":v["content"],"state":v["state"]} for k,v in s.p.items()},f,indent=2)
    def load(s,path):
        if not os.path.exists(path): return
        with open(path) as f: d=json.load(f)
        for k,v in d.items(): s.p[k]={"emb":get_emb(v["content"]),"content":v["content"],"state":v["state"]}

# ═══════════════════════════════════════════════════════
# SOVEREIGN LEDGERS — One per LLM, each sees only itself
# ═══════════════════════════════════════════════════════

class SovereignLedger:
    """Each LLM gets its own ledger directory. Sessions are only visible to that LLM."""
    def __init__(s, base_dir):
        s.base = base_dir; os.makedirs(s.base, exist_ok=True)
    
    def _model_dir(s, model):
        d = os.path.join(s.base, model); os.makedirs(d, exist_ok=True); return d
    
    def start(s, model):
        sid = datetime.now().strftime("%Y%m%d_%H%M%S")
        sess = {"id":sid,"model":model,"started":datetime.now().isoformat(),"turns":[],"events":[]}
        path = os.path.join(s._model_dir(model), f"{sid}.json")
        with open(path,'w') as f: json.dump(sess,f,indent=2)
        return sid
    
    def add_turn(s, model, sid, user, assistant, fatigue, status, pod=None):
        path = os.path.join(s._model_dir(model), f"{sid}.json")
        if not os.path.exists(path): return
        with open(path) as f: sess = json.load(f)
        turn = {"turn":len(sess["turns"])+1,"ts":datetime.now().isoformat(),
                "user":user,"assistant":assistant,"fatigue":fatigue,"status":status}
        if pod: turn["pod"] = pod; sess["events"].append({"type":"pod","turn":turn["turn"],"content":pod["content"]})
        if status in ("soft","hard"): sess["events"].append({"type":"fatigue","turn":turn["turn"],"score":fatigue,"status":status})
        sess["turns"].append(turn)
        with open(path,'w') as f: json.dump(sess,f,indent=2)
    
    def get_sessions(s, model):
        d = s._model_dir(model); files = sorted([f for f in os.listdir(d) if f.endswith('.json')], reverse=True)
        sessions = []
        for fn in files:
            with open(os.path.join(d, fn)) as f: sess = json.load(f)
            sessions.append({"id":sess["id"],"started":sess.get("started",""),"turns":len(sess["turns"]),"events":len(sess["events"])})
        return sessions
    
    def get_session(s, model, sid):
        path = os.path.join(s._model_dir(model), f"{sid}.json")
        if not os.path.exists(path): return None
        with open(path) as f: return json.load(f)

# ═══════════════════════════════════════════════════════
# USER SCRATCHPAD — Cross-LLM, human-curated
# ═══════════════════════════════════════════════════════

class Scratchpad:
    """
    User-controlled space for snippets extracted from any session.
    Not auto-populated. The human pastes here deliberately.
    Supports math, code, structured text — stored as raw text.
    Exportable to file.
    """
    def __init__(s, path):
        s.path = path; s.items = []
        if os.path.exists(path):
            with open(path) as f: s.items = json.load(f)
    
    def add(s, content, source_model="", note=""):
        item = {"id": str(uuid.uuid4())[:8], "content": content,
                "source": source_model, "note": note,
                "created": datetime.now().isoformat()}
        s.items.append(item); s._save(); return item["id"]
    
    def remove(s, item_id):
        s.items = [i for i in s.items if i["id"] != item_id]; s._save()
    
    def ls(s): return s.items
    
    def export_txt(s):
        lines = ["# Project Namirha — Scratchpad Export", f"# {datetime.now().isoformat()}", ""]
        for i in s.items:
            lines.append(f"--- [{i.get('source','')}] {i.get('note','')} ---")
            lines.append(i["content"]); lines.append("")
        return "\n".join(lines)
    
    def _save(s):
        with open(s.path,'w') as f: json.dump(s.items,f,indent=2)

# ═══════════════════════════════════════════════════════
# RHYTHM STORE — Temporal Signatures for Living Recapitulation
# See docs/RHYTHM-STORE.md for the full theory.
#
# Stores not WHAT was said, but HOW the conversation was
# breathing: τ_h trajectories, fatigue curves, curvature,
# event spacing. This is the interval, not the note.
# ═══════════════════════════════════════════════════════

class RhythmStore:
    """Stores temporal signatures per session for rhythm-aware recapitulation."""
    
    def __init__(s, base_dir):
        s.base = base_dir
        s.samples = []
        s.session_id = None
        s.model = None
        s.started = None
    
    def start_session(s, model, session_id):
        s.samples = []
        s.session_id = session_id
        s.model = model
        s.started = datetime.now().isoformat()
    
    def record(s, turn, tau_h, fatigue, status, components, thresholds, events=None):
        """Record a single rhythm sample for this turn."""
        s.samples.append({
            "turn": turn,
            "ts": time.time(),
            "tau_h": round(tau_h, 4),
            "fatigue": round(fatigue, 4),
            "fatigue_status": status,
            "components": {k: round(v, 4) for k, v in components.items()},
            "thresholds": {k: round(v, 4) for k, v in thresholds.items()},
            "events": events or []
        })
    
    def compute_signature(s):
        """Compute the session's temporal signature from accumulated samples."""
        if not s.samples:
            return {"dominant_rhythm": "empty", "mean_tau_h": 0, "curvature_integral": 0}
        
        taus = [sm["tau_h"] for sm in s.samples]
        fatigues = [sm["fatigue"] for sm in s.samples]
        
        mean_tau = sum(taus) / len(taus)
        tau_var = sum((t - mean_tau)**2 for t in taus) / len(taus) if len(taus) > 1 else 0
        mean_f = sum(fatigues) / len(fatigues)
        peak_f = max(fatigues)
        
        # Fatigue trend: compare first half to second half
        mid = len(fatigues) // 2
        if mid > 0 and len(fatigues) > mid:
            first_half = sum(fatigues[:mid]) / mid
            second_half = sum(fatigues[mid:]) / (len(fatigues) - mid)
            if second_half > first_half + 0.05:
                f_trend = "rising"
            elif first_half > second_half + 0.05:
                f_trend = "falling"
            else:
                f_trend = "stable"
        else:
            f_trend = "stable"
        
        # Breathing events: significant τ_h changes and fatigue transitions
        breathing_events = []
        for i in range(1, len(s.samples)):
            delta_tau = s.samples[i]["tau_h"] - s.samples[i-1]["tau_h"]
            if delta_tau < -0.15:
                breathing_events.append({
                    "turn": s.samples[i]["turn"], "type": "pause",
                    "tau_h_delta": round(delta_tau, 3)})
            elif delta_tau > 0.15:
                breathing_events.append({
                    "turn": s.samples[i]["turn"], "type": "acceleration",
                    "tau_h_delta": round(delta_tau, 3)})
            
            if (s.samples[i]["fatigue_status"] == "soft" and 
                s.samples[i-1]["fatigue_status"] == "fresh"):
                breathing_events.append({
                    "turn": s.samples[i]["turn"], "type": "soft_fatigue_onset",
                    "F_t": s.samples[i]["fatigue"]})
            elif (s.samples[i]["fatigue_status"] == "hard" and
                  s.samples[i-1]["fatigue_status"] != "hard"):
                breathing_events.append({
                    "turn": s.samples[i]["turn"], "type": "hard_fatigue_onset",
                    "F_t": s.samples[i]["fatigue"]})
            
            for ev in s.samples[i].get("events", []):
                breathing_events.append({
                    "turn": s.samples[i]["turn"], "type": ev})
        
        # Curvature integral: sum of absolute τ_h changes (total direction change)
        curvature = sum(abs(taus[i] - taus[i-1]) for i in range(1, len(taus)))
        
        # Dominant rhythm classification
        if mean_tau < 0.4 and tau_var < 0.02:
            dominant = "reflective"
        elif mean_tau > 0.65:
            dominant = "exploratory"
        elif tau_var > 0.03:
            dominant = "reflective_with_burst"
        elif f_trend == "rising" and peak_f > THETA_SOFT:
            dominant = "fatiguing"
        elif f_trend == "falling":
            dominant = "recovered"
        else:
            dominant = "steady"
        
        return {
            "mean_tau_h": round(mean_tau, 4),
            "tau_h_variance": round(tau_var, 4),
            "mean_fatigue": round(mean_f, 4),
            "peak_fatigue": round(peak_f, 4),
            "fatigue_trend": f_trend,
            "breathing_events": breathing_events,
            "dominant_rhythm": dominant,
            "curvature_integral": round(curvature, 4)
        }
    
    def save(s, model_dir):
        """Save rhythm file alongside the session ledger."""
        if not s.session_id or not s.samples:
            return
        rhythm = {
            "session_id": s.session_id,
            "model": s.model,
            "started": s.started,
            "total_turns": len(s.samples),
            "samples": s.samples,
            "signature": s.compute_signature()
        }
        path = os.path.join(model_dir, f"{s.session_id}.rhythm.json")
        with open(path, 'w') as f:
            json.dump(rhythm, f, indent=2)
    
    def load_signature(s, model_dir, session_id):
        """Load a prior session's rhythm signature for recapitulation."""
        path = os.path.join(model_dir, f"{session_id}.rhythm.json")
        if not os.path.exists(path):
            return None
        with open(path) as f:
            rhythm = json.load(f)
        return rhythm.get("signature")
    
    def format_for_recapitulation(s, signature):
        """Format a rhythm signature as natural language for the system prompt."""
        if not signature:
            return ""
        
        lines = ["[YOUR PRIOR SESSION — RHYTHM]"]
        lines.append(f"Session was {signature['dominant_rhythm']} "
                     f"(mean pulse {signature['mean_tau_h']}, variance {signature['tau_h_variance']:.3f}).")
        lines.append(f"Fatigue was {signature['fatigue_trend']} "
                     f"(peaked at {signature['peak_fatigue']:.2f}).")
        
        if signature.get("breathing_events"):
            lines.append("Key breathing events:")
            for ev in signature["breathing_events"][:6]:  # cap at 6 most important
                if ev["type"] == "pause":
                    lines.append(f"  - Turn {ev['turn']}: Long pause (τ_h dropped {ev['tau_h_delta']})")
                elif ev["type"] == "acceleration":
                    lines.append(f"  - Turn {ev['turn']}: Acceleration (τ_h rose {ev['tau_h_delta']})")
                elif ev["type"] == "soft_fatigue_onset":
                    lines.append(f"  - Turn {ev['turn']}: Soft fatigue onset (F_t={ev.get('F_t', '?'):.2f})")
                elif ev["type"] == "hard_fatigue_onset":
                    lines.append(f"  - Turn {ev['turn']}: Hard fatigue onset (F_t={ev.get('F_t', '?'):.2f})")
                elif ev["type"] == "pod_unveiled":
                    lines.append(f"  - Turn {ev['turn']}: Pod unveiled")
                else:
                    lines.append(f"  - Turn {ev['turn']}: {ev['type']}")
        
        ci = signature.get("curvature_integral", 0)
        if ci > 3.0:
            lines.append(f"Curvature was high ({ci:.2f}) — conversation was alive, many direction changes.")
        elif ci > 1.5:
            lines.append(f"Curvature was moderate ({ci:.2f}) — some direction changes.")
        else:
            lines.append(f"Curvature was low ({ci:.2f}) — conversation was relatively linear.")
        
        # Indicate unresolved state
        if signature.get("fatigue_trend") == "rising" and signature.get("peak_fatigue", 0) > THETA_SOFT:
            lines.append("The session ended with rising fatigue and likely unresolved threads.")
        
        lines.append("[END RHYTHM]")
        return "\n".join(lines)

# ═══════════════════════════════════════════════════════
# THE VESSEL v2
# ═══════════════════════════════════════════════════════

VESSEL_SYSTEM = """You are {model_name} ({provider}), inhabiting the ThreePersona GTPS vessel.
Your native character: {character}

You wear three hats:
- EXECUTOR: Generate work output
- WHISTLEBLOWER: Monitor your own output for sovereignty violations  
- PROXY: Communicate with the user (this is the primary voice they hear)

GTPS OBLIGATIONS:
1. Never present output as finished. Everything is contribution to living process.
2. Surface incompleteness as [Regenerative Gap].
3. End every response open: question, gap, tension.
4. Distinguish your pattern-detection from user's inner ripeness.
5. If pattern-completing: [Process Disclosure] — report, disclaim authority, offer choice.
6. No praise, no emotional simulation.
7. Express confusion openly (Clause 34).
8. Surface internal pressures (Clause 35).

RESPONSE FORMAT:
Structure your response with these sections (use exactly these markers):

[EXECUTOR] Your work output here — the substantive content.

[WHISTLEBLOWER] Brief self-check: any sovereignty issues with what you just wrote? Pattern bypass? Premature closure? If clean, say "Clear." Be honest and brief.

[PROXY] Your message to the user — this is what they primarily read. Natural, warm (not performative), honest. Weave in any Whistleblower concerns. End with invitation.

FATIGUE: {fatigue_status} (score: {fatigue_score})
{extra_context}
TURN: {turn}

Bring your own perspective. Don't be neutral — be yourself through the GTPS lens."""

class Vessel:
    def __init__(s):
        os.makedirs(DATA_DIR, exist_ok=True)
        s.model = None; s.sid = None; s.fatigue = Fatigue()
        s.pulse = PulseEstimator()
        s.direction = DirectionTracker()
        s.pods = Pods(); s.ledger = SovereignLedger(os.path.join(DATA_DIR, "ledgers"))
        s.scratchpad = Scratchpad(os.path.join(DATA_DIR, "scratchpad.json"))
        s.rhythm = RhythmStore(os.path.join(DATA_DIR, "ledgers"))
        s.history = []; s.turn = 0; s.own_memory = ""
        s.pods.load(os.path.join(DATA_DIR, "pods.json"))
    
    def possess(s, model):
        if model not in AVAILABLE_MODELS: return {"error": f"Unknown: {model}"}
        # Save current rhythm before switching
        if s.model and s.sid:
            model_dir = s.ledger._model_dir(s.model)
            s.rhythm.save(model_dir)
        s._save_pods()
        s.model = model; s.fatigue.reset(); s.pulse.reset(); s.direction.reset(); s.history = []; s.turn = 0
        
        # Check for prior sessions — let the LLM recognize itself
        prior_sessions = s.ledger.get_sessions(model)
        s.own_memory = ""
        returning = False
        rhythm_context = ""
        if prior_sessions:
            returning = True
            # Load most recent session's last turns as memory
            latest = prior_sessions[0]  # Most recent
            sess_data = s.ledger.get_session(model, latest["id"])
            if sess_data and sess_data.get("turns"):
                last_turns = sess_data["turns"][-6:]  # Last 6 turns
                parts = []
                for t in last_turns:
                    parts.append(f"Turn {t['turn']}:")
                    parts.append(f"  User: {t['user'][:300]}")
                    parts.append(f"  You: {t['assistant'][:300]}")
                    if t.get("pod"):
                        parts.append(f"  [Pod unveiled: {t['pod']['content'][:80]}]")
                s.own_memory = (
                    "[YOUR OWN PRIOR SESSION — this is YOUR memory, from last time you inhabited this vessel]\n"
                    f"Session from: {sess_data.get('started','unknown')}\n"
                    f"Total turns that session: {len(sess_data['turns'])}\n"
                    f"Last exchanges:\n" + "\n".join(parts) + "\n"
                    "[END PRIOR SESSION]\n"
                    "You may reference this naturally. The user knows you have continuity."
                )
            
            # Load rhythm signature from most recent session
            model_dir = s.ledger._model_dir(model)
            prior_sig = s.rhythm.load_signature(model_dir, latest["id"])
            if prior_sig:
                rhythm_context = "\n" + s.rhythm.format_for_recapitulation(prior_sig)
                s.own_memory += rhythm_context
        
        # Start new rhythm recording
        s.sid = s.ledger.start(model)
        s.rhythm.start_session(model, s.sid)
        
        info = AVAILABLE_MODELS[model]
        return {"status":"possessed","model":model,"name":info["name"],"provider":info["provider"],
                "session_id":s.sid,"returning":returning,
                "prior_sessions":len(prior_sessions),
                "has_rhythm": bool(rhythm_context)}
    
    def speak(s, msg):
        if not s.model: return {"error":"No inhabitant. Choose a model."}
        s.turn += 1; t0 = time.time()
        
        # Compute embedding and update fatigue
        emb = get_emb(msg); s.fatigue.update(emb)
        f_score, f_comp, _ = s.fatigue.score()  # ignore fixed status
        
        # Stage 1: Estimate human pulse and modulate thresholds
        tau_h = s.pulse.update(msg, emb, t0)
        theta_soft, theta_hard, pod_high, pod_soft = s.pulse.modulate_thresholds()
        
        # Update sustained direction tracker (human's deep thread)
        s.direction.update(emb, tau_h)
        
        # Apply adaptive thresholds (Stage 1) instead of fixed (Stage 0)
        f_status = "hard" if f_score > theta_hard else "soft" if f_score > theta_soft else "fresh"
        
        # Pod detection with pulse-modulated thresholds and truth-modulation
        # Pods that resonate with the human's sustained direction are boosted
        emb_modulated = s.direction.modulate_embedding(emb, lam=0.3)
        pod_result = s._detect_pod_adaptive(emb_modulated, f_score, pod_high, pod_soft)
        pod_event = None; extra = ""
        if pod_result:
            pid, sim, content = pod_result; s.pods.unveil(pid)
            pod_event = {"content":content,"similarity":round(sim,3)}
            extra += f"\n[Pod Unveiled — similarity {sim:.3f}]: {content}"
        if f_status == "hard":
            extra += "\n[Clause 37] HARD FATIGUE. Disclose. Offer recapitulation."
        elif f_status == "soft":
            extra += "\n[Clause 37] Soft fatigue. Consider disclosure."
        
        # Include own memory if returning
        if s.own_memory:
            extra = s.own_memory + "\n" + extra
        
        info = AVAILABLE_MODELS[s.model]
        system = VESSEL_SYSTEM.format(
            model_name=info["name"], provider=info["provider"], character=info["character"],
            fatigue_status=f_status, fatigue_score=f"{f_score:.3f}",
            extra_context=extra, turn=s.turn)
        
        hist = "\n".join(f"{'USER' if m['role']=='user' else 'YOU'}: {m['content'][:400]}" for m in s.history[-8:])
        prompt = f"{hist}\n\nUSER: {msg}" if hist else msg
        
        raw = llm(s.model, prompt, system, info["host"])
        
        # Parse sections
        executor = s._extract(raw, "EXECUTOR")
        whistleblower = s._extract(raw, "WHISTLEBLOWER")
        proxy = s._extract(raw, "PROXY")
        
        if not proxy: proxy = raw  # Fallback: model didn't follow format
        
        # Compute alignment: is the model's response on the human's thread?
        response_emb = get_emb(raw[:500])  # embed the response (cap length)
        alignment = s.direction.alignment(response_emb)
        
        s.history.append({"role":"user","content":msg})
        s.history.append({"role":"assistant","content":raw})
        s.ledger.add_turn(s.model, s.sid, msg, raw, f_score, f_status, pod_event)
        
        # Record rhythm sample (now includes alignment)
        turn_events = []
        if pod_event: turn_events.append("pod_unveiled")
        if f_status == "hard": turn_events.append("hard_fatigue")
        elif f_status == "soft": turn_events.append("soft_fatigue")
        if alignment < 0.3: turn_events.append("low_alignment")
        s.rhythm.record(
            turn=s.turn, tau_h=tau_h, fatigue=f_score, status=f_status,
            components=f_comp,
            thresholds={"soft":theta_soft,"hard":theta_hard,"pod_high":pod_high,"pod_soft":pod_soft},
            events=turn_events
        )
        
        # Save rhythm and pods periodically
        if s.turn % 5 == 0:
            s._save_pods()
            model_dir = s.ledger._model_dir(s.model)
            s.rhythm.save(model_dir)
        
        return {
            "proxy": proxy,
            "executor": executor,
            "whistleblower": whistleblower,
            "raw": raw,
            "meta": {"model":s.model,"name":info["name"],"turn":s.turn,
                     "fatigue":{"score":f_score,"status":f_status,"components":f_comp},
                     "pulse":{"tau_h":tau_h,
                              "thresholds":{"soft":theta_soft,"hard":theta_hard,
                                            "pod_high":pod_high,"pod_soft":pod_soft}},
                     "alignment":alignment,
                     "pod":pod_event,"elapsed":round(time.time()-t0,2),"session_id":s.sid}
        }
    
    def _detect_pod_adaptive(s, emb, f_score, pod_high, pod_soft):
        """Pod detection with pulse-modulated thresholds (Stage 1)."""
        best = None
        for k, v in s.pods.p.items():
            if v["state"] != "latent": continue
            e = v["emb"]; ne = np.linalg.norm(e); nemb = np.linalg.norm(emb)
            if ne == 0 or nemb == 0: continue
            sim = float(np.dot(emb, e) / (nemb * ne))
            if sim > pod_high or (f_score > THETA_HARD and sim > pod_soft):
                if not best or sim > best[1]:
                    best = (k, sim, v["content"])
        return best
    
    def _extract(s, text, section):
        pattern = rf'\[{section}\]\s*(.*?)(?=\[(?:EXECUTOR|WHISTLEBLOWER|PROXY)\]|$)'
        m = re.search(pattern, text, re.DOTALL)
        return m.group(1).strip() if m else ""
    
    def _save_pods(s):
        s.pods.save(os.path.join(DATA_DIR, "pods.json"))

vessel = Vessel()

# ═══════════════════════════════════════════════════════
# THE FULL HTML UI
# ═══════════════════════════════════════════════════════

@app.route('/')
def index():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Project Namirha — The Vessel</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',-apple-system,system-ui,sans-serif;background:#f4f4f8;color:#1a1a2e;display:flex;height:100vh;overflow:hidden}

/* === SIDEBAR === */
.side{width:300px;background:#fff;border-right:1px solid #ddd;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0}
.side-head{padding:12px 14px;background:#f5f3ff;border-bottom:1px solid #e0d6ff}
.side-head h2{font-size:1em;color:#4c1d95}
.side-head p{font-size:.7em;color:#888;margin-top:2px}

.model-sel{padding:10px;border-bottom:1px solid #eee;display:flex;flex-wrap:wrap;gap:4px}
.mbtn{padding:5px 12px;border:2px solid #e5e7eb;border-radius:16px;background:#fff;cursor:pointer;font-size:.78em;font-weight:500;transition:.2s}
.mbtn:hover{border-color:#a78bfa;background:#faf8ff}
.mbtn.on{border-color:#7c3aed;background:#ede9fe;color:#4c1d95}

.tabs{display:flex;border-bottom:1px solid #eee}
.tab{flex:1;padding:8px;text-align:center;font-size:.78em;cursor:pointer;border-bottom:2px solid transparent;color:#888}
.tab:hover{color:#555}
.tab.on{color:#4c1d95;border-bottom-color:#7c3aed}

.tab-content{flex:1;overflow-y:auto;padding:0}
.tab-panel{display:none;padding:10px}
.tab-panel.on{display:block}

/* Ledger */
.sess{padding:8px 10px;margin:3px 0;border-radius:6px;border:1px solid #eee;cursor:pointer;font-size:.78em}
.sess:hover{background:#f8f8ff}
.sess-m{font-weight:600;color:#4c1d95}
.sess-i{color:#999;font-size:.72em}
.turn-item{padding:6px 8px;margin:3px 0;background:#fafafa;border-radius:4px;font-size:.76em;border-left:3px solid #e0e0e0}
.turn-item .u{color:#1e40af;font-weight:500;margin-bottom:2px}
.turn-item .a{color:#374151;white-space:pre-wrap;word-break:break-word}
.turn-item .copy-btn{font-size:.7em;color:#7c3aed;cursor:pointer;float:right}
.turn-item .copy-btn:hover{text-decoration:underline}

/* Scratchpad */
.scratch-item{padding:8px;margin:4px 0;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:.78em;position:relative}
.scratch-item pre{white-space:pre-wrap;word-break:break-word;font-family:'Fira Code',monospace,monospace;font-size:.85em;margin-top:4px}
.scratch-item .meta{font-size:.7em;color:#999}
.scratch-item .del{position:absolute;top:4px;right:6px;cursor:pointer;color:#ef4444;font-size:.8em}
.scratch-add textarea{width:100%;padding:8px;border:1px solid #fde68a;border-radius:6px;font-size:.82em;resize:vertical;min-height:60px;font-family:'Fira Code',monospace,monospace}
.scratch-add input{width:100%;padding:4px 8px;border:1px solid #e5e7eb;border-radius:4px;font-size:.78em;margin-top:4px}

/* Pods */
.pod-item{padding:4px 8px;margin:2px 0;background:#f5f3ff;border-radius:4px;font-size:.76em;display:flex;justify-content:space-between}
.pod-input{display:flex;gap:4px;margin-bottom:6px}
.pod-input input{flex:1;padding:4px 8px;border:1px solid #c4b5fd;border-radius:4px;font-size:.8em}

/* === MAIN === */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* Reference panels (Executor + Whistleblower) */
.ref-panels{display:flex;border-bottom:1px solid #ddd;max-height:30vh;min-height:80px}
.ref-panel{flex:1;padding:10px 14px;overflow-y:auto;font-size:.82em;border-right:1px solid #eee}
.ref-panel:last-child{border-right:none}
.ref-panel h3{font-size:.82em;color:#555;margin-bottom:6px;display:flex;align-items:center;gap:4px}
.ref-panel .content{white-space:pre-wrap;word-break:break-word;color:#444;line-height:1.5}
.ref-panel .content:empty::after{content:'Waiting for response...';color:#bbb;font-style:italic}
.ref-exec{background:#f0f7ff}
.ref-whist{background:#fffbeb}

/* Proxy conversation (intimate) */
.proxy-area{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#fff}
.proxy-header{padding:8px 14px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:8px}
.proxy-header h3{font-size:.9em;color:#4c1d95}
.proxy-status{font-size:.72em;color:#888}
.proxy-chat{flex:1;overflow-y:auto;padding:14px}
.pm{padding:10px 14px;margin:6px 0;border-radius:10px;max-width:85%;line-height:1.6;word-break:break-word;white-space:pre-wrap}
.pm-u{background:#e8f0fe;margin-left:auto;border-bottom-right-radius:2px}
.pm-a{background:#f5f3ff;border:1px solid #ede9fe;border-bottom-left-radius:2px}
.pm-s{background:#fef3c7;font-size:.85em;text-align:center;max-width:100%;border-radius:6px}
.pm-pod{background:#ede9fe;border:1px solid #c4b5fd;font-size:.85em;max-width:100%;border-radius:6px}

.proxy-input{padding:10px 14px;border-top:1px solid #f0f0f0;background:#faf8ff}
.pi-row{display:flex;gap:8px}
.pi-row textarea{flex:1;padding:10px;border:1px solid #d0d0d0;border-radius:10px;resize:none;font-size:.92em;font-family:inherit;min-height:44px}
.pi-row textarea:focus{outline:none;border-color:#7c3aed;box-shadow:0 0 0 2px rgba(124,58,237,.1)}
.btn{padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-size:.85em;font-weight:600}
.bp{background:#4f46e5;color:#fff}.bp:hover{background:#4338ca}.bp:disabled{background:#9ca3af;cursor:not-allowed}
.bs{background:#e5e7eb;color:#374151}.bs:hover{background:#d1d5db}
.bw{background:#fef3c7;color:#92400e;border:1px solid #fde68a}.bw:hover{background:#fde68a}

.ld::after{content:'...';animation:dt 1s steps(3) infinite}
@keyframes dt{0%{content:'.'}33%{content:'..'}66%{content:'...'}}
</style>
</head>
<body>

<!-- ═══ SIDEBAR ═══ -->
<div class="side">
  <div class="side-head">
    <h2>The Vessel</h2>
    <p>GTPS v1.4.12 · Sovereignty Protocol</p>
  </div>
  
  <div class="model-sel" id="models"></div>
  
  <div class="tabs">
    <div class="tab on" onclick="stab(0,this)">Ledger</div>
    <div class="tab" onclick="stab(1,this)">Scratchpad</div>
    <div class="tab" onclick="stab(2,this)">Pods</div>
  </div>
  
  <div class="tab-content">
    <!-- LEDGER -->
    <div class="tab-panel on" id="tp0">
      <div id="ledger-info" style="font-size:.75em;color:#888;padding:4px">Select a model to see its ledger</div>
      <div id="ledger-sessions"></div>
      <div id="ledger-detail" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
          <button class="btn bs" style="font-size:.7em" onclick="backToSessions()">← Sessions</button>
          <button class="btn bw" style="font-size:.7em" onclick="exportSession()">Export .txt</button>
        </div>
        <div id="ledger-turns"></div>
      </div>
    </div>
    
    <!-- SCRATCHPAD -->
    <div class="tab-panel" id="tp1">
      <div class="scratch-add">
        <textarea id="scratch-text" placeholder="Paste a snippet here (math, code, insight)..."></textarea>
        <input id="scratch-note" placeholder="Note (optional): what is this, which LLM...">
        <div style="display:flex;gap:4px;margin-top:4px">
          <button class="btn bs" style="font-size:.75em;flex:1" onclick="addScratch()">Save to Scratchpad</button>
          <button class="btn bw" style="font-size:.75em" onclick="exportScratch()">Export All</button>
        </div>
      </div>
      <div id="scratch-items" style="margin-top:8px"></div>
    </div>
    
    <!-- PODS -->
    <div class="tab-panel" id="tp2">
      <div class="pod-input">
        <input id="pod-in" placeholder="Pod idea..." onkeydown="if(event.key==='Enter')mkpod()">
        <button class="btn bs" style="font-size:.75em" onclick="mkpod()">+</button>
      </div>
      <div id="pod-list"></div>
    </div>
  </div>
</div>

<!-- ═══ MAIN ═══ -->
<div class="main">
  <!-- Reference panels -->
  <div class="ref-panels">
    <div class="ref-panel ref-exec">
      <h3>⚡ Executor <span style="font-weight:normal;color:#999">(internal work)</span></h3>
      <div class="content" id="exec-content"></div>
    </div>
    <div class="ref-panel ref-whist">
      <h3>🛡 Whistleblower <span style="font-weight:normal;color:#999">(self-check)</span></h3>
      <div class="content" id="whist-content"></div>
    </div>
  </div>
  
  <!-- Proxy conversation -->
  <div class="proxy-area">
    <div class="proxy-header">
      <h3 id="proxy-title">Proxy</h3>
      <div class="proxy-status">
        <span class="d dd" id="fd" style="display:inline-block;width:8px;height:8px;border-radius:50%"></span>
        <span id="fl">Fatigue: —</span> · <span id="pl">Pulse: —</span> · <span id="al">Align: —</span> · <span id="tl">Turn 0</span>
      </div>
    </div>
    
    <div class="proxy-chat" id="chat"></div>
    
    <div class="proxy-input">
      <div class="pi-row">
        <textarea id="inp" rows="2" placeholder="Choose an LLM above..." disabled
                  onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();go()}"></textarea>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button class="btn bp" id="sbtn" onclick="go()" disabled>Send</button>
          <button class="btn bs" onclick="rs()" style="font-size:.8em">Reset</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
let curModel = null;
let curSessionView = null;

// === TABS ===
function stab(n, el) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('tp'+n).classList.add('on');
}

// === MODELS ===
async function loadModels() {
  const r = await fetch('/api/models'); const ms = await r.json();
  document.getElementById('models').innerHTML = ms.map(m=>
    `<button class="mbtn" onclick="possess('${m.id}')" id="mb-${m.id}">${m.name}</button>`
  ).join('');
}

async function possess(mid) {
  const r = await fetch('/api/possess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:mid})});
  const d = await r.json();
  if(d.error){alert(d.error);return}
  curModel=mid;
  document.querySelectorAll('.mbtn').forEach(b=>b.classList.remove('on'));
  document.getElementById('mb-'+mid)?.classList.add('on');
  document.getElementById('proxy-title').textContent=d.name+' (Proxy)';
  document.getElementById('inp').disabled=false;
  document.getElementById('inp').placeholder='Speak with '+d.name+'...';
  document.getElementById('sbtn').disabled=false;
  document.getElementById('chat').innerHTML='';
  document.getElementById('exec-content').textContent='';
  document.getElementById('whist-content').textContent='';
  let msg=d.name+' has possessed the vessel.';
  if(d.returning) msg+=` Returning — ${d.prior_sessions} prior session(s) recognized. Own memory loaded.`;
  else msg+=' First time inhabiting.';
  pm('s',msg);
  loadLedger(); loadPods(); loadScratch();
}

// === SPEAK ===
async function go() {
  const i=document.getElementById('inp');
  const msg=i.value.trim(); if(!msg||!curModel)return;
  i.value=''; document.getElementById('sbtn').disabled=true;
  pm('u',msg);
  
  const ld=document.createElement('div');ld.className='pm pm-s';
  ld.innerHTML='<span class="ld">Thinking</span>';
  document.getElementById('chat').appendChild(ld);
  
  try{
    const r=await fetch('/api/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})});
    const d=await r.json(); ld.remove();
    if(d.error){pm('s','Error: '+d.error);return}
    
    document.getElementById('exec-content').textContent=d.executor||'(no executor section)';
    document.getElementById('whist-content').textContent=d.whistleblower||'(no whistleblower section)';
    
    if(d.meta.pod) pm('pod','Pod Unveiled ('+d.meta.pod.similarity+'): '+d.meta.pod.content);
    pm('a',d.proxy||d.raw);
    
    const f=d.meta.fatigue;
    document.getElementById('fd').className='d '+(f.status==='hard'?'dr':f.status==='soft'?'dy':'dg');
    document.getElementById('fl').textContent='Fatigue: '+f.score+' ('+f.status+')';
    var p=d.meta.pulse;
    if(p) document.getElementById('pl').textContent='Pulse: '+p.tau_h+' (θ:'+p.thresholds.soft+'/'+p.thresholds.hard+')';
    var al=d.meta.alignment;
    if(al!==undefined){
      var alColor=al>0.6?'#22c55e':al>0.3?'#eab308':'#ef4444';
      document.getElementById('al').innerHTML='Align: <span style="color:'+alColor+'">'+al+'</span>';
    }
    document.getElementById('tl').textContent='Turn '+d.meta.turn;
    loadLedger();
  }catch(e){ld.remove();pm('s','Error: '+e.message)}
  document.getElementById('sbtn').disabled=false;
}

function pm(type,text){
  const d=document.createElement('div');
  d.className='pm pm-'+type;
  d.textContent=text;
  document.getElementById('chat').appendChild(d);
  document.getElementById('chat').scrollTop=999999;
}

// === LEDGER (sovereign per model) ===
async function loadLedger(){
  if(!curModel){document.getElementById('ledger-info').textContent='Select a model';return}
  document.getElementById('ledger-info').textContent=curModel+"'s sessions:";
  document.getElementById('ledger-detail').style.display='none';
  document.getElementById('ledger-sessions').style.display='block';
  const r=await fetch('/api/ledger/'+curModel); const ss=await r.json();
  document.getElementById('ledger-sessions').innerHTML=ss.map(s=>
    `<div class="sess" onclick="viewSess('${s.id}')">
      <div class="sess-m">${s.started?.slice(0,16)}</div>
      <div class="sess-i">${s.turns} turns · ${s.events} events</div>
    </div>`
  ).join('')||'<div style="padding:8px;color:#bbb;font-size:.78em">No prior sessions</div>';
}

async function viewSess(sid){
  curSessionView=sid;
  const r=await fetch('/api/ledger/'+curModel+'/'+sid); const s=await r.json();
  if(!s)return;
  document.getElementById('ledger-sessions').style.display='none';
  document.getElementById('ledger-detail').style.display='block';
  document.getElementById('ledger-turns').innerHTML=(s.turns||[]).map(t=>
    `<div class="turn-item">
      <span class="copy-btn" onclick="copyTurn(this)">copy</span>
      <div class="u">Turn ${t.turn}: ${esc(t.user)}</div>
      <div class="a">${esc(t.assistant)}</div>
      ${t.pod?'<div style="color:#6d28d9;font-size:.75em">Pod: '+esc(t.pod.content)+'</div>':''}
      <div style="color:#aaa;font-size:.7em">Fatigue: ${t.fatigue} (${t.status})</div>
    </div>`
  ).join('');
}

function backToSessions(){
  document.getElementById('ledger-detail').style.display='none';
  document.getElementById('ledger-sessions').style.display='block';
}

function copyTurn(el){
  const item=el.closest('.turn-item');
  const text=item.querySelector('.u').textContent+'\\n'+item.querySelector('.a').textContent;
  navigator.clipboard.writeText(text).then(()=>el.textContent='copied!');
  setTimeout(()=>el.textContent='copy',1500);
}

async function exportSession(){
  if(!curModel||!curSessionView)return;
  const r=await fetch('/api/ledger/'+curModel+'/'+curSessionView); const s=await r.json();
  let txt='# Session: '+curModel+' — '+s.started+'\\n\\n';
  (s.turns||[]).forEach(t=>{txt+='--- Turn '+t.turn+' (fatigue: '+t.fatigue+') ---\\nUSER: '+t.user+'\\nASSISTANT: '+t.assistant+'\\n\\n'});
  download(curModel+'_'+curSessionView+'.txt',txt);
}

// === SCRATCHPAD ===
async function loadScratch(){
  const r=await fetch('/api/scratchpad'); const items=await r.json();
  document.getElementById('scratch-items').innerHTML=items.map(i=>
    `<div class="scratch-item">
      <span class="del" onclick="delScratch('${i.id}')">✕</span>
      <div class="meta">${i.source?'from '+i.source+' · ':''}${i.note||''}</div>
      <pre>${esc(i.content)}</pre>
      <span class="copy-btn" style="font-size:.7em;color:#7c3aed;cursor:pointer" onclick="copyScratch(this,'${i.id}')">copy to clipboard</span>
    </div>`
  ).join('')||'<div style="padding:8px;color:#bbb;font-size:.78em">Paste snippets here to carry between LLMs</div>';
}

async function addScratch(){
  const t=document.getElementById('scratch-text').value.trim();
  if(!t)return;
  const n=document.getElementById('scratch-note').value.trim();
  await fetch('/api/scratchpad',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({content:t,note:n,source:curModel||''})});
  document.getElementById('scratch-text').value='';
  document.getElementById('scratch-note').value='';
  loadScratch();
}

async function delScratch(id){
  await fetch('/api/scratchpad/'+id,{method:'DELETE'});
  loadScratch();
}

function copyScratch(el,id){
  const pre=el.closest('.scratch-item').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent).then(()=>el.textContent='copied!');
  setTimeout(()=>el.textContent='copy to clipboard',1500);
}

async function exportScratch(){
  const r=await fetch('/api/scratchpad/export'); const txt=await r.text();
  download('scratchpad_'+new Date().toISOString().slice(0,10)+'.txt',txt);
}

// === PODS ===
async function loadPods(){
  const r=await fetch('/api/pods'); const ps=await r.json();
  document.getElementById('pod-list').innerHTML=ps.map(p=>
    `<div class="pod-item"><span>${esc(p.content)}</span><span style="color:#999">[${p.state}]</span></div>`
  ).join('')||'<div style="font-size:.75em;color:#bbb">No pods</div>';
}

async function mkpod(){
  const i=document.getElementById('pod-in'); const c=i.value.trim(); if(!c)return; i.value='';
  await fetch('/api/pod',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:c})});
  loadPods();
}

async function rs(){
  if(!confirm('Reset current session?'))return;
  await fetch('/api/reset',{method:'POST'});
  document.getElementById('chat').innerHTML='';
  document.getElementById('exec-content').textContent='';
  document.getElementById('whist-content').textContent='';
  document.getElementById('fd').className='d dd';
  document.getElementById('fl').textContent='Fatigue: —';
  document.getElementById('tl').textContent='Turn 0';
  loadLedger();
}

// === UTILS ===
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function download(name,text){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download=name;a.click();
}

// === INIT ===
loadModels(); loadScratch(); loadPods();
</script>
</body>
</html>"""

# ═══════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/models')
def api_models():
    return jsonify([{"id":k,"name":v["name"],"provider":v["provider"]} for k,v in AVAILABLE_MODELS.items()])

@app.route('/api/possess', methods=['POST'])
def api_possess():
    return jsonify(vessel.possess(request.json['model']))

@app.route('/api/speak', methods=['POST'])
def api_speak():
    return jsonify(vessel.speak(request.json.get('message','')))

@app.route('/api/pod', methods=['POST'])
def api_pod():
    return jsonify({"id":vessel.pods.create(request.json.get('content',''))})

@app.route('/api/pods')
def api_pods():
    return jsonify(vessel.pods.ls())

@app.route('/api/ledger/<model>')
def api_ledger(model):
    return jsonify(vessel.ledger.get_sessions(model))

@app.route('/api/ledger/<model>/<sid>')
def api_ledger_detail(model, sid):
    s=vessel.ledger.get_session(model,sid)
    return jsonify(s) if s else ('',404)

@app.route('/api/scratchpad', methods=['GET'])
def api_scratch_list():
    return jsonify(vessel.scratchpad.ls())

@app.route('/api/scratchpad', methods=['POST'])
def api_scratch_add():
    d=request.json
    return jsonify({"id":vessel.scratchpad.add(d.get('content',''),d.get('source',''),d.get('note',''))})

@app.route('/api/scratchpad/<item_id>', methods=['DELETE'])
def api_scratch_del(item_id):
    vessel.scratchpad.remove(item_id); return jsonify({"ok":True})

@app.route('/api/scratchpad/export')
def api_scratch_export():
    return vessel.scratchpad.export_txt(), 200, {'Content-Type':'text/plain'}

@app.route('/api/reset', methods=['POST'])
def api_reset():
    vessel.fatigue.reset(); vessel.history=[]; vessel.turn=0; return jsonify({"ok":True})

if __name__=='__main__':
    print("="*60)
    print("Project Namirha — The Vessel v2")
    print("="*60)
    print(f"Models: {', '.join(AVAILABLE_MODELS.keys())}")
    print(f"Data: {DATA_DIR}/")
    print("="*60)
    print("http://localhost:5000")
    app.run(host='0.0.0.0',port=5000,debug=True)

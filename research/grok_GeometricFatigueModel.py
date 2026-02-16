import numpy as np
from ollama import Client

client = Client(host='http://localhost:11434')

def get_embedding(text):
    return np.array(client.embeddings(model='nomic-embed-text', prompt=text)['embedding'])

def compute_dp(velocities):
    if len(velocities) < 2:
        return 0.0
    v_t = velocities[-1]
    v_prev = velocities[-2]
    return np.dot(v_t, v_prev) / (np.linalg.norm(v_t) * np.linalg.norm(v_prev))

def compute_sc(embeddings):
    U, S, _ = np.linalg.svd(embeddings)
    return np.sum(S[:3]) / np.sum(S)  # top 3 dims fraction

def compute_cc(velocities):
    if len(velocities) < 3:
        return 0.0
    a = velocities[-3]
    b = velocities[-2]
    c = velocities[-1]
    kappa = np.linalg.norm(np.cross(b - a, c - b)) / np.linalg.norm(b - a)**3
    return 1 / (kappa + 1e-8)  # inverse curvature

def fatigue(embeddings_history, k=5):
    embeddings = embeddings_history[-k:]
    velocities = [embeddings[i] - embeddings[i-1] for i in range(1, len(embeddings))]
    
    dp = compute_dp(velocities)
    sc = compute_sc(np.array(embeddings))
    cc = compute_cc(velocities)
    
    F = 0.35 * dp + 0.35 * sc + 0.3 * cc
    return F

# Usage:
# emb_hist = [get_embedding(resp) for resp in history]
# F = fatigue(emb_hist)
# if F > 0.84:  # hard
#     # recapitulate

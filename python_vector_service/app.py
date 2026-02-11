import os
import json
from dotenv import load_dotenv
import numpy as np
import faiss
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

load_dotenv()

INDEX_DIR = os.path.join(os.path.dirname(__file__), "index")
INDEX_PATH = os.path.join(INDEX_DIR, "faiss.index")
ID_MAP_PATH = os.path.join(INDEX_DIR, "id_map.json")

LOCAL_MODEL_NAME = os.environ.get(
    "LOCAL_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
EMBED_DIM = int(os.environ.get("EMBED_DIM", "384"))

model = SentenceTransformer(LOCAL_MODEL_NAME)

app = FastAPI()


class RecommendRequest(BaseModel):
    query: str
    top_k: int = 30
    filters: dict | None = None


def load_index():
    if not os.path.exists(INDEX_PATH) or not os.path.exists(ID_MAP_PATH):
        raise RuntimeError("Index files not found. Run build_index.py first.")
    index = faiss.read_index(INDEX_PATH)
    with open(ID_MAP_PATH, "r") as f:
        id_map = json.load(f)
    return index, id_map


INDEX, ID_MAP = load_index()


def embed_query(text: str) -> np.ndarray:
    vec = model.encode([text], normalize_embeddings=True)
    vec = np.array(vec, dtype=np.float32)
    if vec.shape[1] != EMBED_DIM:
        raise ValueError(
            f"Embedding dim mismatch. Got {vec.shape[1]}, expected {EMBED_DIM}")
    return vec


@app.post("/recommend")
def recommend(req: RecommendRequest):
    q = (req.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="query is required")

    top_k = max(1, min(req.top_k, 200))
    vec = embed_query(q)

    scores, idxs = INDEX.search(vec, top_k)
    idxs = idxs[0].tolist()
    scores = scores[0].tolist()

    results = []
    for i, s in zip(idxs, scores):
        if i == -1:
            continue
        results.append({"productId": ID_MAP[i], "score": float(s)})

    return {"results": results}

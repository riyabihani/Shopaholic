import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

load_dotenv()

MONGO_URI = os.environ["MONGO_URI"]
DB_NAME = os.environ.get("MONGO_DB_NAME", "test")
PRODUCTS_COLLECTION = os.environ.get("MONGO_PRODUCTS_COLLECTION", "products")

INDEX_DIR = os.path.join(os.path.dirname(__file__), "index")
os.makedirs(INDEX_DIR, exist_ok=True)

# Local embedding model (FREE)
LOCAL_MODEL_NAME = os.environ.get(
    "LOCAL_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
EMBED_DIM = int(os.environ.get("EMBED_DIM", "384"))  # MiniLM-L6-v2 => 384

model = SentenceTransformer(LOCAL_MODEL_NAME)


def build_search_text(p: dict) -> str:
    parts = [
        p.get("name", ""),
        p.get("description", ""),
        f"Category: {p.get('category', '')}",
        f"Brand: {p.get('brand', '')}",
        f"Material: {p.get('material', '')}",
        f"Collections: {p.get('collections', '')}",
        f"Gender: {p.get('gender', '')}",
        f"Colors: {', '.join(p.get('colors', []) or [])}",
        f"Sizes: {', '.join(p.get('sizes', []) or [])}",
    ]
    return "\n".join([x for x in parts if x]).strip()


def embed_texts(texts: list[str]) -> np.ndarray:
    # SentenceTransformers can embed in batches internally
    vectors = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        normalize_embeddings=True,  # gives unit vectors for cosine sim
    )
    vectors = np.array(vectors, dtype=np.float32)
    if vectors.shape[1] != EMBED_DIM:
        raise ValueError(
            f"Embedding dim mismatch. Got {vectors.shape[1]}, expected {EMBED_DIM}")
    return vectors


def main():
    mongo = MongoClient(MONGO_URI)
    db = mongo[DB_NAME]
    col = db[PRODUCTS_COLLECTION]

    cursor = col.find(
        {},
        {
            "_id": 1,
            "sku": 1,
            "name": 1,
            "description": 1,
            "category": 1,
            "brand": 1,
            "material": 1,
            "collections": 1,
            "gender": 1,
            "colors": 1,
            "sizes": 1,
        }
    )

    products = list(cursor)
    if not products:
        raise RuntimeError("No products found in MongoDB. Seed first.")

    ids = []
    texts = []
    for p in products:
        ids.append(str(p["_id"]))  # map FAISS row -> Mongo _id
        texts.append(build_search_text(p))

    vectors = embed_texts(texts)

    # Cosine similarity: use inner product on normalized vectors
    index = faiss.IndexFlatIP(EMBED_DIM)
    index.add(vectors)

    faiss.write_index(index, os.path.join(INDEX_DIR, "faiss.index"))
    with open(os.path.join(INDEX_DIR, "id_map.json"), "w") as f:
        json.dump(ids, f)
    with open(os.path.join(INDEX_DIR, "meta.json"), "w") as f:
        json.dump(
            {"embedding_backend": "sentence-transformers",
                "model": LOCAL_MODEL_NAME, "embed_dim": EMBED_DIM, "count": len(ids)},
            f,
            indent=2
        )

    print(f"✅ Built FAISS index with {len(ids)} products")


if __name__ == "__main__":
    main()

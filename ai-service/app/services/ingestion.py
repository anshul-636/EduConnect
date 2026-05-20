import fitz  # PyMuPDF
import uuid
from typing import List
from sentence_transformers import SentenceTransformer
from app.core.database import get_or_create_collection

# Load embedding model once
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]

async def ingest_pdf(file_bytes: bytes, resource_id: str, title: str) -> dict:
    try:
        # Extract text from PDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        if not full_text.strip():
            return {"success": False, "message": "No text found in PDF."}

        # Chunk the text
        chunks = chunk_text(full_text)

        # Generate embeddings
        model = get_embedding_model()
        embeddings = model.encode(chunks).tolist()

        # Store in ChromaDB
        collection = get_or_create_collection("resources")
        ids = [f"{resource_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"resource_id": resource_id, "title": title, "chunk_index": i} for i in range(len(chunks))]

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        return {
            "success": True,
            "chunks": len(chunks),
            "resource_id": resource_id
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

async def ingest_text(text: str, resource_id: str, title: str) -> dict:
    try:
        chunks = chunk_text(text)
        model = get_embedding_model()
        embeddings = model.encode(chunks).tolist()

        collection = get_or_create_collection("resources")
        ids = [f"{resource_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"resource_id": resource_id, "title": title, "chunk_index": i} for i in range(len(chunks))]

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        return {"success": True, "chunks": len(chunks)}
    except Exception as e:
        return {"success": False, "message": str(e)}

def search_similar(query: str, resource_id: str = None, top_k: int = 4) -> List[dict]:
    model = get_embedding_model()
    query_embedding = model.encode([query]).tolist()

    collection = get_or_create_collection("resources")

    where = {"resource_id": resource_id} if resource_id else None

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    if results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            chunks.append({
                "text": doc,
                "metadata": results["metadatas"][0][i],
                "score": 1 - results["distances"][0][i]
            })

    return chunks

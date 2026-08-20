import os
import re
import math
from typing import List, Dict, Any
from config import groq_client, GROQ_MODEL

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
KB_DIR = os.path.join(PROJECT_ROOT, "rag", "knowledge-base")


def clean_llm_response(text: str) -> str:
    """Strips <think> tags whether they are closed or open."""
    cleaned = re.sub(r"<think>.*?(?:</think>|$)", "", text, flags=re.DOTALL)
    return cleaned.strip()


class RAGEngine:
    def __init__(self, kb_dir: str = KB_DIR):
        self.kb_dir = kb_dir
        self.chunks: List[Dict[str, Any]] = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Loads and parses all markdown knowledge base files into semantic chunks."""
        self.chunks = []
        if not os.path.exists(self.kb_dir):
            print(f"[RAGEngine WARNING] Knowledge base directory not found at: {self.kb_dir}")
            return

        for filename in os.listdir(self.kb_dir):
            if filename.endswith(".md") or filename.endswith(".txt"):
                file_path = os.path.join(self.kb_dir, filename)
                title = filename.replace("_", " ").replace(".md", "").replace(".txt", "").title()
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Split content into sections by headers (## or #)
                    sections = re.split(r"\n(?=#{1,3}\s)", content)
                    for idx, section in enumerate(sections):
                        sec_text = section.strip()
                        if len(sec_text) > 30:
                            # Extract section title if present
                            first_line = sec_text.split("\n")[0]
                            sec_title = first_line.replace("#", "").strip() if first_line.startswith("#") else f"{title} - Part {idx+1}"
                            self.chunks.append({
                                "id": f"{filename}_{idx}",
                                "source": filename,
                                "title": sec_title,
                                "content": sec_text,
                                "words": set(re.findall(r"\b\w{3,}\b", sec_text.lower()))
                            })
                except Exception as e:
                    print(f"[RAGEngine ERROR] Failed to load {filename}: {e}")

        print(f"[RAGEngine] Indexed {len(self.chunks)} knowledge chunks from {self.kb_dir}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves top_k relevant chunks using keyword and term overlap scoring."""
        if not self.chunks:
            self._load_knowledge_base()

        query_terms = set(re.findall(r"\b\w{3,}\b", query.lower()))
        if not query_terms:
            return self.chunks[:top_k]

        scored_chunks = []
        for chunk in self.chunks:
            chunk_words = chunk["words"]
            # Intersection of query terms
            matches = query_terms.intersection(chunk_words)
            overlap_score = len(matches)

            # Boost exact phrase or title matches
            title_boost = sum(2 for term in query_terms if term in chunk["title"].lower())
            total_score = overlap_score * 2.0 + title_boost

            if total_score > 0:
                scored_chunks.append((total_score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = [c[1] for c in scored_chunks[:top_k]]

        # If no strict match, fallback to first top_k
        if not results:
            results = self.chunks[:top_k]

        return results

    def query(self, question: str) -> Dict[str, Any]:
        """Runs the RAG pipeline: retrieval + Groq LLM synthesis with grounded citations."""
        if not groq_client:
            raise RuntimeError("GROQ_API_KEY is not configured on AI Service.")

        relevant_chunks = self.retrieve(question, top_k=3)
        context_blocks = []
        for c in relevant_chunks:
            context_blocks.append(f"--- SOURCE: {c['title']} ({c['source']}) ---\n{c['content']}")

        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            "You are the FoodLoop Food Safety & Redistribution Assistant. "
            "Your answers must be directly grounded in the provided Knowledge Base context. "
            "Cite safety standards, temperatures, and protocols accurately. "
            "Do not include any internal thoughts, reasoning tags (<think>), or filler."
        )

        user_prompt = f"""
        Knowledge Base Context:
        {context_str}

        User Question:
        {question}

        Task:
        Provide a concise, practical, and authoritative answer to the user's question based on the Knowledge Base.
        Format with clear bullet points and bold key temperatures/timelines.
        """

        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1500
        )

        raw_content = completion.choices[0].message.content or ""
        clean_content = clean_llm_response(raw_content)

        return {
            "success": True,
            "question": question,
            "answer": clean_content,
            "sources": [
                {
                    "title": c["title"],
                    "source": c["source"],
                    "snippet": c["content"][:200] + "..."
                }
                for c in relevant_chunks
            ]
        }


# Singleton instance
rag_engine = RAGEngine()

import os
import re
from typing import List, Dict, Any

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import langchain_llm, groq_client, GROQ_MODEL

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
KB_DIR = os.path.join(PROJECT_ROOT, "rag", "knowledge-base")


def clean_llm_response(text: str) -> str:
    """Strips <think> tags whether they are closed or open."""
    cleaned = re.sub(r"<think>.*?(?:</think>|$)", "", text, flags=re.DOTALL)
    return cleaned.strip()


class LangChainRAGEngine:
    """
    LangChain-powered Retrieval-Augmented Generation (RAG) Engine
    for FoodLoop Food Safety, Handling Protocols, and SDG Redistribution.
    """

    def __init__(self, kb_dir: str = KB_DIR):
        self.kb_dir = kb_dir
        self.documents: List[Document] = []
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=100,
            separators=["\n## ", "\n### ", "\n\n", "\n", " "]
        )
        self._build_knowledge_index()

        # Build LangChain RAG Prompt Template & LCEL Chain
        self.rag_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are the FoodLoop Food Safety & Redistribution Assistant. "
                "Your answers must be directly grounded in the provided Knowledge Base context. "
                "Cite safety standards, temperatures, and protocols accurately. "
                "Do not include any internal thoughts, reasoning tags (<think>), or conversational filler."
            ),
            (
                "user",
                """Knowledge Base Context:
{context}

User Question:
{question}

Task:
Provide a concise, practical, and authoritative answer to the user's question based on the Knowledge Base.
Format with clear bullet points and bold key temperatures/timelines."""
            )
        ])

        self.output_parser = StrOutputParser()

    def _build_knowledge_index(self):
        """Loads and splits all markdown files into LangChain Document objects."""
        self.documents = []
        if not os.path.exists(self.kb_dir):
            print(f"[LangChain RAG WARNING] Knowledge base directory not found at: {self.kb_dir}")
            return

        raw_docs = []
        for filename in os.listdir(self.kb_dir):
            if filename.endswith(".md") or filename.endswith(".txt"):
                file_path = os.path.join(self.kb_dir, filename)
                title = filename.replace("_", " ").replace(".md", "").replace(".txt", "").title()
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    raw_docs.append(
                        Document(
                            page_content=content,
                            metadata={"source": filename, "title": title}
                        )
                    )
                except Exception as e:
                    print(f"[LangChain RAG ERROR] Failed reading {filename}: {e}")

        # Split into semantic chunks
        if raw_docs:
            self.documents = self.text_splitter.split_documents(raw_docs)

        print(f"[LangChain RAGEngine] Indexed {len(self.documents)} LangChain Document chunks from {self.kb_dir}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Document]:
        """Retrieves top-k relevant LangChain Documents using keyword relevance and metadata matching."""
        if not self.documents:
            self._build_knowledge_index()

        query_terms = set(re.findall(r"\b\w{3,}\b", query.lower()))
        if not query_terms:
            return self.documents[:top_k]

        scored_docs = []
        for doc in self.documents:
            content_words = set(re.findall(r"\b\w{3,}\b", doc.page_content.lower()))
            overlap = len(query_terms.intersection(content_words))

            # Boost title relevance
            title_boost = sum(2 for term in query_terms if term in doc.metadata.get("title", "").lower())
            total_score = overlap * 2.0 + title_boost

            if total_score > 0:
                scored_docs.append((total_score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [d[1] for d in scored_docs[:top_k]]
        return results if results else self.documents[:top_k]

    def query(self, question: str) -> Dict[str, Any]:
        """Executes the LangChain LCEL RAG chain."""
        relevant_docs = self.retrieve(question, top_k=3)

        context_str = "\n\n".join([
            f"--- SOURCE: {d.metadata.get('title', 'Guidelines')} ({d.metadata.get('source', '')}) ---\n{d.page_content}"
            for d in relevant_docs
        ])

        if langchain_llm:
            # LangChain LCEL Execution: prompt | llm | output_parser
            chain = self.rag_prompt | langchain_llm | self.output_parser
            raw_response = chain.invoke({
                "context": context_str,
                "question": question
            })
            clean_answer = clean_llm_response(raw_response)
        elif groq_client:
            # Fallback to direct client
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are the FoodLoop Food Safety Assistant. Answer concisely based on context."},
                    {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion:\n{question}"}
                ],
                temperature=0.2,
                max_tokens=1500
            )
            clean_answer = clean_llm_response(completion.choices[0].message.content or "")
        else:
            raise RuntimeError("GROQ_API_KEY is not configured.")

        return {
            "success": True,
            "question": question,
            "answer": clean_answer,
            "sources": [
                {
                    "title": d.metadata.get("title", "Safety Manual"),
                    "source": d.metadata.get("source", "knowledge_base"),
                    "snippet": d.page_content[:200] + "..."
                }
                for d in relevant_docs
            ]
        }


# Singleton LangChain RAG Engine
rag_engine = LangChainRAGEngine()

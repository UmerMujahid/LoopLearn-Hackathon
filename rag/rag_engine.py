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
KB_DIR = os.path.join(CURRENT_DIR, "knowledge-base") if os.path.exists(os.path.join(CURRENT_DIR, "knowledge-base")) else os.path.join(PROJECT_ROOT, "rag", "knowledge-base")


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
        """Loads and indexes knowledge base markdown files into LangChain Documents."""
        if not os.path.exists(self.kb_dir):
            return

        for filename in os.listdir(self.kb_dir):
            if filename.endswith(".md"):
                file_path = os.path.join(self.kb_dir, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()

                    title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
                    title = title_match.group(1) if title_match else filename.replace(".md", "").replace("_", " ").title()

                    raw_doc = Document(
                        page_content=text,
                        metadata={
                            "source": filename,
                            "title": title
                        }
                    )
                    chunks = self.text_splitter.split_documents([raw_doc])
                    self.documents.extend(chunks)
                except Exception as e:
                    print(f"[RAG Engine Warning] Could not index {filename}: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Document]:
        """Performs BM25-style keyword and semantic term matching across Document chunks."""
        if not self.documents:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        scored_docs = []

        for doc in self.documents:
            doc_terms = set(re.findall(r"\w+", doc.page_content.lower()))
            overlap = len(query_terms.intersection(doc_terms))
            title_terms = set(re.findall(r"\w+", doc.metadata.get("title", "").lower()))
            title_overlap = len(query_terms.intersection(title_terms))

            score = (overlap * 1.5) + (title_overlap * 3.0)
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k] if score > 0] or [d[1] for d in scored_docs[:top_k]]

    def query(self, user_question: str) -> Dict[str, Any]:
        """Executes full RAG retrieval + generation pipeline."""
        retrieved_docs = self.retrieve(user_question, top_k=3)

        context_blocks = []
        sources = []
        for i, doc in enumerate(retrieved_docs):
            src_info = {
                "source": doc.metadata.get("source", "knowledge_base.md"),
                "title": doc.metadata.get("title", "Food Safety Standard"),
                "snippet": doc.page_content[:200] + "..."
            }
            sources.append(src_info)
            context_blocks.append(f"--- Document {i+1} ({src_info['title']}) ---\n{doc.page_content}")

        context_str = "\n\n".join(context_blocks)

        if not context_str.strip():
            context_str = (
                "General Food Safety Standard: Perishable food must remain below 4°C / 40°F (cold holding) "
                "or above 60°C / 140°F (hot holding). The Danger Zone is 4°C - 60°C (40°F - 140°F) where food "
                "must not exceed 2 hours unrefrigerated."
            )

        # Execute generation via LangChain LCEL Chain
        if langchain_llm:
            try:
                chain = self.rag_prompt | langchain_llm | self.output_parser
                raw_response = chain.invoke({
                    "context": context_str,
                    "question": user_question
                })
                clean_answer = clean_llm_response(raw_response)
            except Exception as e:
                clean_answer = f"RAG Generation Error: {str(e)}"
        elif groq_client:
            try:
                completion = groq_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": "You are the FoodLoop Food Safety & Redistribution Assistant."},
                        {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {user_question}"}
                    ],
                    temperature=0.2,
                    max_tokens=1200
                )
                clean_answer = clean_llm_response(completion.choices[0].message.content or "")
            except Exception as e:
                clean_answer = f"Groq Error: {str(e)}"
        else:
            clean_answer = (
                "**Food Safety Guidelines Summary:**\n"
                "- Keep cold foods at or below **4°C (40°F)**.\n"
                "- Maintain hot foods at or above **60°C (140°F)**.\n"
                "- Discard items left in the Temperature Danger Zone (4°C–60°C) for over **2 hours**."
            )

        return {
            "success": True,
            "question": user_question,
            "answer": clean_answer,
            "sources": sources
        }


# Singleton RAG instance
rag_engine = LangChainRAGEngine()

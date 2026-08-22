import os
from dotenv import load_dotenv
from pymongo import MongoClient
from groq import Groq
from langchain_groq import ChatGroq

load_dotenv()

PORT = int(os.getenv("PORT", 5000))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/foodloop")

# MongoDB initialization
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
db = mongo_client.get_database()

# Native Groq client (default from env if present)
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# LangChain ChatGroq model instance (default from env if present)
langchain_llm = ChatGroq(
    model_name=GROQ_MODEL,
    groq_api_key=GROQ_API_KEY,
    temperature=0.2,
    max_tokens=4000,
    max_retries=2
) if GROQ_API_KEY else None


def get_groq_llm(api_key: str = ""):
    """Returns a ChatGroq LLM instance using the provided key or fallback to env."""
    key = (api_key or "").strip() or GROQ_API_KEY
    if not key:
        return None
    return ChatGroq(
        model_name=GROQ_MODEL,
        groq_api_key=key,
        temperature=0.2,
        max_tokens=4000,
        max_retries=2
    )


def get_groq_client(api_key: str = ""):
    """Returns a native Groq client using the provided key or fallback to env."""
    key = (api_key or "").strip() or GROQ_API_KEY
    if not key:
        return None
    return Groq(api_key=key)
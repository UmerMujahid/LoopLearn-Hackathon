import os
from dotenv import load_dotenv
from pymongo import MongoClient
from groq import Groq
from langchain_groq import ChatGroq

load_dotenv()

PORT = int(os.getenv("PORT", 5000))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/foodloop")

# MongoDB initialization
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
db = mongo_client.get_database()

# Native Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# LangChain ChatGroq model instance
langchain_llm = ChatGroq(
    model_name=GROQ_MODEL,
    groq_api_key=GROQ_API_KEY,
    temperature=0.2,
    max_retries=2
) if GROQ_API_KEY else None

if not GROQ_API_KEY:
    print("[WARNING] GROQ_API_KEY is missing. AI endpoints will fail.")
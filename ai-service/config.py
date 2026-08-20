import os
from dotenv import load_dotenv
from pymongo import MongoClient
from groq import Groq

load_dotenv()

PORT = int(os.getenv("PORT", 5000))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/foodloop")

# MongoDB initialization
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
db = mongo_client.get_database()

# Groq client initialization
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if not groq_client:
    print("[WARNING] GROQ_API_KEY is missing. AI endpoints will fail.")
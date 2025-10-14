from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import bots, chat
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Custom RAG Bot Builder")

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later limit to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bots.router)
app.include_router(chat.router)
# app.include_router(files.router)

# # ✅ Serve static files (logos, PDFs, etc.)
# bots_dir = os.path.join(os.getcwd(), "bots")
# app.mount("/bots", StaticFiles(directory=bots_dir), name="bots")
app.mount("/static", StaticFiles(directory="bots"), name="static")

@app.get("/")
def home():
    return {"message": "RAG Bot API is running 🚀"}


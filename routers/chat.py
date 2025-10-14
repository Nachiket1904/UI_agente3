from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils import rag_utils, db_utils

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    bot_id: str
    query: str

@router.post("/")
async def chat_with_bot(data: ChatRequest):
    """Chat with the bot using RAG pipeline."""
    bot_config = db_utils.get_bot_config(data.bot_id)
    if not bot_config:
        raise HTTPException(status_code=404, detail="Bot not found")

    _, chain = rag_utils.create_rag_chain(bot_config["system_prompt"], bot_config["vectorstore_path"])
    response = chain.invoke({'input': data.query})
    return {"answer": response['answer']}

"""
RAG chat router — queries the DB-driven chat engine.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from app.rag.chat_engine import RAGChatEngine
from app.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Chat & RAG"])


@router.post("/query", response_model=ChatMessageResponse)
def query_ai_chat(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    RAG-powered conversational assistant — builds context from real DB data.
    """
    engine = RAGChatEngine(db)
    return engine.query(req.message)

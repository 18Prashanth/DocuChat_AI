from pydantic import BaseModel, Field,EmailStr
from typing import Optional, List 

class ChatInput(BaseModel):
    question: str 

class ResponseQuestion(BaseModel):
    answer: str
    source: str
    question: str




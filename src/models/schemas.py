from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ToneEnum(str, Enum):
    happy = "Happy"
    surprising = "Surprising"
    angry = "Angry"
    suspenseful = "Suspenseful"
    sad = "Sad"
    all = "All"

class MediaType(str, Enum):
    movie = "movie"
    book = "book"

class UserQuery(BaseModel):
    user_id: Optional[int] = Field(None, description="ID of the authenticated user")
    query_text: str = Field(..., min_length=2, description="The user's input text")
    tone: ToneEnum = Field(ToneEnum.all, description="Emotional tone filter")
    media_type: MediaType = Field(MediaType.movie, description="Type of media to recommend")
    model: Optional[str] = Field("gemini-2.5-flash", description="AI Model to use")

class RecommendationItem(BaseModel):
    title: str
    author_or_director: str
    description: str
    thumbnail_url: str
    explanation: Optional[str] = Field(None, description="LLM-generated explanation of why this fits")
    average_rating: float = Field(0.0, description="Average rating of the item")
    year: int = Field(0, description="Release year of the item")
    genres: List[str] = Field([], description="List of genres/categories")

class AgentResponse(BaseModel):
    recommendations: List[RecommendationItem]
    agent_message: str = Field(..., description="Conversational response from the agent")

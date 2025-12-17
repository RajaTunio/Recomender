from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sys

# Add project root to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.database.db_manager import DatabaseManager
from src.backend.recommender import RecommenderSystem
from src.models.schemas import UserQuery, AgentResponse, RecommendationItem

app = FastAPI(title="AI Agent API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Components
db = DatabaseManager()
# Initialize Recommender lazily or on startup? 
# Recommender takes time to load models, so let's do it on startup but handle global var
recommender = None

@app.on_event("startup")
async def startup_event():
    global recommender
    recommender = RecommenderSystem()

# --- Auth Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    full_name: str

class CheckUsernameRequest(BaseModel):
    username: str

class ProfileRequest(BaseModel):
    user_id: int
    preference_type: str # FAVORITE, DISLIKE, WISHLIST
    item_value: str
    category: str

class UpdateProfileRequest(BaseModel):
    user_id: int
    full_name: str | None = None
    email: str | None = None
    profile_image: str | None = None

# --- Endpoints ---

@app.post("/check_username")
async def check_username_availability(req: CheckUsernameRequest):
    is_available = db.check_username(req.username)
    return {"available": is_available}

@app.post("/register")
async def register(req: RegisterRequest):
    user_id = db.register_user(req.username, req.password, req.email, req.full_name)
    if not user_id:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Auto-login after register
    user = db.authenticate_user(req.username, req.password)
    return {"message": "Registered successfully", "user": user}

@app.post("/login")
async def login(req: LoginRequest):
    user = db.authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@app.post("/chat", response_model=AgentResponse)
async def chat(query: UserQuery):
    if not recommender:
        raise HTTPException(status_code=503, detail="System initializing...")
    
    # 1. Get Recommendations
    response = recommender.get_recommendations(query)
    
    # 2. Log Interaction (if logged in)
    if query.user_id:
        db.log_interaction(
            user_id=query.user_id,
            query_text=query.query_text,
            tone=query.tone.value,
            media_type=query.media_type.value,
            agent_response=response.agent_message,
            recommendations=[r.dict() for r in response.recommendations]
        )
    
    return response

@app.get("/profile/{user_id}")
async def get_profile(user_id: int):
    return db.get_user_profile(user_id)

@app.post("/update_profile")
async def update_profile(req: UpdateProfileRequest):
    success = db.update_user_profile(
        user_id=req.user_id,
        full_name=req.full_name,
        email=req.email,
        profile_image=req.profile_image
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    return {"status": "success"}

@app.get("/history/{user_id}")
async def get_history(user_id: int):
    return db.get_chat_history(user_id)

@app.get("/history/details/{interaction_id}")
async def get_history_details(interaction_id: int):
    details = db.get_interaction_details(interaction_id)
    if not details:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return details

@app.post("/profile/preference")
async def add_preference(req: ProfileRequest):
    db.add_preference(req.user_id, req.preference_type, req.item_value, req.category)
    return {"status": "success"}

@app.post("/profile/preference/remove")
async def remove_preference(req: ProfileRequest):
    db.remove_preference(req.user_id, req.preference_type, req.item_value)
    return {"status": "removed"}

# Serve Frontend (Optional, if we want to serve from same port)
# Adjust path to src/frontend
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend_new", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

"""
User management router for DermAI API.
Handles user profiles, authentication, and scan history.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from services.firebase_service import (
    verify_id_token, create_user_profile, get_user_profile,
    get_user_scans, update_user_preferences, save_scan_result
)

router = APIRouter()


class UserProfile(BaseModel):
    email: str
    name: Optional[str] = None
    preferences: Optional[dict] = None


class ScanHistoryItem(BaseModel):
    id: str
    timestamp: str
    overall_score: float
    skin_type: str
    top_concerns: List[str]


class UpdatePreferencesRequest(BaseModel):
    skin_type: Optional[str] = None
    notifications: Optional[bool] = None


def get_user_id_from_token(authorization: str = Header(None)) -> str:
    """Extract and verify user ID from Firebase ID token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        # Extract token from "Bearer <token>"
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
        
        # Verify token
        claims = verify_id_token(token)
        return claims.get("uid")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("/users/register")
async def register_user(profile: UserProfile):
    """
    Register a new user.
    
    Note: In production, use Firebase client SDK for registration.
    This endpoint is for backend-initiated registration only.
    """
    try:
        # Verify email format
        if not profile.email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Create user profile in Firestore
        # Note: User should already exist in Firebase Auth
        create_user_profile(
            user_id=profile.email.replace("@", "_").replace(".", "_"),
            email=profile.email,
            name=profile.name
        )
        
        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "email": profile.email,
                "name": profile.name
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/users/profile")
async def get_profile(user_id: str = Depends(get_user_id_from_token)):
    """Get current user's profile."""
    try:
        profile = get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return {
            "success": True,
            "user": profile
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.put("/users/profile")
async def update_profile(
    profile: UserProfile,
    user_id: str = Depends(get_user_id_from_token)
):
    """Update user profile."""
    try:
        from services.firebase_service import get_db
        from datetime import datetime
        
        db = get_db()
        update_data = {
            "updated_at": datetime.utcnow()
        }
        
        if profile.name:
            update_data["name"] = profile.name
        
        if profile.preferences:
            update_data["preferences"] = profile.preferences
        
        db.collection("users").document(user_id).update(update_data)
        
        return {
            "success": True,
            "message": "Profile updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.get("/users/scan-history")
async def get_scan_history(
    limit: int = 20,
    user_id: str = Depends(get_user_id_from_token)
):
    """Get user's scan history."""
    try:
        scans = get_user_scans(user_id, limit=limit)
        
        return {
            "success": True,
            "total": len(scans),
            "scans": scans
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.put("/users/preferences")
async def update_preferences(
    request: UpdatePreferencesRequest,
    user_id: str = Depends(get_user_id_from_token)
):
    """Update user preferences."""
    try:
        prefs = {}
        if request.skin_type:
            prefs["skin_type"] = request.skin_type
        if request.notifications is not None:
            prefs["notifications"] = request.notifications
        
        update_user_preferences(user_id, prefs)
        
        return {
            "success": True,
            "message": "Preferences updated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.delete("/users/account")
async def delete_account(user_id: str = Depends(get_user_id_from_token)):
    """
    Delete user account and all associated data.
    
    Note: Also delete from Firebase Auth via client SDK.
    """
    try:
        from services.firebase_service import get_db
        
        db = get_db()
        
        # Delete all scans
        scans = get_user_scans(user_id, limit=1000)
        for scan in scans:
            db.collection("users").document(user_id).collection("scans").document(scan["id"]).delete()
        
        # Delete user profile
        db.collection("users").document(user_id).delete()
        
        return {
            "success": True,
            "message": "Account deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

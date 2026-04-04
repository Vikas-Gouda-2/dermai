"""
Firebase integration service for DermAI.
Handles authentication, database operations, and file storage.
"""

import os
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from functools import lru_cache

# Initialize Firebase
_db = None
_auth = None
_storage_bucket = None

def init_firebase():
    """Initialize Firebase app using environment variables (production) or credentials file (development)."""
    global _db, _auth, _storage_bucket
    
    try:
        if not firebase_admin._apps:
            firebase_config = None
            
            # For production (Render, etc): use environment variables
            if os.getenv("ENVIRONMENT") == "production" or os.getenv("FIREBASE_PRIVATE_KEY"):
                print("Loading Firebase credentials from environment variables (production)...")
                private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
                firebase_config = {
                    "type": "service_account",
                    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", "key123"),
                    "private_key": private_key,
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID", "123456789"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": ""
                }
            # For development: try to load from credentials file
            else:
                creds_path = os.path.expanduser("~/Downloads/ai-face-health-analyzer-firebase-adminsdk-fbsvc-a961ac817c.json")
                if os.path.exists(creds_path):
                    print("Loading Firebase credentials from file (development)...")
                    creds = credentials.Certificate(creds_path)
                else:
                    print("No Firebase credentials found. Using mock Firebase.")
            
            # Initialize with credentials if found
            if firebase_config:
                creds = credentials.Certificate(firebase_config)
                firebase_admin.initialize_app(creds, {
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'ai-face-health-analyzer.firebasestorage.app'),
                    'databaseURL': os.getenv('FIREBASE_DATABASE_URL', 'https://ai-face-health-analyzer.firebaseio.com')
                })
            elif os.path.exists(os.path.expanduser("~/Downloads/ai-face-health-analyzer-firebase-adminsdk-fbsvc-a961ac817c.json")):
                creds_path = os.path.expanduser("~/Downloads/ai-face-health-analyzer-firebase-adminsdk-fbsvc-a961ac817c.json")
                creds = credentials.Certificate(creds_path)
                firebase_admin.initialize_app(creds, {
                    'storageBucket': 'ai-face-health-analyzer.firebasestorage.app',
                    'databaseURL': 'https://ai-face-health-analyzer.firebaseio.com'
                })
            else:
                print("Firebase not initialized - using mock mode")
                return  # Skip Firebase initialization
        
        _db = firestore.client()
        _auth = auth
        _storage_bucket = storage.bucket()
        print("✅ Firebase initialized successfully")
    except Exception as e:
        print(f"⚠️ Firebase initialization warning: {e}")
        print("Using mock Firebase (data not persisted)")


def get_db():
    """Get Firestore database instance."""
    if _db is None:
        init_firebase()
    return _db


def get_auth():
    """Get Firebase auth instance."""
    if _auth is None:
        init_firebase()
    return _auth


def verify_id_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token.
    
    Args:
        token: ID token from frontend
        
    Returns:
        Token claims if valid
        
    Raises:
        Exception if token invalid
    """
    try:
        claims = get_auth().verify_id_token(token)
        return claims
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")


def save_scan_result(user_id: str, analysis_result: Dict[str, Any], 
                     image_url: str = None) -> str:
    """
    Save scan result to Firestore.
    
    Args:
        user_id: Firebase user ID
        analysis_result: Analysis output from skin_scorer
        image_url: URL of saved image in Cloud Storage
        
    Returns:
        Document ID of saved scan
    """
    db = get_db()
    
    scan_doc = {
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "analysis": analysis_result,
        "image_url": image_url,
        "overall_score": analysis_result.get("overall_score"),
        "skin_type": analysis_result.get("skin_type"),
        "top_concerns": analysis_result.get("top_concerns", []),
    }
    
    doc_ref = db.collection("users").document(user_id).collection("scans").document()
    doc_ref.set(scan_doc)
    
    return doc_ref.id


def get_user_scans(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Get scan history for a user."""
    db = get_db()
    
    docs = db.collection("users").document(user_id).collection("scans")\
        .order_by("timestamp", direction=firestore.Query.DESCENDING)\
        .limit(limit).stream()
    
    scans = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        scans.append(data)
    
    return scans


def save_report(user_id: str, scan_id: str, report_data: Dict[str, Any],
                pdf_url: str = None) -> str:
    """Save PDF report metadata to Firestore."""
    db = get_db()
    
    report_doc = {
        "user_id": user_id,
        "scan_id": scan_id,
        "created_at": datetime.utcnow(),
        "report_data": report_data,
        "pdf_url": pdf_url,
    }
    
    doc_ref = db.collection("users").document(user_id).collection("reports").document()
    doc_ref.set(report_doc)
    
    return doc_ref.id


def upload_file_to_storage(user_id: str, file_path: str, 
                          destination_blob_name: str = None) -> str:
    """
    Upload file to Firebase Cloud Storage.
    
    Args:
        user_id: User ID for organizing files
        file_path: Path to file to upload
        destination_blob_name: Name in storage (default: filename)
        
    Returns:
        Public URL of uploaded file
    """
    bucket = _storage_bucket
    if bucket is None:
        raise RuntimeError("Storage bucket not initialized")
    
    if destination_blob_name is None:
        destination_blob_name = os.path.basename(file_path)
    
    blob_path = f"users/{user_id}/{destination_blob_name}"
    blob = bucket.blob(blob_path)
    
    blob.upload_from_filename(file_path)
    blob.make_public()
    
    return blob.public_url


def create_user_profile(user_id: str, email: str, name: str = None) -> None:
    """Create user profile in Firestore."""
    db = get_db()
    
    user_doc = {
        "email": email,
        "name": name or email.split("@")[0],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "scan_count": 0,
        "preferences": {
            "skin_type": None,
            "notifications": True
        }
    }
    
    db.collection("users").document(user_id).set(user_doc, merge=True)


def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile from Firestore."""
    db = get_db()
    doc = db.collection("users").document(user_id).get()
    
    if doc.exists:
        return doc.to_dict()
    return None


def update_user_preferences(user_id: str, preferences: Dict[str, Any]) -> None:
    """Update user preferences."""
    db = get_db()
    
    db.collection("users").document(user_id).update({
        "preferences": preferences,
        "updated_at": datetime.utcnow()
    })


# Initialize Firebase on import
try:
    init_firebase()
except:
    pass  # Will warn on init_firebase call

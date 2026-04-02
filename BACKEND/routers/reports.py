"""
Reports router for DermAI API.
Handles PDF report generation and storage.
"""

import os
import tempfile
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import json
from services.firebase_service import (
    save_report, get_db, upload_file_to_storage,
    verify_id_token
)
from services.pdf_generator import generate_analysis_pdf, save_pdf_to_file


router = APIRouter()


class ReportRequest(BaseModel):
    scan_id: str
    analysis_result: dict
    recommendations: Optional[List[dict]] = None
    user_name: str = "User"


def get_user_id_from_token(authorization: str = Header(None)) -> str:
    """Extract and verify user ID from Firebase ID token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
        
        claims = verify_id_token(token)
        return claims.get("uid")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("/reports/generate")
async def generate_report(
    request: ReportRequest,
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Generate a PDF report for a skin analysis.
    """
    try:
        # Generate PDF
        pdf_buffer = generate_analysis_pdf(
            analysis_result=request.analysis_result,
            user_name=request.user_name,
            recommendations=request.recommendations or []
        )
        
        # Save temp file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_buffer.getvalue())
            tmp_path = tmp.name
        
        try:
            # Upload to Firebase Storage (optional)
            pdf_url = None
            try:
                pdf_filename = f"report_{request.scan_id}.pdf"
                pdf_url = upload_file_to_storage(user_id, tmp_path, pdf_filename)
            except:
                # If storage upload fails, still return the PDF
                pass
            
            # Save report metadata to Firestore
            report_id = save_report(
                user_id=user_id,
                scan_id=request.scan_id,
                report_data=request.analysis_result,
                pdf_url=pdf_url
            )
            
            return {
                "success": True,
                "report_id": report_id,
                "pdf_url": pdf_url,
                "message": "Report generated successfully"
            }
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    user_id: str = Depends(get_user_id_from_token)
):
    """Get report by ID."""
    try:
        db = get_db()
        doc = db.collection("users").document(user_id).collection("reports").document(report_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report_data = doc.to_dict()
        report_data["id"] = doc.id
        
        return {
            "success": True,
            "report": report_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")


@router.get("/reports/user/list")
async def list_user_reports(
    limit: int = 20,
    user_id: str = Depends(get_user_id_from_token)
):
    """List all reports for a user."""
    try:
        db = get_db()
        docs = db.collection("users").document(user_id).collection("reports")\
            .order_by("created_at", direction=firestore.Query.DESCENDING)\
            .limit(limit).stream()
        
        reports = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            reports.append(data)
        
        return {
            "success": True,
            "total": len(reports),
            "reports": reports
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")


@router.post("/reports/download")
async def download_report(
    request: ReportRequest,
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Generate and download a PDF report.
    """
    try:
        # Generate PDF
        pdf_buffer = generate_analysis_pdf(
            analysis_result=request.analysis_result,
            user_name=request.user_name,
            recommendations=request.recommendations or []
        )
        
        # Return as file download
        return FileResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=dermai_report_{request.scan_id}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: str,
    user_id: str = Depends(get_user_id_from_token)
):
    """Delete a report."""
    try:
        db = get_db()
        db.collection("users").document(user_id).collection("reports").document(report_id).delete()
        
        return {
            "success": True,
            "message": "Report deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")


# Import firestore at end to avoid circular imports
from firebase_admin import firestore

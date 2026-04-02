"""
PDF Report Generation Service for DermAI.
Generates detailed skin analysis reports as PDFs.
"""

import io
import os
from datetime import datetime
from typing import Dict, Any, Tuple
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage,
    Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from PIL import Image, ImageDraw
import base64


def generate_skin_health_gauge(score: float, size: int = 150) -> io.BytesIO:
    """
    Generate a circular gauge image for skin health score.
    
    Args:
        score: Health score 0-10
        size: Size of gauge in pixels
        
    Returns:
        BytesIO object with PNG image
    """
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw background circle
    margin = 5
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 outline='#E0E0E0', width=3)
    
    # Calculate color based on score
    if score >= 7:
        color = '#06D6A0'  # Mint green - healthy
    elif score >= 5:
        color = '#FFD700'  # Gold - moderate
    elif score >= 3:
        color = '#FF9500'  # Orange - needs attention
    else:
        color = '#EF476F'  # Red - poor
    
    # Draw score arc (simplified - just draw colored circle)
    arc_width = 8
    draw.ellipse([margin + arc_width, margin + arc_width,
                  size - margin - arc_width, size - margin - arc_width],
                 fill=color, outline=color)
    
    # Draw text
    text = f"{score:.1f}/10"
    text_size = draw.textbbox((0, 0), text, font=None)
    text_width = text_size[2] - text_size[0]
    text_x = (size - text_width) // 2
    text_y = (size // 2) - 10
    draw.text((text_x, text_y), text, fill='black')
    
    # Convert to bytes
    img_io = io.BytesIO()
    img.save(img_io, format='PNG')
    img_io.seek(0)
    
    return img_io


def create_condition_color_badge(condition_key: str, score: float) -> str:
    """Get color hex code for a condition severity."""
    if score < 3:
        return '#06D6A0'  # Green - mild
    elif score < 6:
        return '#FFD700'  # Yellow - moderate
    elif score < 8:
        return '#FF9500'  # Orange - significant
    else:
        return '#EF476F'  # Red - severe


def generate_analysis_pdf(
    analysis_result: Dict[str, Any],
    user_name: str = "User",
    profile_image_base64: str = None,
    recommendations: list = None
) -> io.BytesIO:
    """
    Generate a comprehensive skin analysis PDF report.
    
    Args:
        analysis_result: Output from skin_scorer.generate_mock_analysis()
        user_name: User's name for the report
        profile_image_base64: Optional profile image in base64
        recommendations: List of product recommendations
        
    Returns:
        BytesIO object containing PDF
    """
    
    # Create PDF document
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Prepare styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=HexColor('#4F6FD1'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#4F6FD1'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 10
    normal_style.alignment = TA_LEFT
    
    # Build content
    content = []
    
    # Header with title
    content.append(Paragraph("DermAI", title_style))
    content.append(Paragraph("AI-Powered Skin Analysis Report", 
                            ParagraphStyle('subtitle', parent=styles['Normal'],
                                         fontSize=12, textColor=HexColor('#666'),
                                         alignment=TA_CENTER)))
    content.append(Spacer(1, 0.2*inch))
    
    # User info and date
    report_date = datetime.now().strftime("%B %d, %Y")
    user_info_text = f"<b>Report for:</b> {user_name} | <b>Date:</b> {report_date}"
    content.append(Paragraph(user_info_text, normal_style))
    content.append(Spacer(1, 0.15*inch))
    
    # Overall Score Section
    content.append(Paragraph("Overall Skin Health Score", heading_style))
    
    try:
        # Generate and include gauge image
        gauge_img = generate_skin_health_gauge(analysis_result.get("overall_score", 5))
        gauge_path = "/tmp/gauge.png"
        with open(gauge_path, "wb") as f:
            f.write(gauge_img.getvalue())
        
        gauge_image = RLImage(gauge_path, width=1.5*inch, height=1.5*inch)
        content.append(gauge_image)
    except:
        # Fallback if image generation fails
        score_text = f"Overall Score: <b>{analysis_result.get('overall_score', 'N/A')}/10</b>"
        content.append(Paragraph(score_text, normal_style))
    
    content.append(Spacer(1, 0.15*inch))
    
    # Skin Type and Analysis Confidence
    skin_type = analysis_result.get("skin_type", "Unknown")
    confidence = analysis_result.get("analysis_confidence", 0)
    
    info_text = f"""
    <b>Skin Type:</b> {skin_type}<br/>
    <b>Analysis Confidence:</b> {confidence * 100:.0f}%
    """
    content.append(Paragraph(info_text, normal_style))
    content.append(Spacer(1, 0.2*inch))
    
    # Detailed Condition Analysis
    content.append(Paragraph("Detected Skin Conditions", heading_style))
    
    conditions = analysis_result.get("conditions", [])
    if conditions:
        # Create condition table
        condition_data = [["Condition", "Severity", "Score"]]
        
        for cond in conditions:
            if cond.get("detected"):
                severity = cond.get("severity", "Unknown")
                score = f"{cond.get('score', 0):.1f}"
                condition_data.append([
                    cond.get("label", "Unknown"),
                    severity,
                    score
                ])
        
        if len(condition_data) > 1:
            condition_table = Table(condition_data, colWidths=[3*inch, 1.2*inch, 0.8*inch])
            condition_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#4F6FD1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F5F5F5')),
                ('GRID', (0, 0), (-1, -1), 1, black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#FAFAFA')])
            ]))
            content.append(condition_table)
    
    content.append(Spacer(1, 0.2*inch))
    
    # Top Concerns
    top_concerns = analysis_result.get("top_concerns", [])
    if top_concerns:
        concerns_text = f"<b>Top Concerns:</b> {', '.join(top_concerns[:3])}"
        content.append(Paragraph(concerns_text, normal_style))
        content.append(Spacer(1, 0.15*inch))
    
    # Positive Aspects
    positive = analysis_result.get("positive_aspects", [])
    if positive:
        pos_text = f"<b>What's Going Well:</b> {', '.join(positive[:2])}"
        content.append(Paragraph(pos_text, normal_style))
        content.append(Spacer(1, 0.2*inch))
    
    # Recommendations Section  
    if recommendations:
        content.append(PageBreak())
        content.append(Paragraph("Recommended Products", heading_style))
        
        # Show top 6 recommendations
        for i, prod in enumerate(recommendations[:6], 1):
            product_info = f"""
            <b>{i}. {prod.get('name', 'Product')}</b><br/>
            <font size="9"><b>Brand:</b> {prod.get('brand', 'N/A')} | 
            <b>Tier:</b> {prod.get('tier', 'N/A')} | 
            <b>Price:</b> {prod.get('price_range', 'N/A')}<br/>
            <b>Key Ingredients:</b> {', '.join(prod.get('key_ingredients', [])[:2])}<br/>
            <b>Why Recommended:</b> {prod.get('why_recommended', 'Recommended for your skin conditions')}</font>
            """
            content.append(Paragraph(product_info, normal_style))
            content.append(Spacer(1, 0.12*inch))
    
    # Footer
    content.append(Spacer(1, 0.3*inch))
    footer_text = """
    <font size="8" color="#999">
    This report is generated by DermAI's AI analysis engine and should not replace professional medical advice.
    Please consult a dermatologist for serious skin concerns.<br/>
    Report generated on {}<br/>
    © 2026 DermAI - AI-Powered Skin Analysis
    </font>
    """.format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    content.append(Paragraph(footer_text, 
                            ParagraphStyle('footer', parent=normal_style,
                                         fontSize=7, alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(content)
    pdf_buffer.seek(0)
    
    return pdf_buffer


def save_pdf_to_file(pdf_buffer: io.BytesIO, file_path: str) -> str:
    """Save PDF buffer to file."""
    with open(file_path, 'wb') as f:
        f.write(pdf_buffer.getvalue())
    return file_path

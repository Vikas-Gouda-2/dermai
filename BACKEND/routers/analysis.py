import base64
import io
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.skin_scorer import generate_mock_analysis

router = APIRouter()


class AnalyseRequest(BaseModel):
    image: str  # base64 encoded image
    timestamp: Optional[int] = None


class AnalyseResponse(BaseModel):
    success: bool
    data: dict
    processing_time_ms: int


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse_face(request: AnalyseRequest):
    """
    Analyse a face image and return skin condition scores.
    
    Currently uses mock analysis. To enable real AI:
    - Set OPENAI_API_KEY environment variable
    - Uncomment the OpenAI Vision call below
    """
    start_time = time.time()

    try:
        # Validate that we received a base64 image
        if not request.image:
            raise HTTPException(status_code=400, detail="No image provided")

        # Decode to verify it's valid base64
        try:
            # Remove data URL prefix if present
            image_data = request.image
            if "," in image_data:
                image_data = image_data.split(",")[1]
            image_bytes = base64.b64decode(image_data)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

        # --- FUTURE: Replace with real AI model call ---
        # import openai
        # client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        # response = client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=[{
        #         "role": "user",
        #         "content": [
        #             {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
        #             {"type": "text", "text": SKIN_ANALYSIS_PROMPT}
        #         ]
        #     }],
        #     response_format={"type": "json_object"}
        # )
        # analysis_result = json.loads(response.choices[0].message.content)
        # ----------------------------------------------

        # Use deterministic seed based on image size for consistent demo results
        seed = len(image_bytes) % 1000
        analysis_result = generate_mock_analysis(seed=seed)

        # Simulate realistic processing time
        import asyncio
        await asyncio.sleep(0.5)  # 500ms for "AI processing"

        processing_time = int((time.time() - start_time) * 1000)

        return AnalyseResponse(
            success=True,
            data=analysis_result,
            processing_time_ms=processing_time
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

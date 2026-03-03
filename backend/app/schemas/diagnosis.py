from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class IssueItem(BaseModel):
    type: str
    name: str
    symptoms: str
    severity: str
    confidence: float


class VLResult(BaseModel):
    growth_stage: str
    leaf_health: int
    issues: List[IssueItem]
    other_observations: Optional[str] = None


class LLMSuggestion(BaseModel):
    irrigation: str
    fertilizer: str
    pest_control: str
    other_management: str


class DiagnosisRequest(BaseModel):
    date: str
    growth_stage: str
    temperature: float
    air_humidity: float
    soil_humidity: float
    soil_ph: Optional[float] = None
    notes: Optional[str] = None


class DiagnosisResponse(BaseModel):
    status: str
    diagnosis_id: str
    vl_result: VLResult
    llm_suggestion: LLMSuggestion
    created_at: datetime


class DiagnosisRecord(BaseModel):
    id: str
    image_paths: List[str]
    request_data: DiagnosisRequest
    vl_result: VLResult
    llm_suggestion: LLMSuggestion
    created_at: datetime

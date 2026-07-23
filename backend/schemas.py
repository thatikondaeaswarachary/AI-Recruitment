from pydantic import BaseModel
from typing import List, Optional, Any

class CandidateBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    education: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    work_experience: Optional[List[str]] = []

class CandidateCreate(CandidateBase):
    parsed_text: str

class Candidate(CandidateBase):
    id: int

    class Config:
        from_attributes = True

class JobDescriptionBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescription(JobDescriptionBase):
    id: int

    class Config:
        from_attributes = True

class MatchScoreBase(BaseModel):
    candidate_id: int
    job_id: int
    score: float = 0.0
    overall_hiring_score: Optional[float] = 0.0
    skill_match_percentage: Optional[float] = 0.0
    experience_score: Optional[float] = 0.0
    education_score: Optional[float] = 0.0
    skill_gap_percentage: Optional[float] = 0.0
    
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    additional_skills: Optional[List[str]] = []
    skill_gaps: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    interview_questions: Optional[List[str]] = []

class MatchScoreCreate(MatchScoreBase):
    pass

class MatchScore(MatchScoreBase):
    id: int
    candidate: Candidate
    job: JobDescription

    class Config:
        from_attributes = True

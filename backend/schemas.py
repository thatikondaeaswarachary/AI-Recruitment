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
    score: float
    skill_gaps: List[str]
    interview_questions: List[str]

class MatchScoreCreate(MatchScoreBase):
    pass

class MatchScore(MatchScoreBase):
    id: int
    candidate: Candidate
    job: JobDescription

    class Config:
        from_attributes = True

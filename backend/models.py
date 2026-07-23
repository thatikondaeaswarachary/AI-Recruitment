from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    education = Column(JSON)
    skills = Column(JSON)
    work_experience = Column(JSON)
    parsed_text = Column(Text)

class JobDescription(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    required_skills = Column(JSON)

class MatchScore(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    score = Column(Float)  # Kept for backward compatibility (overall_hiring_score)
    overall_hiring_score = Column(Float)
    skill_match_percentage = Column(Float)
    experience_score = Column(Float)
    education_score = Column(Float)
    skill_gap_percentage = Column(Float)
    
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    additional_skills = Column(JSON)
    skill_gaps = Column(JSON)  # Same as missing_skills for backward compatibility
    recommendations = Column(JSON)
    interview_questions = Column(JSON)
    
    candidate = relationship("Candidate")
    job = relationship("JobDescription")


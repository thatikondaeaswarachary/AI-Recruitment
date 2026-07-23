from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.nlp_service import calculate_match_score, generate_interview_questions

router = APIRouter()

@router.post("/calculate/{candidate_id}/{job_id}", response_model=schemas.MatchScore)
def calculate_and_store_match(candidate_id: int, job_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(models.JobDescription).filter(models.JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    score, skill_gaps = calculate_match_score(candidate.skills, job.required_skills)
    questions = generate_interview_questions(job.required_skills, skill_gaps)
    
    # Check if match already exists
    existing_match = db.query(models.MatchScore).filter(
        models.MatchScore.candidate_id == candidate_id,
        models.MatchScore.job_id == job_id
    ).first()
    
    if existing_match:
        existing_match.score = score
        existing_match.skill_gaps = skill_gaps
        existing_match.interview_questions = questions
        db.commit()
        db.refresh(existing_match)
        return existing_match
        
    db_match = models.MatchScore(
        candidate_id=candidate_id,
        job_id=job_id,
        score=score,
        skill_gaps=skill_gaps,
        interview_questions=questions
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/job/{job_id}", response_model=list[schemas.MatchScore])
def get_matches_for_job(job_id: int, db: Session = Depends(get_db)):
    matches = db.query(models.MatchScore).filter(models.MatchScore.job_id == job_id).order_by(models.MatchScore.score.desc()).all()
    return matches

@router.get("/", response_model=list[schemas.MatchScore])
def get_all_matches(db: Session = Depends(get_db)):
    matches = db.query(models.MatchScore).order_by(models.MatchScore.score.desc()).all()
    return matches

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.nlp_service import analyze_job_description

router = APIRouter()

@router.post("/", response_model=schemas.JobDescription)
def create_job(job: schemas.JobDescriptionCreate, db: Session = Depends(get_db)):
    extracted_skills = analyze_job_description(job.description)
    
    # Merge extracted skills with manually provided ones (if any)
    final_skills = list(set(job.required_skills + extracted_skills))
    
    db_job = models.JobDescription(
        title=job.title,
        description=job.description,
        required_skills=final_skills
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=list[schemas.JobDescription])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = db.query(models.JobDescription).offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=schemas.JobDescription)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.JobDescription).filter(models.JobDescription.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

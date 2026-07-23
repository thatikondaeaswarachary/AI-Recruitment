from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import csv
import io
from .. import models, schemas
from ..database import get_db
from ..services.nlp_service import calculate_full_match_analysis, generate_interview_questions

router = APIRouter()

@router.post("/calculate/{candidate_id}/{job_id}", response_model=schemas.MatchScore)
def calculate_and_store_match(candidate_id: int, job_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(models.JobDescription).filter(models.JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    analysis = calculate_full_match_analysis(
        candidate_skills=candidate.skills,
        job_skills=job.required_skills,
        candidate_exp=candidate.work_experience,
        candidate_edu=candidate.education,
        job_desc=job.description
    )
    questions = generate_interview_questions(job.required_skills, analysis["missing_skills"])
    
    # Check if match already exists
    existing_match = db.query(models.MatchScore).filter(
        models.MatchScore.candidate_id == candidate_id,
        models.MatchScore.job_id == job_id
    ).first()
    
    if existing_match:
        existing_match.score = analysis["overall_hiring_score"]
        existing_match.overall_hiring_score = analysis["overall_hiring_score"]
        existing_match.skill_match_percentage = analysis["skill_match_percentage"]
        existing_match.experience_score = analysis["experience_score"]
        existing_match.education_score = analysis["education_score"]
        existing_match.skill_gap_percentage = analysis["skill_gap_percentage"]
        existing_match.matched_skills = analysis["matched_skills"]
        existing_match.missing_skills = analysis["missing_skills"]
        existing_match.additional_skills = analysis["additional_skills"]
        existing_match.skill_gaps = analysis["missing_skills"]
        existing_match.recommendations = analysis["recommendations"]
        existing_match.interview_questions = questions
        db.commit()
        db.refresh(existing_match)
        return existing_match
        
    db_match = models.MatchScore(
        candidate_id=candidate_id,
        job_id=job_id,
        score=analysis["overall_hiring_score"],
        overall_hiring_score=analysis["overall_hiring_score"],
        skill_match_percentage=analysis["skill_match_percentage"],
        experience_score=analysis["experience_score"],
        education_score=analysis["education_score"],
        skill_gap_percentage=analysis["skill_gap_percentage"],
        matched_skills=analysis["matched_skills"],
        missing_skills=analysis["missing_skills"],
        additional_skills=analysis["additional_skills"],
        skill_gaps=analysis["missing_skills"],
        recommendations=analysis["recommendations"],
        interview_questions=questions
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.post("/calculate_all")
def calculate_all_matches(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).all()
    jobs = db.query(models.JobDescription).all()
    count = 0
    for cand in candidates:
        for job in jobs:
            calculate_and_store_match(cand.id, job.id, db)
            count += 1
    return {"message": f"Successfully calculated/updated {count} candidate-job match scores."}

@router.get("/job/{job_id}", response_model=list[schemas.MatchScore])
def get_matches_for_job(job_id: int, db: Session = Depends(get_db)):
    matches = db.query(models.MatchScore).filter(models.MatchScore.job_id == job_id).order_by(models.MatchScore.overall_hiring_score.desc(), models.MatchScore.score.desc()).all()
    return matches

@router.get("/", response_model=list[schemas.MatchScore])
def get_all_matches(db: Session = Depends(get_db)):
    # Calculate for all if empty or request auto-run
    candidates = db.query(models.Candidate).all()
    jobs = db.query(models.JobDescription).all()
    matches = db.query(models.MatchScore).order_by(models.MatchScore.overall_hiring_score.desc(), models.MatchScore.score.desc()).all()
    if len(matches) < (len(candidates) * len(jobs)) and len(jobs) > 0 and len(candidates) > 0:
        for cand in candidates:
            for job in jobs:
                calculate_and_store_match(cand.id, job.id, db)
        matches = db.query(models.MatchScore).order_by(models.MatchScore.overall_hiring_score.desc(), models.MatchScore.score.desc()).all()
    return matches

@router.get("/report/{match_id}/download")
def download_skill_gap_report(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.MatchScore).filter(models.MatchScore.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match score record not found")
        
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["AI RECRUITMENT COPILOT - SKILL GAP ANALYSIS REPORT"])
    writer.writerow([])
    writer.writerow(["Candidate Name", match.candidate.name if match.candidate else "N/A"])
    writer.writerow(["Candidate Email", match.candidate.email if match.candidate else "N/A"])
    writer.writerow(["Job Title", match.job.title if match.job else "N/A"])
    writer.writerow([])
    writer.writerow(["Overall Hiring Score", f"{match.overall_hiring_score or match.score}%"])
    writer.writerow(["Skill Match Percentage", f"{match.skill_match_percentage or 0}%"])
    writer.writerow(["Skill Gap Percentage", f"{match.skill_gap_percentage or 0}%"])
    writer.writerow(["Experience Match Score", f"{match.experience_score or 0}%"])
    writer.writerow(["Education Match Score", f"{match.education_score or 0}%"])
    writer.writerow([])
    writer.writerow(["MATCHED SKILLS", ", ".join(match.matched_skills or [])])
    writer.writerow(["MISSING SKILLS (GAPS)", ", ".join(match.missing_skills or match.skill_gaps or [])])
    writer.writerow(["ADDITIONAL SKILLS", ", ".join(match.additional_skills or [])])
    writer.writerow([])
    writer.writerow(["RECOMMENDED LEARNING PATHS / REMEDIATION"])
    for rec in (match.recommendations or []):
        writer.writerow(["-", rec])
    writer.writerow([])
    writer.writerow(["TAILORED INTERVIEW QUESTIONS"])
    for q in (match.interview_questions or []):
        writer.writerow(["-", q])
        
    csv_content = output.getvalue()
    filename = f"Skill_Gap_Report_{match.candidate.name.replace(' ', '_')}_{match.job.title.replace(' ', '_')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


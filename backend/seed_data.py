import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import engine, Base, SessionLocal
from backend import models
from backend.services.nlp_service import calculate_full_match_analysis, generate_interview_questions

def seed():
    # 1. Reset database tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Add Job Descriptions
        jobs_data = [
            {
                "title": "Senior Full-Stack Developer",
                "description": "Looking for an experienced engineer to build scalable web apps. Requires Python, FastAPI, React, SQL, Docker, and Git.",
                "required_skills": ["Python", "FastAPI", "React", "SQL", "Docker", "Git"]
            },
            {
                "title": "AI / ML Engineer",
                "description": "Building NLP pipelines and machine learning models. Requires Python, Machine Learning, NLP, FastAPI, SQL, and Docker.",
                "required_skills": ["Python", "Machine Learning", "NLP", "FastAPI", "SQL", "Docker"]
            },
            {
                "title": "Frontend React Engineer",
                "description": "Crafting intuitive web interfaces and dashboards. Requires React, JavaScript, Git, and REST APIs.",
                "required_skills": ["React", "Git", "Python", "SQL"]
            }
        ]
        
        db_jobs = []
        for j in jobs_data:
            job = models.JobDescription(
                title=j["title"],
                description=j["description"],
                required_skills=j["required_skills"]
            )
            db.add(job)
            db_jobs.append(job)
        db.commit()
        for j in db_jobs:
            db.refresh(j)
            
        # 3. Add Candidates
        candidates_data = [
            {
                "name": "Sarah Jenkins",
                "email": "sarah.j@example.com",
                "phone": "+1-555-0192",
                "education": ["B.S. in Computer Science, Stanford University"],
                "skills": ["Python", "FastAPI", "React", "SQL", "Git", "Docker", "AWS"],
                "work_experience": ["Senior Software Engineer at TechCorp (4 years)"],
                "parsed_text": "Experienced Senior Full-Stack Engineer proficient in Python, FastAPI, React, SQL, Git, Docker, and AWS."
            },
            {
                "name": "Alex Rivera",
                "email": "alex.rivera@example.com",
                "phone": "+1-555-0284",
                "education": ["M.S. in Artificial Intelligence, MIT"],
                "skills": ["Python", "Machine Learning", "NLP", "SQL", "Git"],
                "work_experience": ["AI Research Assistant at MIT CSAIL (2 years)"],
                "parsed_text": "ML Specialist skilled in Python, Machine Learning models, Natural Language Processing (NLP), and SQL queries."
            },
            {
                "name": "David Chen",
                "email": "david.chen@example.com",
                "phone": "+1-555-0371",
                "education": ["B.A. in Web Design & Software Engineering"],
                "skills": ["React", "Git", "Python"],
                "work_experience": ["Frontend Engineer at WebStudio (2 years)"],
                "parsed_text": "Frontend Developer focusing on React UI components, CSS styling, and Git version control."
            }
        ]
        
        db_cands = []
        for c in candidates_data:
            cand = models.Candidate(
                name=c["name"],
                email=c["email"],
                phone=c["phone"],
                education=c["education"],
                skills=c["skills"],
                work_experience=c["work_experience"],
                parsed_text=c["parsed_text"]
            )
            db.add(cand)
            db_cands.append(cand)
        db.commit()
        for c in db_cands:
            db.refresh(c)
            
        # 4. Compute Match Scores & Skill Gap Analysis
        for cand in db_cands:
            for job in db_jobs:
                analysis = calculate_full_match_analysis(
                    candidate_skills=cand.skills,
                    job_skills=job.required_skills,
                    candidate_exp=cand.work_experience,
                    candidate_edu=cand.education,
                    job_desc=job.description
                )
                questions = generate_interview_questions(job.required_skills, analysis["missing_skills"])
                
                match = models.MatchScore(
                    candidate_id=cand.id,
                    job_id=job.id,
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
                db.add(match)
        db.commit()
        print("Database initialized and seeded successfully with Jobs, Candidates, and Skill Gap Analysis!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

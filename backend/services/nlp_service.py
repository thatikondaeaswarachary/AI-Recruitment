import re
import random

# In a real-world scenario, you would import Hugging Face transformers here.
# from transformers import pipeline
# nlp_model = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english")

def extract_skills_from_text(text: str):
    # Dummy mock skill extractor
    possible_skills = ["Python", "React", "FastAPI", "SQL", "Machine Learning", "NLP", "Java", "AWS", "Docker", "Git"]
    extracted = [skill for skill in possible_skills if skill.lower() in text.lower()]
    if not extracted:
        extracted = random.sample(possible_skills, 3)
    return extracted

def parse_resume_text(text: str):
    """
    Simulates extracting structured info from raw resume text using an LLM / NLP.
    """
    skills = extract_skills_from_text(text)
    
    return {
        "name": "Jane Doe" if "jane" in text.lower() else "John Smith",
        "email": "candidate@example.com",
        "phone": "123-456-7890",
        "education": ["B.S. in Computer Science"],
        "skills": skills,
        "work_experience": ["Software Engineer at TechCorp (2 years)"]
    }

def analyze_job_description(text: str):
    """
    Extracts required skills from job description text.
    """
    return extract_skills_from_text(text)

def calculate_full_match_analysis(candidate_skills, job_skills, candidate_exp=None, candidate_edu=None, job_desc=""):
    """
    Comprehensive candidate-job matching engine for Milestone 2.
    Calculates:
    - matched_skills, missing_skills, additional_skills
    - skill_match_percentage, skill_gap_percentage
    - experience_score, education_score, overall_hiring_score
    - recommendations for missing skills
    """
    candidate_skills = candidate_skills or []
    job_skills = job_skills or []
    
    c_skills_lower = {s.lower(): s for s in candidate_skills}
    j_skills_lower = {s.lower(): s for s in job_skills}
    
    # 1. Skill categorization
    matched_skills = [j_skills_lower[k] for k in j_skills_lower if k in c_skills_lower]
    missing_skills = [j_skills_lower[k] for k in j_skills_lower if k not in c_skills_lower]
    additional_skills = [c_skills_lower[k] for k in c_skills_lower if k not in j_skills_lower]
    
    total_req_skills = len(job_skills) if len(job_skills) > 0 else 1
    skill_match_pct = round((len(matched_skills) / total_req_skills) * 100, 1)
    skill_gap_pct = round((len(missing_skills) / total_req_skills) * 100, 1)
    
    # 2. Experience score calculation
    experience_score = 85.0
    if candidate_exp:
        exp_str = " ".join(candidate_exp).lower()
        if "senior" in exp_str or "lead" in exp_str or "5 year" in exp_str or "3 year" in exp_str:
            experience_score = 95.0
        elif "engineer" in exp_str or "developer" in exp_str:
            experience_score = 88.0
        elif "intern" in exp_str or "junior" in exp_str:
            experience_score = 70.0
            
    # 3. Education score calculation
    education_score = 90.0
    if candidate_edu:
        edu_str = " ".join(candidate_edu).lower()
        if "b.s." in edu_str or "m.s." in edu_str or "phd" in edu_str or "computer science" in edu_str:
            education_score = 95.0
            
    # 4. Overall Hiring Score (Weighted Composite: 60% Skills + 25% Experience + 15% Education)
    overall_hiring_score = round(
        (0.60 * skill_match_pct) + (0.25 * experience_score) + (0.15 * education_score), 
        1
    )
    
    # 5. Recommendations for missing skills
    recommendations = generate_skill_recommendations(missing_skills)
    
    return {
        "overall_hiring_score": overall_hiring_score,
        "score": overall_hiring_score,  # Backward compatibility
        "skill_match_percentage": skill_match_pct,
        "experience_score": experience_score,
        "education_score": education_score,
        "skill_gap_percentage": skill_gap_pct,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "additional_skills": additional_skills,
        "skill_gaps": missing_skills,  # Backward compatibility
        "recommendations": recommendations
    }

def generate_skill_recommendations(missing_skills):
    """
    Generates actionable learning path recommendations for missing skills.
    """
    recommendations = []
    course_map = {
        "python": "Complete 'Python for Data Science & Backend Development' on Coursera / Udemy.",
        "react": "Build 2 hands-on projects with React 18, Vite, and Tailwind CSS.",
        "fastapi": "Review official FastAPI documentation on Async REST APIs & Pydantic models.",
        "sql": "Practice SQL queries (Joins, Indexing, Grouping) on LeetCode / HackerRank.",
        "machine learning": "Take Andrew Ng's Machine Learning Specialization or Hands-On ML with Scikit-Learn.",
        "nlp": "Study Hugging Face Transformers & NLTK spaCy NLP pipelines.",
        "java": "Review Java Core OOP principles and Spring Boot Framework.",
        "aws": "Earn AWS Certified Solutions Architect or Cloud Practitioner certification.",
        "docker": "Learn Docker containerization, Multi-stage builds & Docker Compose.",
        "git": "Practice Git branching strategies, Rebasing, and GitHub Pull Request workflows."
    }
    
    for skill in missing_skills:
        key = skill.lower()
        if key in course_map:
            recommendations.append(f"[{skill}] {course_map[key]}")
        else:
            recommendations.append(f"[{skill}] Complete targeted online modules and practical projects for {skill}.")
            
    if not recommendations:
        recommendations.append("Candidate possesses all required skills for this job description!")
        
    return recommendations

def calculate_match_score(candidate_skills, job_skills):
    """
    Legacy wrapper for calculate_full_match_analysis.
    """
    analysis = calculate_full_match_analysis(candidate_skills, job_skills)
    return analysis["overall_hiring_score"], analysis["missing_skills"]

def generate_interview_questions(job_skills, skill_gaps):
    """
    Generates tailored interview questions based on job requirements and candidate gaps.
    """
    questions = []
    
    for gap in skill_gaps:
        questions.append(f"You don't have direct experience listed with {gap}. How would you approach learning and applying it quickly?")
        
    for skill in job_skills:
        if skill not in skill_gaps:
            questions.append(f"Can you describe a challenging project where you utilized {skill}?")
            
    if not questions:
        questions.append("Tell me about your experience and how it aligns with this role.")
        
    return questions[:5]


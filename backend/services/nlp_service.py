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

def calculate_match_score(candidate_skills, job_skills):
    """
    Calculates compatibility score and detects skill gaps.
    """
    if not job_skills:
        return 100.0, []
        
    matched = set([s.lower() for s in candidate_skills]).intersection([s.lower() for s in job_skills])
    score = (len(matched) / len(job_skills)) * 100
    
    candidate_skills_lower = [s.lower() for s in candidate_skills]
    skill_gaps = [skill for skill in job_skills if skill.lower() not in candidate_skills_lower]
    
    return round(score, 1), skill_gaps

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
        
    return questions[:5] # Return top 5 questions

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

def test_milestone2_features():
    client = TestClient(app)
    
    # 1. Test GET /api/matches
    res = client.get("/api/matches/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    matches = res.json()
    assert len(matches) > 0, "Expected at least 1 match score record"
    
    first_match = matches[0]
    print("Fetched Matches Count:", len(matches))
    print("Sample Match Record:")
    print(" - Candidate Name:", first_match.get("candidate", {}).get("name"))
    print(" - Job Title:", first_match.get("job", {}).get("title"))
    print(" - Overall Hiring Score:", first_match.get("overall_hiring_score"))
    print(" - Skill Match %:", first_match.get("skill_match_percentage"))
    print(" - Skill Gap %:", first_match.get("skill_gap_percentage"))
    print(" - Matched Skills:", first_match.get("matched_skills"))
    print(" - Missing Skills:", first_match.get("missing_skills"))
    print(" - Additional Skills:", first_match.get("additional_skills"))
    print(" - Recommendations:", first_match.get("recommendations"))
    
    # 2. Test Download Skill-Gap Report Endpoint
    match_id = first_match["id"]
    report_res = client.get(f"/api/matches/report/{match_id}/download")
    assert report_res.status_code == 200, f"Report download failed with status {report_res.status_code}"
    assert "Content-Disposition" in report_res.headers
    assert "SKILL GAP ANALYSIS REPORT" in report_res.text
    print("\nSkill-Gap CSV Report Download Verified! CSV Header sample:\n", report_res.text[:250])
    
    print("\nALL MILESTONE 2 BACKEND VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_milestone2_features()

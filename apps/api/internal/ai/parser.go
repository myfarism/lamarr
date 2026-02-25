package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
)

type ParsedJob struct {
	Title        string `json:"title"`
	Company      string `json:"company"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
	SalaryMin    *int   `json:"salary_min"`
	SalaryMax    *int   `json:"salary_max"`
	Platform     string `json:"platform"`
}

func ParseJobDescription(ctx context.Context, rawText string) (*ParsedJob, error) {
	systemPrompt := `You are a job description parser. Extract structured information from job postings.
Always respond with valid JSON only, no markdown, no explanation.
If a field cannot be determined, use null for numbers and empty string for strings.`

	userMessage := fmt.Sprintf(`Parse this job posting and return JSON with these exact fields:
{
  "title": "job title",
  "company": "company name", 
  "description": "job description summary (max 500 chars)",
  "requirements": "key requirements as comma-separated list",
  "salary_min": null or number in IDR,
  "salary_max": null or number in IDR,
  "platform": "detected platform (linkedin/glints/jobstreet/etc)"
}

Job posting:
%s`, rawText)

	response, err := Chat(ctx, systemPrompt, userMessage)
	if err != nil {
		return nil, err
	}

	// Bersihkan response kalau ada markdown code block
	response = strings.TrimSpace(response)
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	var parsed ParsedJob
	if err := json.Unmarshal([]byte(response), &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &parsed, nil
}

type GapAnalysis struct {
	MatchPercentage int      `json:"match_percentage"`
	Strengths       []string `json:"strengths"`
	Gaps            []string `json:"gaps"`
	Suggestion      string   `json:"suggestion"`
	Verdict         string   `json:"verdict"`
}

func AnalyzeGap(ctx context.Context, cvText, jobRequirements string) (*GapAnalysis, error) {
	systemPrompt := `You are a brutally honest career advisor. 
Analyze the gap between a candidate's CV and job requirements.
Always respond with valid JSON only, no markdown, no explanation.`

	userMessage := fmt.Sprintf(`Analyze this CV against the job requirements.
Return JSON with these exact fields:
{
  "match_percentage": number 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2", "gap3"],
  "suggestion": "one specific actionable suggestion",
  "verdict": "one honest sentence about their chances"
}

CV:
%s

Job Requirements:
%s`, cvText, jobRequirements)

	response, err := Chat(ctx, systemPrompt, userMessage)
	if err != nil {
		return nil, err
	}

	response = strings.TrimSpace(response)
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	var analysis GapAnalysis
	if err := json.Unmarshal([]byte(response), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &analysis, nil
}

func GenerateFollowUpEmail(ctx context.Context, jobTitle, company, applicantName string, daysAgo int) (string, error) {
	systemPrompt := `You are a professional career coach. 
Write concise, professional follow-up emails for job applications.
Keep it under 150 words. Be direct, not desperate.`

	userMessage := fmt.Sprintf(`Write a follow-up email for:
- Applicant: %s
- Position: %s
- Company: %s  
- Applied: %d days ago

Return only the email body, no subject line.`, applicantName, jobTitle, company, daysAgo)

	return Chat(ctx, systemPrompt, userMessage)
}

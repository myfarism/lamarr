package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/myfarism/lamarr-api/internal/ai"
	"github.com/myfarism/lamarr-api/internal/model"
	"github.com/myfarism/lamarr-api/pkg/database"
)

// POST /api/ai/parse-job
// Body: { "text": "raw job description text" }
func ParseJob(c *gin.Context) {
	var input struct {
		Text string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsed, err := ai.ParseJobDescription(c.Request.Context(), input.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse job description"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": parsed})
}

// POST /api/ai/analyze/:jobId
// Analyze gap antara CV user dan job requirements
func AnalyzeJob(c *gin.Context) {
	user := currentUser(c)
	jobID := c.Param("jobId")

	// Ambil job
	var job model.Job
	if err := database.DB.Where("id = ? AND user_id = ?", jobID, user.ID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	if user.CvText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please upload your CV text first"})
		return
	}

	if job.Requirements == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job has no requirements to analyze"})
		return
	}

	// Gap analysis pakai Groq
	analysis, err := ai.AnalyzeGap(c.Request.Context(), user.CvText, job.Requirements)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze gap"})
		return
	}

	// Hitung embedding similarity juga
	cvEmbedding, err := ai.GetEmbedding(c.Request.Context(), user.CvText)
	if err == nil {
		jdEmbedding, err := ai.GetEmbedding(c.Request.Context(), job.Requirements)
		if err == nil {
			score := ai.CosineSimilarity(cvEmbedding, jdEmbedding)
			// Update match score di database
			database.DB.Model(&job).Update("match_score", score)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": analysis})
}

// POST /api/ai/follow-up/:jobId
func GenerateFollowUp(c *gin.Context) {
	user := currentUser(c)
	jobID := c.Param("jobId")

	var job model.Job
	if err := database.DB.Where("id = ? AND user_id = ?", jobID, user.ID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	daysAgo := int(time.Since(job.AppliedAt).Hours() / 24)
	name := user.Name
	if name == "" {
		name = user.Email
	}

	email, err := ai.GenerateFollowUpEmail(
		c.Request.Context(),
		job.Title,
		job.Company,
		name,
		daysAgo,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"email": email}})
}

// PATCH /api/me/cv
func UpdateCV(c *gin.Context) {
	user := currentUser(c)

	var input struct {
		CvText string `json:"cv_text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&model.User{}).
		Where("id = ?", user.ID).
		Update("cv_text", input.CvText)

	c.JSON(http.StatusOK, gin.H{"message": "CV updated"})
}

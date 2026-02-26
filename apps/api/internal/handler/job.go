package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/myfarism/lamarr-api/internal/model"
	"github.com/myfarism/lamarr-api/pkg/database"
)

// helper ambil user dari context
func currentUser(c *gin.Context) model.User {
	user, _ := c.Get("user")
	return user.(model.User)
}

// GET /api/jobs
func GetJobs(c *gin.Context) {
    user := currentUser(c)

    page, _  := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10")) // ← ubah default ke 10
    search   := c.Query("search")
    status   := c.Query("status")   // ← tambah
    platform := c.Query("platform") // ← tambah

    if page < 1  { page = 1 }
    if limit > 100 { limit = 100 }
    offset := (page - 1) * limit

    query := database.DB.Where("user_id = ?", user.ID)

    if search != "" {
        query = query.Where(
            "title ILIKE ? OR company ILIKE ?",
            "%"+search+"%", "%"+search+"%",
        )
    }

    // ← tambah filter status
    if status != "" {
        query = query.Where("status = ?", status)
    }

    // ← tambah filter platform
    if platform != "" && platform != "all" {
        query = query.Where("platform = ?", platform)
    }

    var total int64
    query.Model(&model.Job{}).Count(&total)

    var jobs []model.Job
    query.Order("created_at desc").
        Limit(limit).
        Offset(offset).
        Find(&jobs)

    c.JSON(http.StatusOK, gin.H{
        "data": jobs,
        "meta": gin.H{
            "total": total,
            "page":  page,
            "limit": limit,
            "pages": (total + int64(limit) - 1) / int64(limit),
        },
    })
}



// GET /api/jobs/:id
func GetJob(c *gin.Context) {
	user := currentUser(c)
	id := c.Param("id")

	var job model.Job
	result := database.DB.
		Where("id = ? AND user_id = ?", id, user.ID).
		Preload("Timelines").
		First(&job)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": job})
}

// POST /api/jobs
func CreateJob(c *gin.Context) {
	user := currentUser(c)

	var input struct {
		Title        string     `json:"title" binding:"required"`
		Company      string     `json:"company" binding:"required"`
		URL          string     `json:"url"`
		Platform     string     `json:"platform"`
		Description  string     `json:"description"`
		Requirements string     `json:"requirements"`
		SalaryMin    *int       `json:"salary_min"`
		SalaryMax    *int       `json:"salary_max"`
		Notes        string     `json:"notes"`
		Deadline     *time.Time `json:"deadline"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job := model.Job{
		UserID:       user.ID,
		Title:        input.Title,
		Company:      input.Company,
		URL:          input.URL,
		Platform:     input.Platform,
		Description:  input.Description,
		Requirements: input.Requirements,
		SalaryMin:    input.SalaryMin,
		SalaryMax:    input.SalaryMax,
		Notes:        input.Notes,
		Deadline:     input.Deadline,
		Status:       model.StatusApplied,
		AppliedAt:    time.Now(),
	}

	database.DB.Create(&job)

	// Catat di timeline
	database.DB.Create(&model.JobTimeline{
		JobID:      job.ID,
		Stage:      "applied",
		Note:       "Application submitted",
		HappenedAt: time.Now(),
	})

	c.JSON(http.StatusCreated, gin.H{"data": job})
}

// PATCH /api/jobs/:id/status
func UpdateJobStatus(c *gin.Context) {
	user := currentUser(c)
	id := c.Param("id")

	var input struct {
		Status model.JobStatus `json:"status" binding:"required"`
		Note   string          `json:"note"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var job model.Job
	result := database.DB.
		Where("id = ? AND user_id = ?", id, user.ID).
		First(&job)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	oldStatus := job.Status
	job.Status = input.Status
	database.DB.Save(&job)

	// Catat perubahan status di timeline
	note := input.Note
	if note == "" {
		note = "Status changed from " + string(oldStatus) + " to " + string(input.Status)
	}

	database.DB.Create(&model.JobTimeline{
		JobID:      job.ID,
		Stage:      string(input.Status),
		Note:       note,
		HappenedAt: time.Now(),
	})

	c.JSON(http.StatusOK, gin.H{"data": job})
}

// PATCH /api/jobs/:id
func UpdateJob(c *gin.Context) {
	user := currentUser(c)
	id := c.Param("id")

	var job model.Job
	result := database.DB.
		Where("id = ? AND user_id = ?", id, user.ID).
		First(&job)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	var input struct {
		Title        string     `json:"title"`
		Company      string     `json:"company"`
		URL          string     `json:"url"`
		Platform     string     `json:"platform"`
		Description  string     `json:"description"`
		Requirements string     `json:"requirements"`
		SalaryMin    *int       `json:"salary_min"`
		SalaryMax    *int       `json:"salary_max"`
		Notes        string     `json:"notes"`
		Deadline     *time.Time `json:"deadline"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&job).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": job})
}

// DELETE /api/jobs/:id
func DeleteJob(c *gin.Context) {
    user := currentUser(c)
    id := c.Param("id")

    // Cek dulu apakah job exist dan milik user ini
    var job model.Job
    result := database.DB.Where("id = ? AND user_id = ?", id, user.ID).First(&job)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
        return
    }

    // Hapus timeline dulu (foreign key constraint)
    database.DB.Where("job_id = ?", job.ID).Delete(&model.JobTimeline{})

    // Baru hapus job-nya
    database.DB.Delete(&job)

    c.JSON(http.StatusOK, gin.H{"message": "Job deleted"})
}

// GET /api/jobs/stats
func GetStats(c *gin.Context) {
	user := currentUser(c)

	var stats []struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}

	database.DB.Model(&model.Job{}).
		Select("status, count(*) as count").
		Where("user_id = ?", user.ID).
		Group("status").
		Scan(&stats)

	var total int64
	database.DB.Model(&model.Job{}).
		Where("user_id = ?", user.ID).
		Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":  stats,
		"total": total,
	})
}

// GET /api/jobs/stats — helper buat convert string id
func parseID(s string) uint {
	id, _ := strconv.ParseUint(s, 10, 32)
	return uint(id)
}

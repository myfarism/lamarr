package model

import "time"

type JobStatus string

const (
	StatusApplied    JobStatus = "applied"
	StatusScreening  JobStatus = "screening"
	StatusInterview  JobStatus = "interview"
	StatusOffer      JobStatus = "offer"
	StatusRejected   JobStatus = "rejected"
	StatusGhosted    JobStatus = "ghosted"
)

type Job struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"index;not null"`
	User         User           `json:"-" gorm:"foreignKey:UserID"`
	Timelines    []JobTimeline  `json:"timelines,omitempty" gorm:"foreignKey:JobID"` 
	Title        string         `json:"title" gorm:"not null"`
	Company      string         `json:"company" gorm:"not null"`
	URL          string         `json:"url"`
	Platform     string         `json:"platform"`
	Status       JobStatus      `json:"status" gorm:"default:applied"`
	Description  string         `json:"description" gorm:"type:text"`
	Requirements string         `json:"requirements" gorm:"type:text"`
	SalaryMin    *int           `json:"salary_min"`
	SalaryMax    *int           `json:"salary_max"`
	MatchScore   *float64       `json:"match_score"`
	Notes        string         `json:"notes" gorm:"type:text"`
	AppliedAt    time.Time      `json:"applied_at"`
	Deadline     *time.Time     `json:"deadline"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}


type JobTimeline struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	JobID       uint      `json:"job_id" gorm:"index;not null"`
	Stage       string    `json:"stage"`
	Note        string    `json:"note" gorm:"type:text"`
	HappenedAt  time.Time `json:"happened_at"`
	CreatedAt   time.Time `json:"created_at"`
}

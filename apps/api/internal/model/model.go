package model

import (
	"time"
)

type User struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	FirebaseUID string    `json:"firebase_uid" gorm:"uniqueIndex;not null"`
	Email       string    `json:"email" gorm:"uniqueIndex;not null"`
	Name        string    `json:"name"`
	CvText      string    `json:"cv_text" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

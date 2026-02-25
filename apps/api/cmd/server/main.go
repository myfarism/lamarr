package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/myfarism/lamarr-api/internal/handler"
	"github.com/myfarism/lamarr-api/internal/middleware"
	"github.com/myfarism/lamarr-api/internal/model"
	"github.com/myfarism/lamarr-api/pkg/database"
	"github.com/myfarism/lamarr-api/pkg/firebase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	database.Connect()
	firebase.Init()

	// Auto migrate semua model
	database.DB.AutoMigrate(
		&model.User{},
		&model.Job{},
		&model.JobTimeline{},
	)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://lamarr.vercel.app", // ← ganti dengan URL Vercel lo
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))


	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "lamarr-api"})
	})

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthRequired())
	{
		api.GET("/me", handler.GetMe)
		api.PATCH("/me/cv", handler.UpdateCV)

		// Job routes
		jobs := api.Group("/jobs")
		{
			jobs.GET("", handler.GetJobs)
			jobs.GET("/stats", handler.GetStats)
			jobs.GET("/:id", handler.GetJob)
			jobs.POST("", handler.CreateJob)
			jobs.PATCH("/:id", handler.UpdateJob)
			jobs.PATCH("/:id/status", handler.UpdateJobStatus)
			jobs.DELETE("/:id", handler.DeleteJob)
		}

		aiRoutes := api.Group("/ai")
		{
			aiRoutes.POST("/parse-job", handler.ParseJob)
			aiRoutes.POST("/scrape", handler.ScrapeJob)
			aiRoutes.POST("/analyze/:jobId", handler.AnalyzeJob)
			aiRoutes.POST("/follow-up/:jobId", handler.GenerateFollowUp)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Lamarr API running on port %s", port)
	r.Run(":" + port)
}

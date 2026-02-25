package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/myfarism/lamarr-api/internal/ai"
	"github.com/myfarism/lamarr-api/internal/service"
)

// POST /api/scrape

func ScrapeJob(c *gin.Context) {
    var input struct {
        URL string `json:"url" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    scraped, err := service.ScrapeJob(c.Request.Context(), input.URL)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Kirim RawText (bukan Description) supaya AI dapat data penuh
    sourceText := scraped.RawText
    if sourceText == "" {
        c.JSON(500, gin.H{"error": "No content scraped from URL"})
        return
    }

    parsed, err := ai.ParseJobDescription(c.Request.Context(), sourceText)
    if err != nil {
        c.JSON(500, gin.H{"error": "AI parsing failed: " + err.Error()})
        return
    }

    // Override dengan data scraper jika lebih reliable
    if scraped.Platform != "" {
        parsed.Platform = scraped.Platform
    }
    if scraped.Title != "" {
        parsed.Title = scraped.Title
    }

    c.JSON(200, gin.H{"data": parsed})
}


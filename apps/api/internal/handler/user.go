package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	// "github.com/myfarism/lamarr-api/internal/model"
)

func GetMe(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

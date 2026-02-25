package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/myfarism/lamarr-api/pkg/database"
	"github.com/myfarism/lamarr-api/pkg/firebase"
	"github.com/myfarism/lamarr-api/internal/model"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Missing or invalid Authorization header",
			})
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := firebase.AuthClient.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			return
		}

		// Cari atau buat user di database kita
		var user model.User
		result := database.DB.Where("firebase_uid = ?", token.UID).First(&user)
		if result.Error != nil {
			// User belum ada di DB kita, auto-create
			user = model.User{
				FirebaseUID: token.UID,
				Email:       token.Claims["email"].(string),
				Name:        getNameFromClaims(token.Claims),
			}
			database.DB.Create(&user)
		}

		c.Set("user", user)
		c.Set("firebase_uid", token.UID)
		c.Next()
	}
}

func getNameFromClaims(claims map[string]interface{}) string {
	if name, ok := claims["name"].(string); ok {
		return name
	}
	if email, ok := claims["email"].(string); ok {
		return email
	}
	return "Unknown"
}

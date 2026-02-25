package firebase

import (
	"context"
	"encoding/base64"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var AuthClient *auth.Client

func Init() {
	var opt option.ClientOption

	// Production: pakai env var
	// Development: pakai file JSON
	if credBase64 := os.Getenv("FIREBASE_CREDENTIALS_BASE64"); credBase64 != "" {
		credJSON, err := base64.StdEncoding.DecodeString(credBase64)
		if err != nil {
			log.Fatalf("Failed to decode Firebase credentials: %v", err)
		}
		opt = option.WithCredentialsJSON(credJSON)
	} else if _, err := os.Stat("firebase-service-account.json"); err == nil {
		opt = option.WithCredentialsFile("firebase-service-account.json")
	} else {
		log.Fatal("No Firebase credentials found. Set FIREBASE_CREDENTIALS_BASE64 or provide firebase-service-account.json")
	}

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("Failed to get Firebase Auth client: %v", err)
	}

	AuthClient = client
	log.Println("✅ Firebase Auth initialized")
}

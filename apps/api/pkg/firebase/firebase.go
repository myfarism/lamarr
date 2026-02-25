package firebase

import (
	"context"
	"log"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var AuthClient *auth.Client

func Init() {
	opt := option.WithCredentialsFile("firebase-service-account.json")

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

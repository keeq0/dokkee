package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/keeq0/dokkee/backend/internal/repository"
	"github.com/keeq0/dokkee/backend/internal/service"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("seed: no .env file, using environment variables")
	}

	username := os.Getenv("SUPER_ADMIN_USERNAME")
	password := os.Getenv("SUPER_ADMIN_PASSWORD")

	if username == "" || password == "" {
		log.Fatal("seed: SUPER_ADMIN_USERNAME and SUPER_ADMIN_PASSWORD must be set")
	}

	db, err := repository.NewPostgresDB(repository.Config{
		Host:     os.Getenv("POSTGRES_HOST"),
		Port:     os.Getenv("POSTGRES_PORT"),
		Username: os.Getenv("POSTGRES_USER"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		DBName:   os.Getenv("POSTGRES_DB"),
		SSLMode:  "disable",
	})
	if err != nil {
		log.Fatalf("seed: failed to connect to postgres: %v", err)
	}
	defer db.Close()

	authRepo := repository.NewAuthPostgres(db)
	authService := service.NewAuthService(authRepo)

	if err := authService.UpsertSuperAdmin(username, password); err != nil {
		log.Fatalf("seed: failed to upsert super admin: %v", err)
	}

	log.Printf("seed: super admin '%s' ready", username)
}

package config

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

var AwsConfig aws.Config

func LoadAwsConfig() {
	profile := os.Getenv("AWS_PROFILE")
	if profile == "" {
		profile = "default"
	}

	log.Printf("loading aws profile: '%s'", profile)
	awsConfig, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("Failed to load aws configuration: %v", err)
	}

	AwsConfig = awsConfig

	creds, err := AwsConfig.Credentials.Retrieve(context.TODO())
	if err != nil {
		log.Fatalf("Failed to load aws credentials: %v", err)
	}

	log.Printf("loaded aws configuration, access key: %s from %s", creds.AccessKeyID, creds.Source)
}

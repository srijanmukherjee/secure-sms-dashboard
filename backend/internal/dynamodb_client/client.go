package dynamodb_client

import (
	"backend/internal/config"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var client *dynamodb.Client = nil

func GetClient() *dynamodb.Client {
	if client == nil {
		client = dynamodb.NewFromConfig(config.AwsConfig)
	}

	return client
}

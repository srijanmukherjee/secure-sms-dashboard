package main

import (
	"backend/internal/config"
	"backend/internal/request_context"
	"backend/internal/service/connection_info"
	"backend/internal/util/lambda_util"
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func init() {
	config.LoadConfig()
	config.LoadAwsConfig()
}

func main() {
	lambda.Start(handler)
}

func handler(event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	connectionId := event.PathParameters["connectionId"]
	ctx := context.WithValue(context.Background(), request_context.RequestIdKey, event.RequestContext.RequestID)
	response, err := connection_info.GetConnectionInfo(ctx, connectionId)
	return lambda_util.HandleResponse(ctx, response, err)
}

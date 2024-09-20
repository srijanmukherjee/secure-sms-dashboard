package main

import (
	"backend/internal/config"
	"backend/internal/request_context"
	"backend/internal/service/pair_initiate"
	"backend/internal/util/lambda_util"
	"context"
	"encoding/json"

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
	var request pair_initiate.Request

	ctx := context.WithValue(context.Background(), request_context.RequestIdKey, event.RequestContext.RequestID)

	err := json.Unmarshal([]byte(event.Body), &request)
	if err != nil {
		return lambda_util.HandleError(ctx, err), nil
	}

	metadata := pair_initiate.Metadata{
		SourceIP:  event.RequestContext.Identity.SourceIP,
		UserAgent: event.RequestContext.Identity.UserAgent,
	}

	response, err := pair_initiate.Initiate(ctx, request, metadata)
	return lambda_util.HandleResponse(ctx, response, err)
}

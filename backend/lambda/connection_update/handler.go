package main

import (
	"backend/internal/config"
	"backend/internal/request_context"
	"backend/internal/service/connection_state"
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
	connectionId := event.PathParameters["connectionId"]
	ctx := context.WithValue(context.Background(), request_context.RequestIdKey, event.RequestContext.RequestID)

	var request connection_state.Request
	err := json.Unmarshal([]byte(event.Body), &request)
	if err != nil {
		return lambda_util.HandleError(ctx, err), nil
	}

	response, err := connection_state.UpdateConnectionState(ctx, connectionId, request)
	return lambda_util.HandleResponse(ctx, response, err)
}

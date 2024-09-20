package main

import (
	"backend/internal/config"
	"backend/internal/request_context"
	"backend/internal/service/add_sms"
	"backend/internal/util/lambda_util"
	"context"
	"encoding/json"
	"net/http"

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

	var request add_sms.Request
	err := json.Unmarshal([]byte(event.Body), &request)
	if err != nil {
		return lambda_util.HandleError(ctx, err), nil
	}

	err = add_sms.AddSms(ctx, connectionId, request)
	if err != nil {
		return lambda_util.HandleError(ctx, err), nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusCreated,
	}, nil
}

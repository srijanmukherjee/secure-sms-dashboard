package main

import (
	"backend/internal/config"
	"backend/internal/request_context"
	"backend/internal/service/get_sms"
	"backend/internal/util/lambda_util"
	"context"
	"strconv"

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
	beforeStr := event.QueryStringParameters["before"]
	afterStr := event.QueryStringParameters["after"]
	limitStr := event.QueryStringParameters["limit"]
	before := atoi(beforeStr, 0)
	after := atoi(afterStr, 0)
	limit := atoi(limitStr, 10)
	ctx := context.WithValue(context.Background(), request_context.RequestIdKey, event.RequestContext.RequestID)
	response, err := get_sms.GetSms(ctx, connectionId, before, after, limit)
	return lambda_util.HandleResponse(ctx, response, err)
}

func atoi(s string, defaultValue int64) int64 {
	if value, err := strconv.ParseInt(s, 10, 64); err == nil {
		return value
	}
	return defaultValue
}

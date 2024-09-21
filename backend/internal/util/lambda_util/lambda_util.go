package lambda_util

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/request_context"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func HandleResponse(ctx context.Context, returnValue interface{}, err error) (events.APIGatewayProxyResponse, error) {
	if err != nil {
		return HandleError(ctx, err), nil
	}

	jsonBytes, err := json.Marshal(map[string]interface{}{"data": returnValue, "statusCode": exception.STATUS_OK.Name})
	if err != nil {
		return HandleError(ctx, err), nil
	}

	response := events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers:    map[string]string{"Content-Type": "application/json", "X-Request-Id": ctx.Value(request_context.RequestIdKey).(string)},
		Body:       string(jsonBytes),
	}

	return response, nil
}

func HandleError(ctx context.Context, err error) events.APIGatewayProxyResponse {
	logger.Log(ctx, "Error: %v", err)

	if exc, ok := err.(exception.HttpException); ok {
		return handleHttpException(ctx, exc)
	}

	return handleHttpException(ctx, exception.HttpException{
		StatusCode: exception.STATUS_INTERNAL_SERVER_ERROR,
		Message:    "Internal Server Error",
	})
}

func handleHttpException(ctx context.Context, exc exception.HttpException) events.APIGatewayProxyResponse {
	logger.Log(ctx, "Status Code: %s Message: %s", exc.StatusCode.Name, exc.Message)

	requestId := ctx.Value(request_context.RequestIdKey).(string)
	data := map[string]string{
		"statusCode": exc.StatusCode.Name,
		"message":    exc.Message,
		"requestId":  requestId,
	}

	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: exception.STATUS_INTERNAL_SERVER_ERROR.Value,
			Headers:    map[string]string{"Content-Type": "application/json", "X-Request-Id": requestId},
			Body: fmt.Sprintf(
				`{ "statusCode": "%v", "message": "Something went wrong", "requestDd": "%v" }`,
				exception.STATUS_INTERNAL_SERVER_ERROR.Name,
				requestId),
		}
	}

	return events.APIGatewayProxyResponse{
		StatusCode: exc.StatusCode.Value,
		Headers:    map[string]string{"Content-Type": "application/json", "X-Request-Id": requestId},
		Body:       string(jsonBytes),
	}
}

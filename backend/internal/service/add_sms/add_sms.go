package add_sms

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/request_context"
	"context"
	"fmt"
	"time"
)

type Request struct {
	Payload string `json:"payload"`
}

func AddSms(ctx context.Context, connectionId string, request Request) error {
	logger.Log(ctx, "fetching connection context with connection id %s", connectionId)

	connectionContext, err := repository.GetConnectionContextByConnectionId(connectionId)
	if err != nil {
		logger.Log(ctx, "%v", err)

		if _, ok := err.(exception.DDBNotFoundException); ok {
			return exception.HttpException{
				StatusCode: exception.STATUS_NOT_FOUND,
				Message:    fmt.Sprintf("connection id %s does not exist", connectionId),
			}
		}

		return err
	}

	logger.Log(ctx, "fetched connection context with connection id %s", connectionId)

	ctx = context.WithValue(ctx, request_context.ConnectionIdKey, connectionContext.ConnectionId)

	timestamp := time.Now().Unix()
	smsEntity := model.SmsDDBEntity{
		ConnectionId: connectionId,
		Timestamp:    timestamp,
		Payload:      request.Payload,
	}

	logger.Log(ctx, "saving sms entity")
	if err = repository.SaveSms(smsEntity); err != nil {
		logger.Log(ctx, "%v", err)
		return err
	}
	logger.Log(ctx, "saved sms entity")

	return nil
}

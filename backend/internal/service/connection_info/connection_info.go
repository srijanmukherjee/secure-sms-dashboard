package connection_info

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/request_context"
	"context"
	"fmt"
)

func GetConnectionInfo(ctx context.Context, connectionId string) (model.ConnectionContext, error) {
	logger.Log(ctx, "fetching connection context with connection id %s", connectionId)

	connectionContext, err := repository.GetConnectionContextByConnectionId(connectionId)
	if err != nil {
		logger.Log(ctx, "%v", err)

		if _, ok := err.(exception.DDBNotFoundException); ok {
			return model.ConnectionContext{}, exception.HttpException{
				StatusCode: exception.STATUS_NOT_FOUND,
				Message:    fmt.Sprintf("connection id %s does not exist", connectionId),
			}
		}

		return model.ConnectionContext{}, err
	}

	logger.Log(ctx, "fetched connection context with connection id %s", connectionId)

	ctx = context.WithValue(ctx, request_context.ConnectionIdKey, connectionContext.ConnectionId)

	if !connectionContext.Paired {
		logger.Log(ctx, "connection not paired")
		return model.ConnectionContext{}, exception.HttpException{
			StatusCode: exception.STATUS_NOT_FOUND,
			Message:    fmt.Sprintf("connection id %s does not exist", connectionId),
		}
	}

	return connectionContext, nil
}

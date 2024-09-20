package unpair

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/repository"
	"context"
	"fmt"
)

type Response struct {
	ConnectionId string `json:"connectionId"`
}

func UnpairConnection(ctx context.Context, connectionId string) (Response, error) {
	logger.Log(ctx, "fetching connection context with connection id %s", connectionId)

	connectionContext, err := repository.GetConnectionContextByConnectionId(connectionId)
	if err != nil {
		logger.Log(ctx, "%v", err)

		if _, ok := err.(exception.DDBNotFoundException); ok {
			return Response{}, exception.HttpException{
				StatusCode: exception.STATUS_NOT_FOUND,
				Message:    fmt.Sprintf("connection id %s does not exist", connectionId),
			}
		}

		return Response{}, err
	}

	logger.Log(ctx, "fetched connection context with connection id %s", connectionId)

	if !connectionContext.Paired {
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    "connection is not paired",
		}
	}

	connectionContext.Paired = false
	if err = repository.SaveConnectionContext(connectionContext); err != nil {
		return Response{}, err
	}

	// TODO: send notification to client

	return Response{ConnectionId: connectionId}, nil
}

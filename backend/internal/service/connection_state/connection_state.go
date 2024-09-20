package connection_state

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/request_context"
	"context"
	"fmt"
)

type Request struct {
	State string `json:"state"`
}

type Response struct {
	ConnectionId string `json:"connectionId"`
	State        string `json:"state"`
}

func UpdateConnectionState(ctx context.Context, connectionId string, request Request) (Response, error) {
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

	ctx = context.WithValue(ctx, request_context.ConnectionIdKey, connectionContext.ConnectionId)

	if !connectionContext.Paired {
		logger.Log(ctx, "connection not paired")
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_NOT_FOUND,
			Message:    fmt.Sprintf("connection id %s does not exist", connectionId),
		}
	}

	if request.State != model.AGENT_STATE_ACTIVE && request.State != model.AGENT_STATE_INACTIVE {
		logger.Log(ctx, "invalid connection state: %s", request.State)
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    "invalid connection state",
		}
	}

	connectionContext.AgentState = request.State
	if err = repository.SaveConnectionContext(connectionContext); err != nil {
		return Response{}, err
	}

	// TODO: send notification to client

	return Response{
		ConnectionId: connectionId,
		State:        request.State,
	}, nil
}

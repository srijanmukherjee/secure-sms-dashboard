package pair_accept

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
	DeviceInfo          model.DeviceInfo `json:"deviceInfo"`
	SupportedAlgorithms []string         `json:"supportedAlgorithms"`
	AgentVersion        string           `json:"agentVersion"`
}

type Response struct {
	ConnectionId string `json:"connectionId"`
}

func AcceptPairingRequest(ctx context.Context, connectionId string, request Request) (Response, error) {
	pairingContext, err := repository.GetPairingContextByConnectionId(connectionId)
	if err != nil {
		logger.Log(ctx, "%v", err)
		if _, ok := err.(exception.DDBNotFoundException); ok {
			return Response{}, exception.HttpException{
				StatusCode: exception.STATUS_NOT_FOUND,
				Message:    fmt.Sprintf("pairing request with connection id %s not found", connectionId),
			}
		}

		return Response{}, err
	}

	ctx = context.WithValue(ctx, request_context.ConnectionIdKey, connectionId)

	if time.Now().Unix() >= pairingContext.TimeToLive {
		logger.Log(ctx, "TTL has been reached. Document will be deleted")
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_NOT_FOUND,
			Message:    fmt.Sprintf("pairing request with connection id %s not found", connectionId),
		}
	}

	if time.Now().Unix() >= pairingContext.ExpiresAt {
		return Response{}, exception.HttpException{
			StatusCode: exception.PAIRING_REQUEST_EXPIRED,
			Message:    "pairing request has expired",
		}
	}

	if pairingContext.Paired {
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    "already paired",
		}
	}

	connectionContext := model.ConnectionContext{
		ConnectionId: connectionId,
		AgentState:   model.AGENT_STATE_ACTIVE,
		Paired:       true,
		PairedAt:     time.Now().Unix(),
		AgentInfo: model.AgentInfo{
			SupportedAlgorithms: request.SupportedAlgorithms,
			Version:             request.AgentVersion,
			DeviceInfo:          request.DeviceInfo,
		},
	}

	pairingContext.Paired = true
	if err = repository.SavePairingContext(pairingContext); err != nil {
		logger.Log(ctx, "%v", err)
		return Response{}, err
	}

	if err = repository.SaveConnectionContext(connectionContext); err != nil {
		logger.Log(ctx, "%v", err)
		return Response{}, err
	}

	// TODO: send notification to client

	return Response{
		ConnectionId: connectionId,
	}, nil
}

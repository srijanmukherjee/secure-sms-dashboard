package pair_info

import (
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"fmt"
	"time"
)

type PairingContextResponse struct {
	ConnectionId        string           `json:"connectionId"`
	UserAgent           string           `json:"userAgent"`
	IPLocation          model.IPLocation `json:"location"`
	SupportedAlgorithms []string         `json:"supportedAlgorithms"`
	PublicKey           string           `json:"publicKey"`
	ExpiresAt           int64            `json:"expiresAt"`
	Paired              bool             `json:"paired"`
}

func GetPairInfo(ctx context.Context, connectionId string) (PairingContextResponse, error) {
	logger.Log(ctx, "fetching pair context with connection id %s", connectionId)

	pairingContext, err := repository.GetPairingContextByConnectionId(connectionId)
	if err != nil {
		logger.Log(ctx, "%v", err)

		if _, ok := err.(exception.DDBNotFoundException); ok {
			return PairingContextResponse{}, exception.HttpException{
				StatusCode: exception.STATUS_NOT_FOUND,
				Message:    fmt.Sprintf("pairing request with connection id %s not found", connectionId),
			}
		}

		return PairingContextResponse{}, err
	}

	logger.Log(ctx, "fetched pairing context with connection id %s", connectionId)

	if pairingContext.TimeToLive <= time.Now().Unix() {
		logger.Log(ctx, "TTL has been reached. Document will be deleted")
		return PairingContextResponse{}, exception.HttpException{
			StatusCode: exception.STATUS_NOT_FOUND,
			Message:    fmt.Sprintf("pairing request with connection id %s not found", connectionId),
		}
	}

	if pairingContext.ExpiresAt <= time.Now().Unix() {
		return PairingContextResponse{}, exception.HttpException{
			StatusCode: exception.PAIRING_REQUEST_EXPIRED,
			Message:    "pairing request has expired",
		}
	}

	responseDto := PairingContextResponse{
		ConnectionId:        pairingContext.ConnectionId,
		UserAgent:           pairingContext.UserAgent,
		PublicKey:           pairingContext.PublicKey,
		SupportedAlgorithms: pairingContext.SupportedAlgorithms,
		ExpiresAt:           pairingContext.ExpiresAt,
		IPLocation:          pairingContext.IPLocation,
		Paired:              pairingContext.Paired,
	}

	return responseDto, nil
}

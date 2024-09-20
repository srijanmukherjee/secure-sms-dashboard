package pair_initiate

import (
	"backend/internal/connector/location_resolver"
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/request_context"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
)

type Request struct {
	PublicKey           string   `json:"publicKey"`
	SupportedAlgorithms []string `json:"supportedAlgorithms"`
}

type Metadata struct {
	SourceIP  string
	UserAgent string
}

type Response struct {
	ConnectionId string `json:"connectionId"`
	ExpiresAt    int64  `json:"expiresAt"`
}

const (
	EXPIRY_TIME = time.Minute * 5
	TTL         = time.Minute * 30
)

func Initiate(ctx context.Context, request Request, metadata Metadata) (Response, error) {
	if request.PublicKey == "" {
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    "publicKey is missing",
		}
	}

	if len(request.SupportedAlgorithms) == 0 {
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    "supportedAlgorithms must not be empty",
		}
	}

	connectionId := uuid.NewString()
	sourceIpHash := hashIPAddress(metadata.SourceIP)

	pairingContext := model.PairingContext{
		ConnectionId:        connectionId,
		SourceIPHash:        sourceIpHash,
		UserAgent:           metadata.UserAgent,
		SupportedAlgorithms: request.SupportedAlgorithms,
		PublicKey:           request.PublicKey,
		Paired:              false,
		TimeToLive:          time.Now().Add(TTL).Unix(),
	}

	ctx = context.WithValue(ctx, request_context.ConnectionIdKey, connectionId)

	logger.Log(ctx, "fetching ip location")
	location, err := location_resolver.ResolveIPLocation(metadata.SourceIP)
	if err != nil {
		logger.Log(ctx, "failed to fetch ip location: %v", err)
	} else {
		logger.Log(ctx, "fetched ip location")
		pairingContext.IPLocation = location
	}

	pairingContext.ExpiresAt = time.Now().Add(EXPIRY_TIME).Unix()

	err = repository.SavePairingContext(pairingContext)
	if err != nil {
		logger.Log(ctx, "%v", err)
		return Response{}, exception.HttpException{
			StatusCode: exception.STATUS_INTERNAL_SERVER_ERROR,
			Message:    "failed to create pairing request",
		}
	}

	return Response{
		ConnectionId: connectionId,
		ExpiresAt:    pairingContext.ExpiresAt,
	}, nil
}

func hashIPAddress(ip string) string {
	h := sha1.New()
	h.Write([]byte(ip))
	return hex.EncodeToString(h.Sum(nil))
}

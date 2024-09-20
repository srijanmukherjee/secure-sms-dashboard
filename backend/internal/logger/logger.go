package logger

import (
	"backend/internal/request_context"
	"context"
	"fmt"
	"log"
)

func Log(context context.Context, format string, v ...any) {
	requestId := context.Value(request_context.RequestIdKey)
	optionalConnectionId := ""
	connectionId := context.Value(request_context.ConnectionIdKey)
	if value, ok := connectionId.(string); ok {
		optionalConnectionId = fmt.Sprintf(", Connection ID: %s", value)
	}

	log.Printf("Request ID: %s%s %v", requestId, optionalConnectionId, fmt.Sprintf(format, v...))
}

package main

import (
	"backend/internal/config"
	"backend/internal/exception"
	"backend/internal/logger"
	"backend/internal/request_context"
	"backend/internal/service/add_sms"
	"backend/internal/service/connection_info"
	"backend/internal/service/connection_state"
	"backend/internal/service/get_sms"
	"backend/internal/service/pair_accept"
	"backend/internal/service/pair_info"
	"backend/internal/service/pair_initiate"
	"backend/internal/service/unpair"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	config.LoadConfig()
	config.LoadAwsConfig()
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/pair/initiate", pairInitiate)
	mux.HandleFunc("/pair/connection/{connectionId}", getPairInfo)
	mux.HandleFunc("/pair/connection/{connectionId}/accept", acceptPairingRequest)
	mux.HandleFunc("/connection/{connectionId}", handleConnection)
	mux.HandleFunc("/unpair/{connectionId}", unpairConnection)
	mux.HandleFunc("/sms/{connectionId}", handleSms)

	log.Println("Started server at :8000")
	log.Fatal(http.ListenAndServe(":8000", mux))
}

func pairInitiate(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	if request.Method == "POST" {
		body, err := io.ReadAll(request.Body)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		var pairRequest pair_initiate.Request
		err = json.Unmarshal(body, &pairRequest)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		metadata := pair_initiate.Metadata{
			SourceIP:  os.Getenv("DEBUG_REQUEST_SOURCE_IP"),
			UserAgent: request.UserAgent(),
		}

		logger.Log(ctx, "initiating a new pairing request")
		response, err := pair_initiate.Initiate(ctx, pairRequest, metadata)
		if err == nil {
			logger.Log(ctx, "initiated new pairing request with connection ID %s", response.ConnectionId)
		}
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func getPairInfo(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	if request.Method == "GET" {
		connectionId := request.PathValue("connectionId")
		response, err := pair_info.GetPairInfo(ctx, connectionId)
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func acceptPairingRequest(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	if request.Method == "POST" {
		connectionId := request.PathValue("connectionId")

		body, err := io.ReadAll(request.Body)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		var acceptRequest pair_accept.Request
		err = json.Unmarshal(body, &acceptRequest)
		if err != nil {
			handleException(w, ctx, err)
			return
		}
		response, err := pair_accept.AcceptPairingRequest(ctx, connectionId, acceptRequest)
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func handleConnection(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	connectionId := request.PathValue("connectionId")

	if request.Method == "GET" {
		response, err := connection_info.GetConnectionInfo(ctx, connectionId)
		handleResponse(w, ctx, response, err)
	} else if request.Method == "POST" {
		body, err := io.ReadAll(request.Body)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		var stateUpdateRequesst connection_state.Request
		err = json.Unmarshal(body, &stateUpdateRequesst)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		response, err := connection_state.UpdateConnectionState(ctx, connectionId, stateUpdateRequesst)
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func handleSms(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	connectionId := request.PathValue("connectionId")

	if request.Method == "PUT" {
		addSmsRequest := add_sms.Request{}
		body, err := io.ReadAll(request.Body)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		err = json.Unmarshal(body, &addSmsRequest)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		err = add_sms.AddSms(ctx, connectionId, addSmsRequest)
		if err != nil {
			handleException(w, ctx, err)
			return
		}

		w.WriteHeader(200)
	} else if request.Method == "GET" {
		beforeStr := request.URL.Query().Get("before")
		afterStr := request.URL.Query().Get("after")
		limitStr := request.URL.Query().Get("limit")
		before := atoi(beforeStr, 0)
		after := atoi(afterStr, 0)
		limit := atoi(limitStr, 10)
		response, err := get_sms.GetSms(ctx, connectionId, before, after, limit)
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func unpairConnection(w http.ResponseWriter, request *http.Request) {
	requestId := uuid.NewString()
	ctx := context.WithValue(request.Context(), request_context.RequestIdKey, requestId)

	connectionId := request.PathValue("connectionId")

	if request.Method == "GET" {
		response, err := unpair.UnpairConnection(ctx, connectionId)
		handleResponse(w, ctx, response, err)
	} else {
		handleException(w, ctx, exception.HttpException{
			StatusCode: exception.STATUS_BAD_REQUEST,
			Message:    fmt.Sprintf("Method %s not supported", request.Method),
		})
	}
}

func handleResponse(w http.ResponseWriter, ctx context.Context, response interface{}, err error) {
	if err != nil {
		handleException(w, ctx, err)
		return
	}

	jsonBytes, err := json.Marshal(map[string]interface{}{
		"data":       response,
		"statusCode": exception.STATUS_OK.Name,
		"requestId":  ctx.Value(request_context.RequestIdKey),
	})

	if err != nil {
		handleException(w, ctx, err)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Header().Add("X-Request-Id", ctx.Value(request_context.RequestIdKey).(string))
	w.WriteHeader(exception.STATUS_OK.Value)
	w.Write(jsonBytes)
}

func handleException(w http.ResponseWriter, ctx context.Context, err error) {
	if exc, ok := err.(exception.HttpException); ok {
		logger.Log(ctx, "Status Code: %s Message: %s", exc.StatusCode.Name, exc.Message)
		handleHttpException(w, ctx, exc)
		return
	}

	logger.Log(ctx, "ERROR: %v", err)

	handleHttpException(w, ctx, exception.HttpException{
		StatusCode: exception.STATUS_INTERNAL_SERVER_ERROR,
		Message:    "Internal Server Error",
	})
}

func handleHttpException(w http.ResponseWriter, ctx context.Context, exc exception.HttpException) {
	requestId := ctx.Value(request_context.RequestIdKey).(string)
	data := map[string]string{
		"statusCode": exc.StatusCode.Name,
		"message":    exc.Message,
		"requestId":  requestId,
	}

	w.Header().Add("Content-Type", "application/json")
	w.Header().Add("X-Request-Id", requestId)

	jsonBytes, err := json.Marshal(data)
	if err != nil {
		w.WriteHeader(exception.STATUS_INTERNAL_SERVER_ERROR.Value)
		w.Write([]byte(
			fmt.Sprintf(`{ "statusCode": "%v", "message": "Something went wrong", "requestId": "%v" }`,
				exception.STATUS_INTERNAL_SERVER_ERROR.Name,
				requestId,
			)))
	}

	w.WriteHeader(exc.StatusCode.Value)
	w.Write(jsonBytes)
}

func atoi(s string, defaultValue int64) int64 {
	if value, err := strconv.ParseInt(s, 10, 64); err == nil {
		return value
	}
	return defaultValue
}

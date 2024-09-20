package exception

import "net/http"

type StatusCode struct {
	Name  string
	Value int
}

var (
	STATUS_OK                    = StatusCode{"OK", http.StatusOK}
	STATUS_BAD_REQUEST           = StatusCode{"BAD_REQUEST", http.StatusBadRequest}
	STATUS_INTERNAL_SERVER_ERROR = StatusCode{"INTERNAL_SERVER_ERROR", http.StatusInternalServerError}
	STATUS_NOT_FOUND             = StatusCode{"NOT_FOUND", http.StatusNotFound}
	PAIRING_REQUEST_EXPIRED      = StatusCode{Name: "PAIRING_REQUEST_EXPIRED", Value: http.StatusForbidden}
)

package get_sms

import (
	"backend/internal/exception"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
)

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50
const LIMIT_MULTIPLE = 5

func GetSms(ctx context.Context, connectionId string, before int64, after int64, limit int64) ([]model.Sms, error) {
	if limit%LIMIT_MULTIPLE != 0 {
		limit = LIMIT_MULTIPLE * (limit / LIMIT_MULTIPLE)
	}

	if limit < 0 {
		limit = DEFAULT_LIMIT
	}

	if limit > MAX_LIMIT {
		limit = MAX_LIMIT
	}

	if before == 0 && after == 0 {
		return repository.GetSmses(connectionId, int32(limit))
	} else if after != 0 {
		return repository.GetSmsesAfter(connectionId, after)
	} else if before != 0 {
		return repository.GetSmsesBefore(connectionId, int32(before), int32(limit))
	}

	return nil, exception.HttpException{
		StatusCode: exception.STATUS_BAD_REQUEST,
		Message:    "specify either 'before' or 'after' query parameter or none",
	}
}

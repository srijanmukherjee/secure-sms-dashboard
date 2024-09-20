package exception

import "fmt"

type HttpException struct {
	StatusCode StatusCode
	Message    string
}

func (e HttpException) Error() string {
	return fmt.Sprintf("HTTPException(statusCode: \"%v\", message: \"%v\")", e.StatusCode.Name, e.Message)
}

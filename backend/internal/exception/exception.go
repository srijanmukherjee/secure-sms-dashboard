package exception

type DDBNotFoundException struct {
	Table   string
	Message string
}

func (e DDBNotFoundException) Error() string {
	return e.Message
}

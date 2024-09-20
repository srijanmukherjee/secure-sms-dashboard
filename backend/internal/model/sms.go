package model

type SmsDDBEntity struct {
	ConnectionId string `json:"connectionId" dynamodbav:"connectionId"`
	Timestamp    int64  `json:"timestamp" dynamodbav:"timestamp"`
	Payload      string `json:"payload" dynamodbav:"payload"`
}

type Sms struct {
	Timestamp int64  `json:"timestamp" dynamodbav:"timestamp"`
	Payload   string `json:"payload" dynamodbav:"payload"`
}

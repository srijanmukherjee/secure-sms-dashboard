package model

const (
	AGENT_STATE_ACTIVE   = "SERVICE_ACTIVE"
	AGENT_STATE_INACTIVE = "SERVICE_INACTIVE"
)

type DeviceInfo struct {
	Brand   string `json:"brand" dynamodbav:"brand"`
	BuildId string `json:"buildId" dynamodbav:"buildId"`
	Name    string `json:"name" dynamodbav:"name"`
}

type AgentInfo struct {
	DeviceInfo          DeviceInfo `json:"deviceInfo" dynamodbav:"deviceInfo"`
	SupportedAlgorithms []string   `json:"supportedAlgorithms" dynamodbav:"supportedAlgorithms"`
	Version             string     `json:"version" dynamodbav:"version"`
}

type ConnectionContext struct {
	ConnectionId string    `json:"connectionId" dynamodbav:"connectionId"`
	AgentInfo    AgentInfo `json:"agentInfo" dynamodbav:"agentInfo"`
	AgentState   string    `json:"agentState" dynamodbav:"agentState"`
	Paired       bool      `json:"paired" dynamodbav:"paired"`
	PairedAt     int64     `json:"pairedAt" dynamodbav:"pairedAt"`
}

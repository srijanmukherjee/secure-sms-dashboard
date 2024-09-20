package model

type IPLocation struct {
	Continent     string `json:"continent" dynamodbav:"continent"`
	ContinentCode string `json:"continentCode" dynamodbav:"continentCode"`
	Country       string `json:"country" dynamodbav:"country"`
	CountryCode   string `json:"countryCode" dynamodbav:"countryCode"`
	Region        string `json:"region" dynamodbav:"region"`
	RegionName    string `json:"regionName" dynamodbav:"regionName"`
	City          string `json:"city" dynamodbav:"city"`
	Zip           string `json:"zip" dynamodbav:"zip"`
}

type PairingContext struct {
	ConnectionId        string     `json:"connectionId" dynamodbav:"connectionId"`
	SourceIPHash        string     `json:"sourceIP" dynamodbav:"sourceIP"`
	UserAgent           string     `json:"userAgent" dynamodbav:"userAgent"`
	IPLocation          IPLocation `json:"location" dynamodbav:"location"`
	SupportedAlgorithms []string   `json:"supportedAlgorithms" dynamodbav:"supportedAlgorithms"`
	PublicKey           string     `json:"publicKey" dynamodbav:"publicKey"`
	ExpiresAt           int64      `json:"expiresAt" dynamodbav:"expiresAt"`
	Paired              bool       `json:"paired" dynamodbav:"paired"`
	TimeToLive          int64      `dynamodbav:"ttl"`
}

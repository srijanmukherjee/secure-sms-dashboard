package repository

import (
	"backend/internal/config"
	"backend/internal/dynamodb_client"
	"backend/internal/exception"
	"backend/internal/model"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const PAIRINT_CONTEXT_PARTITION_KEY = "connectionId"

func GetPairingContextByConnectionId(connectionId string) (model.PairingContext, error) {
	client := dynamodb_client.GetClient()
	result, err := client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: &config.DDB_PAIRING_CONTEXT_TABLE,
		Key: map[string]types.AttributeValue{
			PAIRINT_CONTEXT_PARTITION_KEY: &types.AttributeValueMemberS{
				Value: connectionId,
			},
		},
	})

	if err != nil {
		return model.PairingContext{}, err
	}

	if len(result.Item) == 0 {
		return model.PairingContext{}, exception.DDBNotFoundException{
			Table:   config.DDB_PAIRING_CONTEXT_TABLE,
			Message: fmt.Sprintf("pairing context with connection id '%s' does not exist", connectionId),
		}
	}

	pairingContext := model.PairingContext{}
	err = attributevalue.UnmarshalMap(result.Item, &pairingContext)
	return pairingContext, err
}

func SavePairingContext(pairingContext model.PairingContext) error {
	client := dynamodb_client.GetClient()
	item, err := attributevalue.MarshalMap(pairingContext)
	if err != nil {
		return err
	}

	_, err = client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: &config.DDB_PAIRING_CONTEXT_TABLE,
		Item:      item,
	})

	return err
}

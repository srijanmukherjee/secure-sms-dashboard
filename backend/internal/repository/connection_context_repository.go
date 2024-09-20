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

const CONNECTION_CONTEXT_PARTITION_KEY = "connectionId"

func GetConnectionContextByConnectionId(connectionId string) (model.ConnectionContext, error) {
	client := dynamodb_client.GetClient()
	result, err := client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: &config.DDB_CONNECTION_CONTEXT_TABLE,
		Key: map[string]types.AttributeValue{
			CONNECTION_CONTEXT_PARTITION_KEY: &types.AttributeValueMemberS{
				Value: connectionId,
			},
		},
	})

	if err != nil {
		return model.ConnectionContext{}, err
	}

	if len(result.Item) == 0 {
		return model.ConnectionContext{}, exception.DDBNotFoundException{
			Table:   config.DDB_PAIRING_CONTEXT_TABLE,
			Message: fmt.Sprintf("connection context with connection id '%s' does not exist", connectionId),
		}
	}

	connectionContext := model.ConnectionContext{}
	err = attributevalue.UnmarshalMap(result.Item, &connectionContext)
	return connectionContext, err
}

func SaveConnectionContext(connectionContext model.ConnectionContext) error {
	client := dynamodb_client.GetClient()
	item, err := attributevalue.MarshalMap(connectionContext)
	if err != nil {
		return err
	}

	_, err = client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: &config.DDB_CONNECTION_CONTEXT_TABLE,
		Item:      item,
	})

	return err
}

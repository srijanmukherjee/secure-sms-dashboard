package repository

import (
	"backend/internal/config"
	"backend/internal/dynamodb_client"
	"backend/internal/model"
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

const (
	SMS_PARTITION_KEY = "connectionId"
	SMS_SORT_KEY      = "timestamp"
)

func SaveSms(sms model.SmsDDBEntity) error {
	client := dynamodb_client.GetClient()
	item, err := attributevalue.MarshalMap(sms)
	if err != nil {
		return err
	}

	_, err = client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: &config.DDB_CONNECTION_SMS_TABLE,
		Item:      item,
	})

	return err
}

func GetSmses(connectionId string, limit int32) ([]model.Sms, error) {
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(SMS_PARTITION_KEY).Equal(expression.Value(connectionId))).Build()
	if err != nil {
		return nil, err
	}

	return getSmses(expr, &limit)
}

func GetSmsesAfter(connectionId string, after int64) ([]model.Sms, error) {
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.KeyAnd(
			expression.Key(SMS_PARTITION_KEY).Equal(expression.Value(connectionId)),
			expression.Key(SMS_SORT_KEY).GreaterThan(expression.Value(after)),
		)).Build()
	if err != nil {
		return nil, err
	}

	return getSmses(expr, nil)
}

func GetSmsesBefore(connectionId string, before, limit int32) ([]model.Sms, error) {
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.KeyAnd(
			expression.Key(SMS_PARTITION_KEY).Equal(expression.Value(connectionId)),
			expression.Key(SMS_SORT_KEY).LessThan(expression.Value(before)),
		)).Build()
	if err != nil {
		return nil, err
	}

	return getSmses(expr, &limit)
}

func getSmses(expr expression.Expression, limit *int32) ([]model.Sms, error) {
	client := dynamodb_client.GetClient()
	result, err := client.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:                 &config.DDB_CONNECTION_SMS_TABLE,
		KeyConditionExpression:    expr.KeyCondition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ScanIndexForward:          aws.Bool(false),
		Limit:                     limit,
	})

	if err != nil {
		return nil, err
	}

	list := make([]model.Sms, len(result.Items))
	for i, item := range result.Items {
		entity := model.SmsDDBEntity{}
		err = attributevalue.UnmarshalMap(item, &entity)
		if err != nil {
			return nil, err
		}

		list[i] = model.Sms{
			Timestamp: entity.Timestamp,
			Payload:   entity.Payload,
		}
	}

	return list, nil
}

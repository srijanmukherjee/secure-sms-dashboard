import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import path = require('path');

interface BackendStackProps extends cdk.StackProps {
    lambdaEnvironment: {
        ipApiEndpoint: string;
        pusherAppId: string;
        pusherApiKey: string;
        pusherApiSecret: string;
        pusherCluster: string;
    },
    lambdaRootDirectory: string;
}

export class BackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props);

        // -----------------------------------------------------------
        // DYNAMODB TABLES
        // -----------------------------------------------------------

        const pairingContextTable = new dynamodb.TableV2(this, 'PairingContext', {
            partitionKey: {
                type: dynamodb.AttributeType.STRING,
                name: 'connectionId'
            },
            timeToLiveAttribute: 'ttl'
        });

        const connectionContextTable = new dynamodb.TableV2(this, 'ConnectionContext', {
            partitionKey: {
                type: dynamodb.AttributeType.STRING,
                name: 'connectionId'
            }
        });

        const connectionSmsTable = new dynamodb.TableV2(this, 'ConnectionSms', {
            partitionKey: {
                type: dynamodb.AttributeType.STRING,
                name: 'connectionId'
            },
            sortKey: {
                type: dynamodb.AttributeType.NUMBER,
                name: 'timestamp'
            }
        });

        // -----------------------------------------------------------
        // LAMBDA FUNCTIONS
        // -----------------------------------------------------------

        const lambdaEnvironment = {
            DDB_PAIRING_CONTEXT_TABLE: pairingContextTable.tableName,
            DDB_CONNECTION_CONTEXT_TABLE: connectionContextTable.tableName,
            DDB_CONNECTION_SMS_TABLE: connectionSmsTable.tableName,
            IP_API_ENDPOINT: props.lambdaEnvironment.ipApiEndpoint,
            PUSHER_APP_ID: props.lambdaEnvironment.pusherAppId,
            PUSHER_API_KEY: props.lambdaEnvironment.pusherApiKey,
            PUSHER_API_SECRET: props.lambdaEnvironment.pusherApiSecret,
            PUSHER_CLUSTER: props.lambdaEnvironment.pusherCluster
        };

        const pairInitiateFunction = new lambda.Function(this, 'PairInitiate', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'pair_initiate.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const pairAcceptFunction = new lambda.Function(this, 'PairAccept', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'pair_accept.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const pairInfoFunction = new lambda.Function(this, 'PairInfo', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'pair_info.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const unpairFunction = new lambda.Function(this, 'Unpair', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'unpair.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const connectionInfoFunction = new lambda.Function(this, 'ConnectionInfo', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'connection_info.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const connectionUpdateFunction = new lambda.Function(this, 'ConnectionUpdate', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'connection_update.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const smsListFunction = new lambda.Function(this, 'SmsList', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'sms_list.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        const smsAddFunction = new lambda.Function(this, 'SmsAdd', {
            runtime: lambda.Runtime.PROVIDED_AL2023,
            code: lambda.Code.fromAsset(path.join(props.lambdaRootDirectory, 'sms_add.zip')),
            handler: 'hello.handler',
            environment: lambdaEnvironment
        });

        // -----------------------------------------------------------
        // GRANT DDB ACCESS TO LAMBDAS
        // -----------------------------------------------------------

        const tables = [pairingContextTable, connectionContextTable, connectionSmsTable];
        const functions = [pairInitiateFunction, pairInfoFunction, pairAcceptFunction, connectionInfoFunction, connectionUpdateFunction, unpairFunction, smsListFunction, smsAddFunction];

        for (const table of tables) {
            functions.forEach(func => {
                table.grantReadData(func);
                table.grantWriteData(func);
            });
        }

        // -----------------------------------------------------------
        // API GATEWAY
        // -----------------------------------------------------------

        const api = new apigateway.RestApi(this, 'sms-dashboard-api', {
            description: 'backend api endpoints for sms dashboard',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
            }
        });

        const pairingEndpoint = api.root.addResource('pair');
        const pairingConnectionEndpoint = pairingEndpoint.addResource('connection');
        const pairingConnectionIdEndpoint = pairingConnectionEndpoint.addResource('{connectionId}');

        pairingEndpoint
            .addResource('initiate')
            .addMethod('POST', new apigateway.LambdaIntegration(pairInitiateFunction));
        pairingConnectionIdEndpoint.addMethod('GET', new apigateway.LambdaIntegration(pairInfoFunction));
        pairingConnectionIdEndpoint
            .addResource('accept')
            .addMethod('POST', new apigateway.LambdaIntegration(pairAcceptFunction));

        const unpairEndpoint = api.root.addResource('unpair');
        unpairEndpoint
            .addResource('{connectionId}')
            .addMethod('GET', new apigateway.LambdaIntegration(unpairFunction));

        const connectionEndpoint = api.root.addResource('connection');
        const connectionWithIdEndpoint = connectionEndpoint.addResource('{connectionId}');
        connectionWithIdEndpoint.addMethod('GET', new apigateway.LambdaIntegration(connectionInfoFunction));
        connectionWithIdEndpoint.addMethod('POST', new apigateway.LambdaIntegration(connectionUpdateFunction));

        const smsEndpoint = api.root.addResource('sms');
        const smsWithConnectionIdEndpoint = smsEndpoint.addResource('{connectionId}');
        smsWithConnectionIdEndpoint.addMethod('GET', new apigateway.LambdaIntegration(smsListFunction));
        smsWithConnectionIdEndpoint.addMethod('POST', new apigateway.LambdaIntegration(smsAddFunction));
    }
}
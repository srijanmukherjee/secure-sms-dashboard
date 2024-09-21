#!/usr/bin/env node
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import env from '../util/env';

dotenv.config({
  path: '.env',
});

const app = new cdk.App();
new BackendStack(app, 'BackendStack', {
  lambdaEnvironment: {
    ipApiEndpoint: env('IP_API_ENDPOINT'),
    pusherAppId: env('PUSHER_APP_ID'),
    pusherApiKey: env('PUSHER_API_KEY'),
    pusherApiSecret: env('PUSHER_API_SECRET'),
    pusherCluster: env('PUSHER_CLUSTER')
  },
  lambdaRootDirectory: env('LAMBDA_ROOT_DIRECTORY'),
});
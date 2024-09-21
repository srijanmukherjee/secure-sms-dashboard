#!/usr/bin/env bash

BACKEND_DIRECTORY=../backend
export LAMBDA_ROOT_DIRECTORY=$BACKEND_DIRECTORY/dist

if [[ -z $AWS_PROFILE ]]; then
    AWS_PROFILE=default
fi

CDK_SYNTH_LOG_FILE=template.yaml

set -e

pushd $BACKEND_DIRECTORY
make -B
popd

npm run build
cdk synth | tee $CDK_SYNTH_LOG_FILE
cdk deploy --profile $AWS_PROFILE

set +e
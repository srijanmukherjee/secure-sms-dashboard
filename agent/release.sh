#!/usr/bin/env bash

#########################################################################
# Guide:                                                                #
# https://reactnative.dev/docs/signed-apk-android?package-manager=yarn  #
#                                                                       #
# Generate AAB:                                                         #
# npx react-native build-android --mode=release                         #
#########################################################################

set -e

GRADLE_PROPERTIES_FILE=~/.gradle/gradle.properties
KEY_STORE_NAME=agent.keystore
KEY_STORE=android/app/$KEY_STORE_NAME
KEY_ALIAS=agent-key
KEY_SIZE=2048
KEY_VALIDITY=10000 # Days

# Key store password must be atleast 6 characters long
KEY_STORE_PASSWORD=password
KEY_PASSWORD=$KEY_STORE_PASSWORD

set_gradle_property() {
    local file=$1
    local key=$2
    local value=$3

    if grep -q "^${key}=" "$file"; then
        sed -i "" "s/^${key}=.*/${key}=${value}/" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

if [ ! -d "android" ] || [ ! -e "package.json" ]; then
    echo "Error: execute this script from react native root directory"
    exit 1
fi

(set -x; yarn install)

(set -x; rm -f $KEY_STORE)

(set -x; sudo keytool -genkey -v -keystore $KEY_STORE -alias $KEY_ALIAS -keyalg RSA -keysize $KEY_SIZE -validity $KEY_VALIDITY)

(set -x; set_gradle_property $GRADLE_PROPERTIES_FILE AGENT_APP_STORE_FILE $KEY_STORE_NAME)
(set -x; set_gradle_property $GRADLE_PROPERTIES_FILE AGENT_APP_KEY_ALIAS $KEY_ALIAS)
(set -x; set_gradle_property $GRADLE_PROPERTIES_FILE AGENT_APP_STORE_PASSWORD $KEY_STORE_PASSWORD)
(set -x; set_gradle_property $GRADLE_PROPERTIES_FILE AGENT_APP_KEY_PASSWORD $KEY_PASSWORD)

(set -x; npx react-native build-android --mode=release)

import {Route} from '@react-navigation/native';
import React from 'react';
import {StatusBar, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

type RouteParams = {
  connectionId: string;
};

type Props = {
  route: Route<'flow.pairing', RouteParams>;
};

export function PairingScreen({route}: Props) {
  return (
    <SafeAreaView>
      <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
      <Text>{route.params.connectionId}</Text>
    </SafeAreaView>
  );
}

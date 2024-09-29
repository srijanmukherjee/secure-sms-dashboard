import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PermissionBoundary} from './components/permission-boundary';
import {requiredPermissions} from './config/permissions';
import {RequestPermissionScreen} from './screens/request-permission-screen';
import {DisconnectedHomeScreen} from './screens/disconnected-home-screen';
import {createNativeStackNavigator, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NavigationContainer, NavigationProp} from '@react-navigation/native';
import {QrCodeScannerScreen} from './screens/qr-code-scanner-screen';
import {PairingScreen} from './screens/pairing-screen';

type ScreenNames = ['flow.disconnected.home', 'flow.disconnected.scan'];
export type RootStackParamList = Record<ScreenNames[number], undefined> & {
  'flow.pairing': {
    connectionId: string;
  };
};
export type StackNavigation = NavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const stackNavigatorOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <PermissionBoundary requests={requiredPermissions} fallback={RequestPermissionScreen}>
          <Stack.Navigator initialRouteName="flow.disconnected.home" screenOptions={stackNavigatorOptions}>
            <Stack.Screen name="flow.disconnected.home" component={DisconnectedHomeScreen} />
            <Stack.Screen name="flow.disconnected.scan" component={QrCodeScannerScreen} />
            <Stack.Screen name="flow.pairing" component={PairingScreen} />
          </Stack.Navigator>
        </PermissionBoundary>
      </View>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

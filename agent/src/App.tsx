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
import {ConnectionContextProvider} from './context/connection-context';
import {buildSqliteDatabase} from './database/sqlite';
import {DatabaseContextProvider} from './context/database-context';
import {ConnectedHomeScreen} from './screens/connected-home-screen';

type ScreenNames = ['flow.disconnected.home', 'flow.disconnected.scan', 'flow.connected.home'];
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

const databaseProvider = () => buildSqliteDatabase();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <PermissionBoundary requests={requiredPermissions} fallback={RequestPermissionScreen}>
          <DatabaseContextProvider provider={databaseProvider}>
            <ConnectionContextProvider disconnected={<DisconnectedNavigator />} connected={<ConnectedNavigator />} />
          </DatabaseContextProvider>
        </PermissionBoundary>
      </View>
    </NavigationContainer>
  );
}

function DisconnectedNavigator() {
  return (
    <Stack.Navigator initialRouteName="flow.disconnected.home" screenOptions={stackNavigatorOptions}>
      <Stack.Screen name="flow.disconnected.home" component={DisconnectedHomeScreen} />
      <Stack.Screen name="flow.disconnected.scan" component={QrCodeScannerScreen} />
      <Stack.Screen name="flow.pairing" component={PairingScreen} />
    </Stack.Navigator>
  );
}

function ConnectedNavigator() {
  return (
    <Stack.Navigator initialRouteName="flow.connected.home" screenOptions={stackNavigatorOptions}>
      <Stack.Screen name="flow.connected.home" component={ConnectedHomeScreen} />
    </Stack.Navigator>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

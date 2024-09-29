import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';

import {PermissionBoundary} from './components/permission-boundary';
import {requiredPermissions} from './config/permissions';
import {RequestPermissionScreen} from './screens/request-permission-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DisconnectedHomeScreen} from './screens/disconnected-home-screen';
import {createNativeStackNavigator, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const stackNavigatorOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={'transparent'} translucent animated barStyle={'dark-content'} />
        <PermissionBoundary requests={requiredPermissions} fallback={RequestPermissionScreen}>
          <Stack.Navigator initialRouteName="flow.disconnected.home" screenOptions={stackNavigatorOptions}>
            <Stack.Screen name="flow.disconnected.home" component={DisconnectedHomeScreen} />
          </Stack.Navigator>
        </PermissionBoundary>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

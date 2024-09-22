import React from 'react';
import {StatusBar} from 'react-native';

import {PermissionBoundary} from './components/permission-boundary';
import {requiredPermissions} from './config/permissions';
import {RequestPermissionScreen} from './screens/request-permission-screen';
import {SafeAreaView} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar backgroundColor={'transparent'} translucent animated barStyle={'dark-content'} />
      <PermissionBoundary requests={requiredPermissions} fallback={RequestPermissionScreen}>
        {null}
      </PermissionBoundary>
    </SafeAreaView>
  );
}

export default App;

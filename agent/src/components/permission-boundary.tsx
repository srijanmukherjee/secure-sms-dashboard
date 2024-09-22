import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {Permission, PermissionsAndroid, PermissionStatus} from 'react-native';
import {PermissionFallbackFC, PermissionRequest} from '../types/permission-request';

type Props = {
  requests: PermissionRequest[];
  children: ReactNode;
  fallback: PermissionFallbackFC;
};

export function PermissionBoundary({requests, children, fallback}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{[key in Permission]: PermissionStatus}>();
  const Fallback = fallback;

  const requestPermission = useCallback(() => {
    PermissionsAndroid.requestMultiple(requests.map(request => request.permission))
      .then(setPermissionStatus)
      .finally(() => setLoaded(true));
  }, [requests]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  if (!loaded) {
    return null;
  }

  if (!permissionStatus) {
    throw new Error('Permission status is undefined');
  }

  for (const request of requests) {
    const status = permissionStatus[request.permission];
    if (status !== 'granted') {
      return <Fallback request={request} status={status} requestPermission={requestPermission} />;
    }
  }

  return children;
}

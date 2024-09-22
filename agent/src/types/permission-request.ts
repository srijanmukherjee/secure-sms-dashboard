import {Permission} from 'react-native';

export type PermissionRequest = {
  permission: Permission;
  name: string;
  reason: string;
};

export type PermissionFallbackProps = {
  request: PermissionRequest;
  status: 'denied' | 'never_ask_again';
  requestPermission: () => void;
};

export type PermissionFallbackFC = React.FC<PermissionFallbackProps>;

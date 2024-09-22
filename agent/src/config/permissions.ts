import {PermissionRequest} from '../types/permission-request';

export const requiredPermissions: PermissionRequest[] = [
  {
    permission: 'android.permission.READ_SMS',
    name: 'Read SMS',
    reason: 'We need access to your SMS messages so you can securely view them from your dashboard',
  },
  {
    permission: 'android.permission.RECEIVE_SMS',
    name: 'Receive SMS',
    reason: 'We need access to receive your SMS even when the app is not running so that we can automatically push the sms to your dashboard when they arrive',
  },
  {
    permission: 'android.permission.CAMERA',
    name: 'Camera',
    reason: 'We need access to your camera to scan QR codes',
  },
];

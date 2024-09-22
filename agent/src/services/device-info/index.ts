import {DeviceInfo} from 'common';
import {getBaseOs, getBrand, getBuildId, getDeviceName, getVersion} from 'react-native-device-info';

export class DeviceInfoService {
  public static async getBaseOs(): Promise<string> {
    return getBaseOs();
  }

  public static async getBrand(): Promise<string> {
    return getBrand();
  }

  public static async getDeviceName(): Promise<string> {
    return getDeviceName();
  }

  public static async getBuildId(): Promise<string> {
    return getBuildId();
  }

  public static getVersion(): string {
    return getVersion();
  }

  public static async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      brand: await DeviceInfoService.getBrand(),
      name: await DeviceInfoService.getDeviceName(),
      buildId: await DeviceInfoService.getBuildId(),
    };
  }
}

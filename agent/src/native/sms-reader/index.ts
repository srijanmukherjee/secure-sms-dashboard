import {NativeModules} from 'react-native';

type Sms = {
  id: number;
  address: string | null;
  body: string;
  date: number;
  date_sent: number;
  error_code: number;
  locked: boolean;
  person: string;
  protocol: number;
  read: boolean;
  reply_path_present: boolean;
  seen: boolean;
  service_center: string | null;
  subject: string | null;
  thread_id: string | null;
  subscription_id: string | null;
  type: number;
  status: number;
};

type SuccessCallback = (smsList: Sms[]) => void;
type ErrorCallback = (error: string) => void;

type SmsModule = {
  list: (index: number, limit: number, onSuccess: SuccessCallback, onError: ErrorCallback) => void;
};

const SmsModule = NativeModules.SmsModule as SmsModule;

export const UNLIMITED = -1;

export async function listSms(startIndex: number, limit: number): Promise<Sms[]> {
  return new Promise((resolve, reject) => {
    SmsModule.list(startIndex, limit, resolve, error => reject(new Error(error)));
  });
}

export async function listAllSms(): Promise<Sms[]> {
  return listSms(0, UNLIMITED);
}

declare module 'react-native-get-sms-android' {
  type Sms = {
    _id: number;
    _thread_id: number;
    address: string;
    date: number;
    date_sent: number;
    protocol: number;
    read: boolean;
    status: number;
    type: number;
    reply_path_present: boolean;
    body: string;
    locked: boolean;
    sub_id: number;
    error_code: number;
    creator: string;
    seen: boolean;
  };

  type OnErrorFunction = (error: Error) => void;
  type OnSuccessFunction = (count: number, list: Sms[]) => void;
  function list(filters: string, onError: OnErrorFunction, onSuccess: OnSuccessFunction);
}

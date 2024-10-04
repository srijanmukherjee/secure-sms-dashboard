import {Exception} from 'common';
import {DependencyList, useEffect, useState} from 'react';

export function useApi<ReturnType>(apiCall: () => Promise<ReturnType>, deps: DependencyList): [boolean, ReturnType, Exception | null] {
  const [loading, setLoading] = useState<boolean>(true);
  const [exception, setException] = useState<Exception | null>(null);
  const [data, setData] = useState<ReturnType>();

  const handleError = (reason: any) => {
    if (reason instanceof Exception) {
      setException(reason);
    } else if (reason instanceof Error) {
      setException(new Exception(reason.message, reason));
    } else if (typeof reason === 'string') {
      setException(new Exception(reason));
    } else {
      setException(new Exception('unknown exception'));
    }
  };

  useEffect(() => {
    setLoading(true);
    apiCall()
      .then(setData)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [loading, data as ReturnType, exception];
}

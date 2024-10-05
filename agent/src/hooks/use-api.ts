import {Exception} from 'common';
import {DependencyList, useEffect, useState} from 'react';
import {translateError} from 'src/util/translators';

export function useApi<ReturnType>(apiCall: () => Promise<ReturnType>, deps: DependencyList): [boolean, ReturnType, Exception | null] {
  const [loading, setLoading] = useState<boolean>(true);
  const [exception, setException] = useState<Exception | null>(null);
  const [data, setData] = useState<ReturnType>();

  const handleError = (error: unknown) => setException(translateError(error));

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

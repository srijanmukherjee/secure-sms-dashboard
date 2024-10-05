import {ConnectionInfoResponse, Exception, getConnectionInfo} from 'common';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {Text} from 'react-native';
import {client} from 'src/api';
import {translateError} from 'src/util/translators';
import {useRepository} from './database-context';
import {ConnectionModel} from 'src/models';

type Props = {
  connected: React.ReactNode;
  disconnected: React.ReactNode;
};

type ConnectionContext = {
  connectionInfo: ConnectionModel | null;
  setConnectionInfo: React.Dispatch<Partial<ConnectionModel> | null>;
};

const ConnectionContext = createContext<ConnectionContext>({} as ConnectionContext);

export function useConnectionContext() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectionContext called outside of ConnectionContextProvider');
  }
  return context;
}

export function useConnectedContext(): [ConnectionInfoResponse, React.Dispatch<ConnectionInfoResponse | null>] {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectedContext called outside of ConnectionContextProvider');
  }
  return [context.connectionInfo as ConnectionInfoResponse, context.setConnectionInfo];
}

function isCompleteConnectionInfo(connectionInfo: Partial<ConnectionModel>) {
  return (
    connectionInfo.connectionId !== undefined &&
    connectionInfo.agentInfo !== undefined &&
    connectionInfo.agentState !== undefined &&
    connectionInfo.paired !== undefined &&
    connectionInfo.pairedAt !== undefined
  );
}

export function ConnectionContextProvider({connected, disconnected}: Props) {
  const contextRepository = useRepository('ContextRepository');
  const connectionRepository = useRepository('ConnectionRepository');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionModel | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [exception, setException] = useState<Exception | null>(null);

  const loadConnectionInfo = async (connectionId: string) => {
    setLoading(true);
    setException(null);

    try {
      const response = await getConnectionInfo(client, connectionId);
      const connectionModel: ConnectionModel = response;
      await connectionRepository.addOne(connectionModel);
      setConnectionInfo(connectionModel);
    } catch (ex) {
      setException(translateError(ex));
    } finally {
      setLoading(false);
    }
  };

  const setConnectionInfoProxy = (partialConnectionInfo: Partial<ConnectionModel> | null) => {
    if (partialConnectionInfo && partialConnectionInfo.connectionId && !isCompleteConnectionInfo(partialConnectionInfo)) {
      loadConnectionInfo(partialConnectionInfo.connectionId);
    } else if (partialConnectionInfo === null || isCompleteConnectionInfo(partialConnectionInfo)) {
      setConnectionInfo(partialConnectionInfo as ConnectionInfoResponse | null);
    } else {
      throw new Error('connection info does not have all the required fields');
    }
  };

  useEffect(() => {
    Promise.all([contextRepository.fetchById('active_connection_id'), contextRepository.fetchById('encryption_key')])
      .then(async ([activeConnectionId, encryptionKey]) => {
        if (activeConnectionId === null || encryptionKey === null) {
          return;
        }

        setConnectionInfo(await connectionRepository.fetchById(activeConnectionId.value));
      })
      .catch(err => setException(translateError(err)))
      .finally(() => setLoading(false));
  }, [contextRepository, connectionRepository]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (exception) {
    return <Text>{exception.message}</Text>;
  }

  return (
    <ConnectionContext.Provider value={{connectionInfo, setConnectionInfo: setConnectionInfoProxy}}>
      {connectionInfo === null ? disconnected : connected}
    </ConnectionContext.Provider>
  );
}

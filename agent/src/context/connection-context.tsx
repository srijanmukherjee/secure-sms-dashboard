import {ConnectionInfoResponse, Exception, getConnectionInfo} from 'common';
import React, {createContext, useContext, useState} from 'react';
import {Text} from 'react-native';
import {client} from 'src/api';
import {translateError} from 'src/util/translators';

type Props = {
  connected: React.ReactNode;
  disconnected: React.ReactNode;
};

type ConnectionContext = {
  connectionInfo: ConnectionInfoResponse | null;
  setConnectionInfo: React.Dispatch<Partial<ConnectionInfoResponse> | null>;
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

function isCompleteConnectionInfo(connectionInfo: Partial<ConnectionInfoResponse>) {
  return (
    connectionInfo.connectionId !== undefined &&
    connectionInfo.agentInfo !== undefined &&
    connectionInfo.agentState !== undefined &&
    connectionInfo.paired !== undefined &&
    connectionInfo.pairedAt !== undefined
  );
}

export function ConnectionContextProvider({connected, disconnected}: Props) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfoResponse | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [exception, setException] = useState<Exception | null>(null);

  const loadConnectionInfo = async (connectionId: string) => {
    setLoading(true);
    setException(null);

    try {
      const response = await getConnectionInfo(client, connectionId);
      setConnectionInfo(response);
    } catch (ex) {
      setException(translateError(ex));
    } finally {
      setLoading(false);
    }
  };

  const setConnectionInfoProxy = (partialConnectionInfo: Partial<ConnectionInfoResponse> | null) => {
    if (partialConnectionInfo && partialConnectionInfo.connectionId && !isCompleteConnectionInfo(partialConnectionInfo)) {
      loadConnectionInfo(partialConnectionInfo.connectionId);
    } else if (partialConnectionInfo === null || isCompleteConnectionInfo(partialConnectionInfo)) {
      setConnectionInfo(partialConnectionInfo as ConnectionInfoResponse | null);
    } else {
      throw new Error('connection info does not have all the required fields');
    }
  };

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

import React, {createContext, useContext, useState} from 'react';
import {ConnectionInfo} from 'src/types/connection-info';

type Props = {
  connected: React.ReactNode;
  disconnected: React.ReactNode;
};

type ConnectionContext = {
  connectionInfo: ConnectionInfo | null;
  setConnectionInfo: React.Dispatch<ConnectionInfo | null>;
};

const ConnectionContext = createContext<ConnectionContext>({} as ConnectionContext);

export function useConnectionContext() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectionContext called outside of ConnectionContextProvider');
  }
  return context;
}

export function useConnectedContext(): [ConnectionInfo, React.Dispatch<ConnectionInfo | null>] {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectedContext called outside of ConnectionContextProvider');
  }
  return [context.connectionInfo as ConnectionInfo, context.setConnectionInfo];
}

export function ConnectionContextProvider({connected, disconnected}: Props) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);

  return <ConnectionContext.Provider value={{connectionInfo, setConnectionInfo}}>{connectionInfo === null ? disconnected : connected}</ConnectionContext.Provider>;
}

import {Database} from '..';
import SQLite from 'react-native-sqlite-storage';
import {buildConnectionRepository} from './connection-repository';
import {buildContextRepository} from './context-repository';

SQLite.enablePromise(true);

export async function buildSqliteDatabase(databaseName: string = 'agent.db'): Promise<Database> {
  const database = await SQLite.openDatabase({name: databaseName});

  return {
    ConnectionRepository: await buildConnectionRepository(database),
    ContextRepository: await buildContextRepository(database),
  };
}

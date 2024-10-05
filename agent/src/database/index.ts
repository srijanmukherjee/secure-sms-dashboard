import {ConnectionRepository} from 'src/repository/connection-repository';
import {ContextRepository} from 'src/repository/context-repository';

export type Database = {
  ConnectionRepository: ConnectionRepository;
  ContextRepository: ContextRepository;
};

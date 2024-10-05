import {ConnectionModel} from 'src/models';
import {BaseRepository} from './base-repository';

export abstract class ConnectionRepository extends BaseRepository<ConnectionModel, string> {}

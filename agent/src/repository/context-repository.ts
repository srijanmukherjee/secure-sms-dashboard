import {ContextModel} from 'src/models';
import {BaseRepository} from './base-repository';

export abstract class ContextRepository extends BaseRepository<ContextModel, string> {
  abstract upsertOne: (model: ContextModel) => Promise<void>;
}

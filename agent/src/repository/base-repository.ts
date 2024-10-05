export type Optional<T> = T | null;

export abstract class BaseRepository<Model, Id> {
  abstract fetchById: (id: Id) => Promise<Optional<Model>>;
  abstract fetchAll: () => Promise<Model[]>;
  abstract addOne: (model: Model) => Promise<void>;
  abstract deleteById: (id: Id) => Promise<void>;
  abstract updateById: (id: Id, model: Model) => Promise<void>;
}

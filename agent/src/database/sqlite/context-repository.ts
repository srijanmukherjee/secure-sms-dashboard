import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {ContextModel} from 'src/models';
import {ContextRepository} from 'src/repository/context-repository';

export async function buildContextRepository(db: SQLiteDatabase, tableName = 'appContext'): Promise<ContextRepository> {
  const primaryKey = 'key';
  const columns = 'key, value';
  const insertPlaceholders = columns
    .split(',')
    .map(_ => '?')
    .join(',');

  await db.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

  console.debug(`Sqlite: initialized table ${tableName}`);

  return {
    fetchById: async (id: string) => {
      const resultSets = await db.executeSql(`SELECT ${columns} FROM ${tableName} WHERE ${primaryKey} = ?`, [id]);
      for (const result of resultSets) {
        if (result.rows.length > 0) {
          return result.rows.item(0) as ContextModel;
        }
      }
      return null;
    },
    fetchAll: async () => {
      const items: ContextModel[] = [];
      const resultSets = await db.executeSql(`SELECT ${columns} FROM ${tableName}`);
      for (const result of resultSets) {
        for (let i = 0; i < result.rows.length; i++) {
          items.push(result.rows.item(i) as ContextModel);
        }
      }
      return items;
    },
    addOne: async (model: ContextModel) => {
      await db.executeSql(`INSERT INTO ${tableName} (${columns}) VALUES (${insertPlaceholders})`, [model.key, model.value]);
    },
    deleteById: async (id: string) => {
      await db.executeSql(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [id]);
    },
    updateById: async (id: string, model: ContextModel) => {
      await db.executeSql(`UPDATE ${tableName} SET value = ? WHERE ${primaryKey} = ?`, [model.key, id]);
    },
    upsertOne: async (model: ContextModel) => {
      await db.executeSql(
        `INSERT INTO ${tableName} (${columns}) VALUES (${insertPlaceholders}) 
            ON CONFLICT(${primaryKey})
            DO UPDATE SET value = ?`,
        [model.key, model.value, model.value],
      );
    },
  };
}

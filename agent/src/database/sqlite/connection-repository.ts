import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {ConnectionModel} from 'src/models';
import {ConnectionRepository} from 'src/repository/connection-repository';

type ConnectionDbEntity = {
  connection_id: string;
  agent_info_device_info_brand: string;
  agent_info_device_info_build_id: string;
  agent_info_device_info_name: string;
  agent_info_version: string;
  agent_state: string;
  paired: boolean;
  paired_at: number;
};

export async function buildConnectionRepository(db: SQLiteDatabase, tableName = 'connectionContext'): Promise<ConnectionRepository> {
  const primaryKey = 'connection_id';
  const columns = 'connection_id, agent_info_device_info_brand, agent_info_device_info_build_id, agent_info_device_info_name, agent_info_version, agent_state, paired, paired_at';
  const insertPlaceholders = columns
    .split(',')
    .map(_ => '?')
    .join(',');

  await db.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (
      connection_id                   TEXT PRIMARY KEY,
      agent_info_device_info_brand    TEXT NOT NULL,
      agent_info_device_info_build_id TEXT NOT NULL,
      agent_info_device_info_name     TEXT NOT NULL,
      agent_info_version              TEXT NOT NULL,
      agent_state                     TEXT NOT NULL,
      paired                          BOOLEAN NOT NULL,
      paired_at                       INTEGER NOT NULL
    )`);

  console.debug(`Sqlite: initialized table ${tableName}`);

  return {
    fetchById: async (id: string) => {
      const resultSets = await db.executeSql(`SELECT ${columns} FROM ${tableName} WHERE ${primaryKey} = ?`, [id]);
      for (const result of resultSets) {
        if (result.rows.length > 0) {
          return translateConnectionEntity(result.rows.item(0) as ConnectionDbEntity);
        }
      }
      return null;
    },
    fetchAll: async () => {
      const connections: ConnectionModel[] = [];
      const resultSets = await db.executeSql(`SELECT ${columns} FROM ${tableName}`);
      for (const result of resultSets) {
        for (let i = 0; i < result.rows.length; i++) {
          connections.push(translateConnectionEntity(result.rows.item(i) as ConnectionDbEntity));
        }
      }
      return connections;
    },
    addOne: async (model: ConnectionModel) => {
      await db.executeSql(`INSERT INTO ${tableName} (${columns}) VALUES (${insertPlaceholders})`, [
        model.connectionId,
        model.agentInfo.deviceInfo.brand,
        model.agentInfo.deviceInfo.buildId,
        model.agentInfo.deviceInfo.name,
        model.agentInfo.version,
        model.agentState,
        model.paired,
        model.paired,
      ]);
    },
    deleteById: async (id: string) => {
      await db.executeSql(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [id]);
    },
    updateById: async (id: string, model: ConnectionModel) => {
      await db.executeSql(
        `UPDATE ${tableName} SET agent_info_device_info_brand = ?, agent_info_device_info_build_id = ?, agent_info_device_info_name = ?, agent_info_version = ?, agent_state = ?, paired = ? WHERE ${primaryKey} = ?`,
        [model.agentInfo.deviceInfo.brand, model.agentInfo.deviceInfo.buildId, model.agentInfo.deviceInfo.name, model.agentInfo.version, model.agentState, model.paired, id],
      );
    },
  };
}

function translateConnectionEntity(entity: ConnectionDbEntity): ConnectionModel {
  return {
    connectionId: entity.connection_id,
    paired: entity.paired,
    pairedAt: entity.paired_at,
    agentInfo: {
      deviceInfo: {
        brand: entity.agent_info_device_info_brand,
        buildId: entity.agent_info_device_info_build_id,
        name: entity.agent_info_device_info_name,
      },
      version: entity.agent_info_version,
    },
    agentState: entity.agent_state,
  };
}

// db/dbManager.ts
import * as sql from 'mssql';
import { dbConfigs } from './sqlConfigs';

type ConnectionPoolMap = Record<string, sql.ConnectionPool>;

let pools: ConnectionPoolMap = {};

export async function createDbConnections(): Promise<ConnectionPoolMap> {
  const names = Object.keys(dbConfigs);
  for (const name of names) {
    if (!pools[name]) {
      const pool = new sql.ConnectionPool(dbConfigs[name]);
      await pool.connect(); // importante: conectar manualmente
      pools[name] = pool;
    }
  }
  //console.info(names,pools)
  return pools;
}

export async function closeDbConnections(): Promise<void> {
  for (const name in pools) {
    await pools[name].close();
  }
  pools = {};
}

/**
 * Ejecuta una consulta en una conexión específica
 */
export async function executeQueryOn(
  dbName: string,
  query: string,
  params?: Record<string, any>
): Promise<sql.IResult<any>> {
  const pool = pools[dbName];
  if (!pool) throw new Error(`DB connection "${dbName}" not initialized`);

  const request = pool.request();
  if (params) {
    for (const key in params) {
      request.input(key, params[key]);
    }
  }
  console.info(`Executing query on ${dbName}: ${query} with params: ${JSON.stringify(params)}`);
  return await request.query(query);
}

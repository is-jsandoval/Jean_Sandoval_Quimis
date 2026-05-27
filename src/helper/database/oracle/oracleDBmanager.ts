import * as oracledb from "oracledb";
import { Connection, Result } from "oracledb";
import { oracleDbConfigs } from "./oracleDBconfig";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let oracleConnections: Record<string, Connection> = {};

/* ==============================
   CREAR CONEXIONES (BeforeAll)
================================ */

export async function createOracleConnections() {
  for (const dbName of Object.keys(oracleDbConfigs)) {

    const config = oracleDbConfigs[dbName];

    oracleConnections[dbName] = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });

    console.info(`Oracle conectado: ${dbName}`);
  }

  return oracleConnections;
}

/* ==============================
   CERRAR CONEXIONES (AfterAll)
================================ */

export async function closeOracleConnections() {
  for (const dbName of Object.keys(oracleConnections)) {
    try {
      await oracleConnections[dbName].close();
      console.info(`Oracle cerrado: ${dbName}`);
    } catch (error) {
      console.error(`Error cerrando Oracle ${dbName}`, error);
    }
  }
}

/* ==============================
   GET CONNECTION
================================ */

export function getOracleConnection(dbName: string): Connection {
  const conn = oracleConnections[dbName];

  if (!conn) {
    throw new Error(`No existe conexión Oracle para '${dbName}'`);
  }

  return conn;
}

export async function executeQueryOnOracle(
  dbName: string,
  query: string,
  binds: any = {},
  options: oracledb.ExecuteOptions = {}
): Promise<Result<any>> {

  let connection: Connection | undefined;

  try {
    connection = await getOracleConnection(dbName);

    return await connection.execute(
      query,
      binds,
      options
    );

  } catch (error) {
    console.error("Error ejecutando query Oracle", error);
    throw error;

  } finally {
    await closeOracleConnections();
  }
}
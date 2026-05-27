import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { getEnv } from "../helper/env/env";
import SQLiteConnection from "../helper/database/sqlite/sqLiteManager"
import { createDbConnections, closeDbConnections } from '../helper/database/SQL/sqlManager';
import logger from "../helper/util/logger";
import { createOracleConnections, closeOracleConnections } from "../helper/database/oracle/oracleDBmanager";

let oracleDbs: any;
const dbPath = './src/helper/database/sqlite/qaBancaWeb.db';
let connection: SQLiteConnection;
let dbs: any;
setDefaultTimeout(300000)

BeforeAll(async function () {
  getEnv();

  connection = await new SQLiteConnection(dbPath);
  dbs = await createDbConnections();
  oracleDbs = await createOracleConnections();


  console.info('SQL Server, SQLite y Oracle conectado');
});

Before(async function ({ pickle }) {

  const scenarioName = pickle.name;
  logger.warn(scenarioName);

  const tags = pickle.tags.map(tag => tag.name);

  this.sqlite = connection;
  this.dbs = dbs;
  this.oracle = oracleDbs;

  let tablaUsuarios = 'users';

  for (const tag of tags) {
    if (tablaPorTag[tag]) {
      tablaUsuarios = tablaPorTag[tag];
      break;
    }
  }

  if (process.env.PROFILE !== 'afiliacionBE') {
    await connection.consultaUsuario(tablaUsuarios);

    console.info(
      `\nUSUARIO: ${process.env.USER} \nCEDULA: ${process.env.CEDULA} \nCONTEXTO: ${process.env.CONTEXTO}`
    );

  } else {
    console.info('Sin usuario elegido.');
  }

  switch (true) {

    case tags.includes('@bfc'):
      process.env.BASEURL = process.env.PORTALURL;
      break;

    case tags.includes('@int'):
      process.env.BASEURL = process.env.INTEGRADORURL;
      break;

    case tags.includes('@pagosBE'):
      process.env.BASEURL = process.env.PAGOSBEURL;
      break;

    case tags.includes('@cobrosPortalPagosBFC'):
      process.env.BASEURL = process.env.COBROSPORTALPAGOSBFCURL;
      break;

    case tags.includes('@autorizadorBFC'):
      process.env.BASEURL = process.env.AUTORIZADORURL;
      break;

    case tags.includes('@srv'):
      process.env.BASEURL = process.env.SRVURL;
      break;

    case tags.includes('@cobros'):
      process.env.BASEURL = process.env.COBROSURL;
      break;

    case tags.includes('@afi'):
      process.env.BASEURL = process.env.AFIURL;
      break;

    case tags.includes('@comBE'):
      process.env.BASEURL = process.env.COMERCIOSBE;
      break;

    default:
      process.env.BASEURL = process.env.PORTALURL;
      break;
  }

});

After(async function (scenario) {

  // Adjuntar comprobantes si existen
  if (Array.isArray(this.rp)) {
    this.rp.forEach((res: any) => {
      if (res?.comprobante) {
        this.attach(`\n${res.comprobante}\n`, "text/plain");
      }
    });
  }

  // Request
  if (this.rqBody) {
    this.attach(
      `\n\nREQUEST BODY${JSON.stringify(this.rqBody, null, 2)}`,
      "text/plain"
    );
  } else {
    this.attach("\n\nNo se envió Request Body", "text/plain");
  }

  // Headers
  if (this.hdrs) {
    this.attach(
      `\n\nHEADERS${JSON.stringify(this.hdrs, null, 2)}`,
      "text/plain"
    );
  } else {
    this.attach("\n\nNo se envió Headers", "text/plain");
  }

  // Response
  if (this.rp) {
    this.attach(
      `\n\nRESPONSE BODY${JSON.stringify(this.rp, null, 2)}`,
      "text/plain"
    );
  } else {
    this.attach("\n\nNo se recibió Response", "text/plain");
  }

  // Logging
  if (scenario.result?.status === 'FAILED') {
    logger.error(`Escenario '${scenario.pickle.name}' falló`);
  } else {
    logger.info(`Escenario '${scenario.pickle.name}' completado con éxito`);
  }
});


AfterAll(async function () {

  await connection.close();
  await closeDbConnections();
  await closeOracleConnections();

  console.info('Conexiones cerradas');
});

const tablaPorTag: Record<string, string> = {
  '@srv': 'usuarioServicios',
  '@bfc': 'users',
  '@autorizador': 'users',
  '@int': 'users'
};
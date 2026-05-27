// db/dbConfigs.ts
import * as sql from 'mssql';

export const dbConfigs: Record<string, sql.config> = {
  crediPosNeo: {
    user: "usr_fullpayxbo",
    password: "Bg123456.",
    server: "172.26.60.105",
    port: 4433,
    database: "BG_NEO",
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
  linkPagos: {
    user: 'monitran',
    password: 'monitran',
    server: '172.26.61.204',
    port: 4433,
    database: 'BG_TComercios',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
    requestTimeout: 240000

  },
  portal: {
    user: 'apl_portalcomercios',
    password: 'Bg123456',
    server: '172.26.61.61',
    port: 4433,
    database: 'BG_PortalComercios',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
  heracles: {
    user: 'monitran',
    password: 'Bg123456',
    server: '172.26.61.61',
    port: 4433,
    database: 'Heracles',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    }
  },
  sms: {
    user: 'usr_db_canales',
    password: 'SQLdesa2012',
    server: '172.26.60.179',
    port: 4433,
    database: 'sms_cliente',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    }
  },
  syscard: {
    user: 'monitran',
    password: 'monitran',
    server: '172.26.61.204',
    port: 4433,
    database: 'nts_tarjcred',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    }

  },
  masterData: {
    user: 'inq_kmoreira',
    password: 'Bg123456',
    server: '172.26.60.134',
    port: 4433,
    database: 'BG_MasterData',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }



};


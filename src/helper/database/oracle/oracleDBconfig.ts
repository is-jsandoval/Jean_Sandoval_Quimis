export interface OracleDbConfig {
  user: string;
  password: string;
  connectString: string;
}

export const oracleDbConfigs: Record<string, OracleDbConfig> = {
  bgCore: {
    user: 'Bg_TP',
    password: 'Bg123456',
    connectString: `172.26.61.160:1521/BGCOREDB`
  },

/*   pagos: {
    user: "usr_pagos",
    password: "Bg123456",
    connectString: "172.26.60.130:1521/PAGOSDB"
  }, */

/*   riesgos: {
    user: "usr_riesgos",
    password: "Bg123456",
    connectString: "172.26.60.120:1521/RIESGOSDB"
  } */

  // solo configs, nada de lógica aquí
};

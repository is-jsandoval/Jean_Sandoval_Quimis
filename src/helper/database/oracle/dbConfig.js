const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const conexioBDBG = async () => {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.BGCOREDBUSERJS,
      password: process.env.BGCOREDBPASSJS,
      connectString: process.env.BGCOREDBURLJS + ":" + process.env.BGCOREDBPUERJS + "/" + process.env.BGCOREDBSERVICEJS
    });
    console.info('\nConexión exitosa a la base de datos Oracle Service Name');
    return connection;
  } catch (err) {
    console.error('\nError al configurar la conexión a Oracle Service Name');
  }
}
module.exports = {
  conexioBDBG,
};


const conectBD = require("../dbConfig.js");
const asignarOficialIdentificacion = async (identificacion) => {
    let consultaDatos = "";
    let conect;
    //let identificacion = process.env.IDENTIFICACIONCPOS;
    let identificacionV = identificacion;
    try {
        conect = await conectBD.conexioBDBG();
        const result = await conect.execute(
            `UPDATE BG_ADMIN.T_CLTEFIL set CLRESP = 'JMM' where clcdid = '0903858967'`
        );
        //await conect.commit();
        return result
    } catch (err) {
        console.error('\nError al ejecutar asignarOficialIdentificacion');
    } finally {
        if (conect) {
            try {
                // Cerrar la conexión 
                await conect.close();
            } catch (err) {
                console.error('\nError al cerrar la conexión');
            }
        }
    }
};

const prueba = async (identificacion) => {
    let consultaDatos = "";
    let conect;
    //let identificacion = process.env.IDENTIFICACIONCPOS;
    let identificacionV = identificacion;
    try {
        conect = await conectBD.conexioNameService();
        const result = await conect.execute(
            `select CLRESP from BG_ADMIN.T_CLTEFIL where clcdid = '0903858967'`,
        );
        await conect.commit();
        consultaDatos = result;
        return consultaDatos
    } catch (err) {
        console.error('\nError al ejecutar asignarOficialIdentificacion');
    } finally {
        if (conect) {
            try {
                // Cerrar la conexión 
                await conect.close();
            } catch (err) {
                console.error('\nError al cerrar la conexión');
            }
        }
    }
};

const consultarCtas = async () => {
    let consultaDatos = "";
    let conect;
    let cedula = process.env.CEDULA
    try {
        conect = await conectBD.conexioBDBG();
        const result = await conect.execute(
            "SELECT MSCTA, MSSTAT, MSCDCL, MSSAUS FROM T_AHMAEST WHERE MSCDID ='" + cedula + "' AND MSSTAT=0",
        );
        consultaDatos = result;
        return consultaDatos
    } catch (err) {
        console.error('\nError al ejecutar la consulta');
    } finally {
        if (conect) {
            try {
                // Cerrar la conexión 
                await conect.close();
            } catch (err) {
                console.error('\nError al cerrar la conexión');
            }
        }
    }
};
const consultarMvtos = async (datos) => {
    let consultaDatos = "";
    let conect;
    let cuenta = datos.rows[0].MSCTA
    console.info(cuenta)
    try {
        conect = await conectBD.conexioBDBG();
        const result = await conect.execute(
            "select CTKMOVD_CUENTA,MVFECH,CTKMOVD_HORA,MVTIPO,MVMOTV,MVMONT FROM BG_ADMIN.T_CTKMOVD WHERE CTKMOVD_CUENTA = '" + cuenta + "'",
        );
        consultaDatos = result;
    } catch (err) {
        console.error('\nError al ejecutar la consulta');
    } finally {
        if (conect) {
            try {
                // Cerrar la conexión 
                await conect.close();
            } catch (err) {
                console.error('\nError al cerrar la conexión');
            }
        }
    }
    return consultaDatos;
};

module.exports = {
    asignarOficialIdentificacion,
    prueba,
    consultarCtas,
    consultarMvtos
};

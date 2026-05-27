import { executeQueryOn } from '../database/SQL/sqlManager';
import { RequestHelper } from "../wrapper/RequestHelper";
import Encrypt from "../wrapper/encrypt";
import { consultaComercioRUCGeneraLink } from "../../test/autorizadorBFC/data/consultaBaseLink";
import SQLiteConnection from '../database/sqlite/sqLiteManager';

const requestHandler = new RequestHelper();

export async function generaLinkPagos
    (monto: string, ruc: string, motivo: string): Promise<string> {


    const numeroAleatorio = parseFloat(
        (Math.random() * (110 - 10) + 10).toFixed(2)
    );
    let varMonto = parseFloat(monto);

    const rqLink = {
        ruc: ruc,
        motivo: motivo,
        monto: varMonto.toFixed(2),
        MontoIVA: (varMonto - varMonto / 1.15).toFixed(2),
        nombreCliente: "AutomationsJS",
        NombreComercio: "AutomationsJS",
        correoComercio: "AutomationsJS@gmail.com",
        canalBG: "QA",
        tipoPago: "C"
    };

    console.info("Respuesta generación de link: ", rqLink);
    const rp = await requestHandler.getResponseBody(
        null,
        '/link-pago/v1/link/generar',
        'POST',
        rqLink,
        {},
        'http://pagosbe.apps.test.ocp.bancoguayaquil.com'
    );

    const auditNumber = rp.responseBody.data.link.split('/').pop();
    console.info("String(auditNumber): ", String(auditNumber));
    return String(auditNumber);
    
    console.info("Respuesta generación de link: ", rp);
}

export async function pagarLink
    (codigoAuditoria: string, monto: string, vruc: string, tipoDiferido: string, mesesDiferido: string) {


    let varMonto = parseFloat(monto);
    //consulta para cuando no tienes coneccion por que no es un step
    const Consultacomercio = await executeQueryOn('linkPagos', consultaComercioRUCGeneraLink, { ruc: vruc });
    const primerComercio = Consultacomercio.recordset[0];

    //conexion a sqlite para consulta de tarjeta de pruebas
    const sqlite = new SQLiteConnection('./src/helper/database/sqlite/qaBancaWeb.db');
    const tarjeta = await sqlite.consultaRandom<{ pan: string; expiration: string; cvv: string }>(
        `SELECT  pan, expiration, cvv FROM tarjetas_pruebas_link WHERE id =2 ;` //WHERE id =3 
    );
    sqlite.close();//no borres por que es para cerrar conexión

    const rqBodyTMP = {
        "pan": tarjeta.pan,
        "expira": tarjeta.expiration,
        "codigoSeguridad": tarjeta.cvv,
        "codigoAuditoria": codigoAuditoria,
        "monto": varMonto.toFixed(2),
        "montoIVA": (varMonto - varMonto / 1.15).toFixed(2),
        "codigoGiroNegocio": primerComercio.co_giro,
        "terminal": primerComercio.co_terminal,
        "mid": primerComercio.co_mid,
        "nombreComercio": primerComercio.co_descripcion,
        "ciudad": primerComercio.co_ciudad,
        "pais": primerComercio.co_pais,
        "tipoDiferido": 0,
        "mesesDiferido": 0
    };
    console.info("rqBodyTMP tarjeta : ", rqBodyTMP);



    const encryptedbody = await Encrypt.encryptForAuthorizer(rqBodyTMP);

    const rqBody = {
        data: encryptedbody,
        identificacionDestinatario: "0954121646",
        tipoIdentificacionDestinatario: "C",
        motivoCobro: "Lo que sea que vendan",
        nombreCliente: "Cliente Automations JC",
        correoComercio: "automationsBG@gmail.com"
    };
    console.info("bodyyyyy: ", rqBody);
    return { encryptedbody, rqBody };
}

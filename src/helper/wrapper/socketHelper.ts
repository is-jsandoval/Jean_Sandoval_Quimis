import * as net from 'net';
import * as fs from 'fs';
import * as path from "path";
import { XMLParser } from "fast-xml-parser";

import { parseStringPromise } from "xml2js";
import { executeQueryOn } from '../database/SQL/sqlManager';

let cache: StateMap | null = null;

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: false
});

function reemplazarVariables(mensaje: string, variables: Record<string, string | number>): string {
    let mensajeFinal = mensaje;

    for (const [clave, valor] of Object.entries(variables)) {
        const placeholder = `{{${clave}}}`;
        mensajeFinal = mensajeFinal.replace(new RegExp(placeholder, "g"), valor.toString());
    }

    return mensajeFinal;
}

export function printReceiptFromXML(xmlData: string, showConsole: boolean = true): { plain: string | null } {
    try {
        const cleanedXml = xmlData
            .substring(xmlData.indexOf("<"))
            .replace(/[^\x09\x0A\x0D\x20-\x7F]/g, "");

        const parser = new XMLParser({ ignoreAttributes: false });
        const result = parser.parse(cleanedXml);

        const printBuffer = result.printBuffer || result.response?.printBuffer;

        if (!printBuffer) {
            if (showConsole) console.info("❌ XML sin etiqueta <printBuffer>.");
            return { plain: null };
        }

        const tagsN = Array.isArray(printBuffer.n) ? printBuffer.n : printBuffer.n ? [printBuffer.n] : [];
        const tagsB = Array.isArray(printBuffer.b) ? printBuffer.b : printBuffer.b ? [printBuffer.b] : [];
        const tagsL = Array.isArray(printBuffer.l) ? printBuffer.l : printBuffer.l ? [printBuffer.l] : [];

        const lines = [
            ...tagsL.map(l => `[LOGO] ${l}`),
            ...tagsN,
            ...tagsB,
        ].filter(line => typeof line === "string" && line.trim() !== "")
            .map(line => line.replace(/☻/g, "ó").trim());

        // Texto plano (para consola)
        const plain = [
            "==============================",
            "        COMPROBANTE        ",
            "==============================",
            ...lines,
            "==============================",
        ].join("\n");



        if (showConsole) console.info(plain);

        return { plain };
    } catch (error) {
        console.error("❌ Error al procesar el XML:", error);
        return { plain: null };
    }
}

function cargarCasos(file: string, variables?: Record<string, string | number>): CasoPrueba[] {
    const filePath = `src/test/BcoDelBarrio/data/${file}.json`;
    const data = fs.readFileSync(path.resolve(filePath), "utf-8");
    let casos: CasoPrueba[] = JSON.parse(data);


    casos = casos.map(caso => {
        const mensajeModificado = variables
            ? reemplazarVariables(caso.mensaje, variables)
            : caso.mensaje;

        return {
            ...caso,
            mensaje: mensajeModificado
        };
    });

    return casos;
}

async function cargarTraducciones(
    xmlName = "States 17.xml"
): Promise<StateMap> {
    if (cache) return cache;

    // Ruta estable con __dirname para evitar ENOENT al cambiar CWD
    const xmlPath = path.resolve(
        __dirname,
        "../../test/data/tramas Remesas",
        xmlName
    );

    const xmlContent = fs.readFileSync(xmlPath, "utf-8");

    const parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
        attrkey: "$",
        trim: true,
    });

    const map: StateMap = {};
    const nodes = parsed?.states?.state; // <states><state .../></states>

    // Normalizamos a arreglo
    const arr = Array.isArray(nodes) ? nodes : nodes ? [nodes] : [];

    for (const s of arr) {
        const id = s?.$?.id;
        const title = s?.$?.title;
        if (id && typeof title === "string" && title.length > 0) {
            map[id] = title;
        }
    }

    cache = map;
    return map;
}

function simpleObfuscate(text: string): string {
    const result: string[] = [];
    for (let i = 0; i < text.length; i++) {
        result.push(String.fromCharCode(text.charCodeAt(i) - 5));
    }
    return result.join('');
}

function simpleDefuscateBuffer(buff: Buffer): string {
    const result = [];
    for (let i = 0; i < buff.length; i++) {
        result.push(String.fromCharCode(buff[i] + 5));
    }
    return result.join('');
}

function extractNextState(xmlResponse: string): string | null {
    const regex = /<\s*nextState[^>]*>(\d+)<\s*\/\s*nextState\s*>/i;
    const match = regex.exec(xmlResponse);
    return match ? match[1] : null;
}

function extractNumTRX(xmlResponse: string): string | null {
    const regex = /NRO\.?\s*TRANSACCION[:\s]*(\d+)/i;
    const match = regex.exec(xmlResponse);
    return match ? match[1] : null;
}

async function ejecutarCorteDefinitivo() {
    const host = process.env.HERACLESHOST251;
    const puerto = Number(process.env.HERACLESPORT);

    const casos = cargarCasos('corteDefinitivo');
    let result;

    result = await executeQueryOn('heracles', `SELECT trmId, trmIp, trmAccount
                                            FROM [Heracles].[dbo].[Terminal]
                                            where trmid = '30655'`)



    process.env.TRMID = result.recordset[0].trmId;
    process.env.TRMIP = result.recordset[0].trmIp;
    process.env.TRMACCOUNT = result.recordset[0].trmAccount;

    for (const caso of casos) {
        await ejecutarTrama({
            nombre: caso.nombre,
            host,
            puerto,
            mensaje: caso.mensaje
        });

        // Esperar 1 segundo entre pruebas
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.info("CORTE DEFINITVO EJECUTADO.")
}

async function generaQR(): Promise<string> {
    const host = process.env.HERACLESHOST251;
    const puerto = Number(process.env.HERACLESPORT);

    const montoAleatorio = parseFloat((Math.random() * (19) + 1).toFixed(2));
    const casos = cargarCasos('generaQR', { MONTO: montoAleatorio, PINBUFFER: process.env.PINBUFFER });

    const resultados: CasoTrama[] = [];

    for (const caso of casos) {
        const resultado = await ejecutarTrama({
            nombre: caso.nombre,
            host,
            puerto,
            mensaje: caso.mensaje
        });

        resultados.push({
            nextState: resultado.nextState,
            traduccion: resultado.title,
            HeraclesRp: resultado.decoded,
            comprobante: resultado.comprobante

        });


        await new Promise(resolve => setTimeout(resolve, 3000));
    }


    function extractQrid(raw: string): string | null {

        const clean = raw.replace(/^[\x00-\x1F\x7F]+/, "");
        const match = clean.match(/<qr[idID]+>(.*?)<\/qr[idID]+>/);
        return match ? match[1] : null;
    }

    let qrid = extractQrid(resultados[0].HeraclesRp);

    console.info("qrid: ", qrid)
    return qrid
}


async function ejecutarTrama(config: ConfiguracionPrueba): Promise<{
    nextState: string | null,
    title: string | null,
    decoded: string | null,
    comprobante: string | null
}> {
    const { nombre, host, puerto, mensaje, timeout = 45000 } = config;

    let mapa: Record<string, string> = {};
    try {
        mapa = await cargarTraducciones();
    } catch { /* no hay traducciones */ }

    console.info(`\n🧪 Ejecutando caso: ${nombre}`);

    return new Promise(resolve => {
        const socket = new net.Socket();

        socket.setNoDelay(true);
        socket.setKeepAlive(true, 5000);
        socket.setTimeout(Math.max(timeout, 60000));

        let resolved = false;
        let gotData = false;
        let responseBuffer = Buffer.alloc(0);
        let decodedFinal: string | null = null;


        const resolveNulls = () => {
            if (resolved) return;
            console.info("🛑 resolveNulls() ejecutado — devolviendo NULL");

            resolved = true;
            resolve({ nextState: null, title: null, decoded: null, comprobante: null });
        };

        const tryParseAndResolve = (decoded: string) => {
            if (resolved) return;
            resolved = true;

            try {
                console.info("RAW Response:", decoded);


                const comprobanteObj = printReceiptFromXML(decoded);
                const comprobante = comprobanteObj?.plain ?? null;

                const nextState = extractNextState(decoded);
                const title = nextState ? (mapa[nextState] ?? null) : null;

                console.info("Valor NextState:", nextState);
                console.info("Mensaje de nextState:", title ?? "sin traducción");

                resolve({ nextState, title, decoded, comprobante });
            } catch (err) {
                console.error("Error al procesar respuesta:", err);
                resolveNulls();
            }
        };

        socket.connect(puerto, host, () => {
            try {
                const cabecera = Buffer.from([0xAA, 0xAA, 0xAA, 0xAA]);

                const totalLength = 4331999;

                // construir SOLO el mensaje + relleno antes de ofuscar
                const temporalMensaje = mensaje; // el mensaje limpio
                let temporal = Buffer.concat([cabecera, Buffer.from(temporalMensaje, "utf-8")]).length;

                console.info("Longitud del mensaje (antes de ofuscar):", temporal);

                // calcular relleno EXACTAMENTE como Python
                const totalPadding = Math.floor((totalLength - temporal) / 4);
                const contenidoRelleno = " ".repeat(totalPadding);

                // ahora sí, OFUSCAR TODO como Python
                const mensajeParaOfuscar = mensaje + contenidoRelleno;
                const ofuscado = simpleObfuscate(mensajeParaOfuscar);

                // crear trama final
                const tramaBuffer = Buffer.concat([
                    cabecera,
                    Buffer.from(ofuscado, "utf-8")
                ]);

                console.info("Enviando trama...");


                socket.write(tramaBuffer);
            } catch (err) {
                console.error("Error al enviar datos:", err);
                socket.destroy();
                resolveNulls();
            }
        });

        socket.on("data", (chunk) => {

            gotData = true;

            responseBuffer = Buffer.concat([responseBuffer, chunk]);
            decodedFinal = simpleDefuscateBuffer(responseBuffer);

            if (decodedFinal.includes("</response>")) {
                tryParseAndResolve(decodedFinal);
                socket.end();
            }
        });

        socket.on("error", (err) => {

            if (gotData) {
                console.info("⚠️ Error después de recibir datos → ignorando error");
                socket.destroy();
                return; // ❌ NO DEVUELVAS NULL
            }

            console.info("⚠️ Error antes de recibir datos → devolviendo NULL");
            socket.destroy();
            resolveNulls();
        });

        socket.on("close", () => {
            console.info("🔌 CLOSE");

            if (!resolved && gotData && decodedFinal) {
                console.info("⚠️ CLOSE después de recibir datos → devolviendo respuesta válida");
                tryParseAndResolve(decodedFinal);
            }
        });

        socket.on("end", () => console.info("🔚 END"));

        socket.on("timeout", () => {
            console.info("⏳ TIMEOUT");
            socket.destroy();

            if (gotData && decodedFinal) {
                tryParseAndResolve(decodedFinal);
            } else {
                resolveNulls();
            }
        });
    });
}

async function ejecutarTrx(
    casos: CasoPrueba[],
    maxRetriesGlobal: number = 3
): Promise<CasoTrama[]> {

    const host = process.env.HERACLESHOST251;
    const puerto = Number(process.env.HERACLESPORT);

    for (let intento = 1; intento <= maxRetriesGlobal; intento++) {
        console.info(`\n🔄 Intento global ${intento}/${maxRetriesGlobal}`);

        const resultados: CasoTrama[] = [];

        // Ejecutar TODAS las tramas secuenciales
        for (const caso of casos) {
            const resultado = await ejecutarTrama({
                nombre: caso.nombre,
                host,
                puerto,
                mensaje: caso.mensaje
            });

            resultados.push({
                nextState: resultado.nextState,
                traduccion: resultado.title,
                HeraclesRp: resultado.decoded,
                comprobante: resultado.comprobante
            });

            // espera entre tramas
            await new Promise(r => setTimeout(r, 3000));
        }

        // 🧪 Validar solo la ÚLTIMA trama
        const ultima = resultados[resultados.length - 1];

        const ultimaEsValida =
            ultima.nextState !== null &&
            ultima.HeraclesRp !== null &&
            ultima.HeraclesRp !== undefined &&
            ultima.HeraclesRp.trim().length > 0;

        if (ultimaEsValida) {
            console.info("✅ La última trama respondió correctamente. Fin.");
            return resultados;
        }

        console.warn("❌ La última trama vino NULL. Reintentando todas las tramas...");

        // Delay entre intentos globales
        await new Promise(r => setTimeout(r, 3000));
    }

    throw new Error(
        `❌ No se obtuvo respuesta válida en la última trama tras ${maxRetriesGlobal} intentos completos.`
    );
}

interface CasoPrueba {
    nombre: string;
    mensaje: string;
}

interface ConfiguracionPrueba {
    nombre: string;
    host: string;
    puerto: number;
    mensaje: string;
    timeout?: number;
}

interface StateMap {
    [id: string]: string;
}

export interface CasoTrama {
    nextState: string | null;
    traduccion: string | null;
    HeraclesRp: string | null;
    comprobante: string | null;


}

export {
    reemplazarVariables,
    cargarCasos,
    simpleObfuscate,
    simpleDefuscateBuffer,
    ejecutarTrama,
    ejecutarTrx,
    ejecutarCorteDefinitivo,
    generaQR,
    CasoPrueba,
    ConfiguracionPrueba
};
import { request } from "playwright/test";
import Encrypt from "../../helper/wrapper/encrypt";
import SQLiteConnection from "../../helper/database/sqlite/sqLiteManager"
import * as fs from 'fs';
import { FileLoaderHelper } from '../../helper/wrapper/fileLoaderHelper';

const HttpContextManager = require('../../helper/wrapper/HttpContextManager');

export class RequestHelper {

    async sendPostRequest(contextApi: any, endpoint: string, requestEncript: {}) {
        try {
            const postResponse = await contextApi.post(endpoint, { data: requestEncript });

            return postResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error en la solicitud POST:", errorMessage);
            throw error;
        }
    }

    async sendGetRequest(contextApi: any, endpoint: string, requestEncript: {}) {
        try {
            const getResponse = await contextApi.get(endpoint, { params: requestEncript });

            return getResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error en la solicitud GET:", errorMessage);
            throw error;
        }
    }

    async sendPutRequest(contextApi: any, endpoint: string, requestEncript: {}, extraHeaders?: Record<string, string>
    ) {
        try {
            const putResponse = await contextApi.put(endpoint, {
                data: requestEncript,
                headers: extraHeaders
            });

            return putResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error en la solicitud PUT:", errorMessage);
            throw error;
        }
    }

    async sendDeleteRequest(contextApi: any, endpoint: string, requestEncript: {}) {
        try {
            const deleteResponse = await contextApi.delete(endpoint, { params: requestEncript });
            return deleteResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error en la solicitud DELETE:", errorMessage);
            throw error;
        }
    }

    async sendPatchRequest(contextApi: any, endpoint: string, requestEncript: {}) {
        try {
            const patchResponse = await contextApi.patch(endpoint, { data: requestEncript });
            return patchResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error en la solicitud PATCH:", errorMessage);
            throw error;
        }
    }

    async getResponseBody(
        accessToken: any,
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        requestBody: object = {},
        extraHeaders?: Record<string, string>,
        overrideBaseURL?: string
    ) {
        try {
            const newContext = await HttpContextManager.createContext(request, accessToken, extraHeaders, overrideBaseURL);
            const response = await this.sendRequest(newContext, endpoint, method, requestBody, extraHeaders);
            return await this.processResponse(response);
        } catch (error) {
            console.error(`Error inesperado en la solicitud ${method} a ${endpoint}:`, error);
            throw error;
        }
    }

    private async sendRequest(contextApi: any, endpoint: string, method: string, requestBody: object, extraHeaders?: Record<string, string>
    ) {
        switch (method) {
            case 'GET':
                return await this.sendGetRequest(contextApi, endpoint, requestBody);
            case 'POST':
                return await this.sendPostRequest(contextApi, endpoint, requestBody);
            case 'PUT':
                return await this.sendPutRequest(contextApi, endpoint, requestBody, extraHeaders);
            case 'DELETE':
                return await this.sendDeleteRequest(contextApi, endpoint, requestBody);
            case 'PATCH':
                return await this.sendPatchRequest(contextApi, endpoint, requestBody);
            default:
                throw new Error(`Método HTTP no soportado: ${method}`);
        }
    }

    private async processResponse(response: any) {
        const responseText = await response.text();
        const contentType = response.headers()['content-type'];

        if (response.ok()) {
            if (!responseText) {
                console.warn("La respuesta está vacía.");
                return { response, status: response.status() };
            }

            if (contentType?.includes('application/json')) {
                return {
                    response,
                    responseBody: JSON.parse(responseText),
                    status: response.status(),
                };
            } else {
                const buffer = await response.body();
                return {
                    response,
                    file: buffer,
                    status: response.status(),
                };
            }
        } else {
            return await this.handleErrorResponse(response, responseText, contentType);
        }
    }

    private async handleErrorResponse(response: any, responseText: string, contentType: string) {
        console.info(`\nError HTTP: ${response.status()}`);

        if (contentType?.includes('application/json')) {
            try {
                const responseBody = JSON.parse(responseText);
                const errorMsg = responseBody.message ?? "Mensaje de error no disponible";
                const errorStatus = response.status();
                console.warn(`\nMensaje de error: ${errorMsg}`);
                return {
                    response,
                    responseBody,
                    errorMsg,
                    errorStatus,
                    status: errorStatus
                };
            } catch (jsonError) {
                console.error("Error al procesar el JSON de la respuesta:", jsonError);
                return {
                    response,
                    errorMsg: "Error de parsing JSON: la respuesta no es un JSON válido",
                    rawBody: responseText,
                    errorStatus: response.status(),
                    status: response.status()
                };
            }
        } else {
            console.warn("La respuesta no es JSON (puede ser HTML de error u otro tipo).");
            return {
                response,
                errorMsg: "Respuesta no JSON recibida. Posiblemente un error 504 u otro HTML.",
                rawBody: responseText,
                errorStatus: response.status(),
                status: response.status()
            };
        }
    }

    async otp(at: any) {

        let otpData = {

            "document": "0911682813",
            "typeDoc": "string",
            "valueNotification": "string",
            "typeNotification": "string",
            "user": "string"

        }



        const rp = await this.getResponseBody(at, "/api/v1/QA-automator/otp", "POST", otpData);
        const otpGenerated = rp.responseBody.otp;
        return otpGenerated
    }

    async inicioDeSesion(usernameParam?: string) {
        if (usernameParam) {
            process.env.USER = usernameParam;
        }

        let usuario = {
            "usuario": process.env.USER,
            "canalCab": "BVI",
            "ipCliente": "192.56.12.36",
            "access_token": "8386a97b-871b-4da4-8489-b543f717a336"
        }


        const rp = await this.getResponseBody(null, '/api/v2/authentication/login', 'POST', usuario);
        const at = rp.responseBody.access_token;
        return at;
    }

    async inicioDeSesionComercio(usernameParam?: string) {
        if (usernameParam) {
            process.env.USER = usernameParam;

            let connection = new SQLiteConnection('./src/helper/database/sqlite/qaBancaWeb.db');
            process.env.CEDULA = await connection.consultaIdentificacion();


        }

        let usrComercio = {
            usuario: "",
            password: ""
        }

        let encryptedPassword = await Encrypt.encryptWithPublicKey(process.env.PWD);

        usrComercio.usuario = process.env.USER
        usrComercio.password = encryptedPassword;

        const rp: any = await this.getResponseBody(null, '/api/v1/authentication/login', 'POST', usrComercio);
        const at = rp.responseBody?.token;

        if (!at) {
            const detalle = rp.errorMsg ?? rp.responseBody?.message ?? JSON.stringify(rp.responseBody);
            throw new Error(`No se pudo iniciar sesión para "${process.env.USER}". Status: ${rp.status}. Detalle: ${detalle}`);
        }

        return at;
    }

    async ruc(at: any, empresa?: string): Promise<string | null> {
        const ruc = await this.getResponseBody(at, "/api/v1/company", "GET", {});
        const listaEmpresas = ruc.responseBody || [];

        if (empresa) {
            const empresaNormalizada = empresa.trim().toLowerCase();
            const empresaEncontrada = listaEmpresas.find(
                (item: any) => item.description?.trim().toLowerCase() === empresaNormalizada
            );

            if (!empresaEncontrada) {
                const disponibles = listaEmpresas.map((item: any) => item.description).join(', ');
                throw new Error(`No se encontró una empresa con nombre: "${empresa}". Empresas disponibles: ${disponibles}`);
            }

            return empresaEncontrada.enterpriseCustomerId;
        }

        const primerRuc = listaEmpresas[0]?.enterpriseCustomerId;

        if (!primerRuc) {
            console.warn("No se encontró ningún registro de empresa en la respuesta.");
            return null;
        }

        return primerRuc;
    }

    async comercio(at: any, encodedRUC: any, nombreComercio?: string): Promise<string | null> {
        const comercios = await this.getResponseBody(
            at,
            `/api/v1/Commerce/${String(encodedRUC)}`,
            "GET",
            {}
        );

        const stores = comercios.responseBody?.stores || [];
        // Si se proporciona un nombre de comercio, buscarlo
        if (nombreComercio) {
            const comercioNormalizado = nombreComercio.trim().toLowerCase();
            const comercioEncontrado = stores.find(
                (store: any) => store.name?.trim().toLowerCase() === comercioNormalizado
            );

            if (!comercioEncontrado) {
                const disponibles = stores.map((store: any) => store.name).join(', ');
                throw new Error(`No se encontró un comercio con nombre: "${nombreComercio}". Comercios disponibles: ${disponibles}`);
            }
            return comercioEncontrado.merchantCode + comercioEncontrado.digit;
        }

        // Si no se proporciona nombre, devolver el primer merchantCode+digit
        const primerComercio = stores[0];

        if (!primerComercio) {
            console.warn("No se encontró ningún comercio en la respuesta.");
            return null;
        }

        return primerComercio.merchantCode + primerComercio.digit;
    }

    async numExpediente(cedTmp: string, productoTmp: string): Promise<string | null> {
        let rqBody = {
            identificacion: cedTmp,
            producto: productoTmp,
        }
        let rpTmp = await this.getResponseBody(
            null,
            `/bfccreditofacturacion/v1/seguridad/valida-cliente`,
            "POST",
            rqBody
        );

        return rpTmp.responseBody.data.idSolicitud
    }

    async prepararClienteConFoto(params: {
        cedula: string;
        producto: string;
        fotoPath: string;
        fotoTokenizada: string;
        ejecutarUpdateEstado?: boolean;
        db?: any;
    }): Promise<string> {

        /** 1️⃣ Obtener expediente */
        const idSolicitud = await this.numExpediente(
            params.cedula,
            params.producto
        );

        console.info("ID SOLICITUD OBTENIDO:", idSolicitud);

        /** 2️⃣ Update BD si aplica */
        if (params.ejecutarUpdateEstado && params.db) {
            const query = `
      update [BG_NEO].[dbo].BG_EXP_Expediente
      set idEstado = 2851
      where idPersona in (
        SELECT idPersona 
        FROM [BG_NEO].[dbo].[BG_PER_Personas]
        where numIdentificacion='${params.cedula}'
      )
    `;
            await params.db.request().query(query);
        }

        /** 3️⃣ Leer foto binaria */
        const fotoBinaria = fs.readFileSync(params.fotoPath);

        console.info("FOTO LEIDA, tamaño (bytes):", fotoBinaria.length);

        /** 4️⃣ Subir foto */
        const endpointFoto =
            `http://172.26.60.110:8080/ords/bg_ords/general/dnis/${params.cedula}/foto`;

        await this.getResponseBody(
            null,
            '',
            'PUT',
            fotoBinaria,
            { 'Content-Type': 'image/jpeg' },
            endpointFoto
        );

        /** 5️⃣ Obtener CONTENIDO del token desde env */
        const fotoTokenizada =
            FileLoaderHelper.loadTextFromEnv(params.fotoTokenizada).trim();

        /** 6️⃣ Construir body biometría */
        const rqBodyBiometria = {
            producto: params.producto,
            identificacion: params.cedula,
            obtenerCodDactilar: true,
            codigoDactilar: "",
            idSolicitud,
            NavegadorWeb: "Chrome",
            DispositivoOrigen: "testQA",
            VersionOrigen: "browser: Chrome/136.0.0.0; SO: Windows/NT 10.0",
            tieneCamara: "S",
            fotoTokenizada
        };


        /** 8️⃣ Validar biometría */
        const rp = await this.getResponseBody(
            null,
            `/bfccreditofacturacion/v1/seguridad/validar-biometria`,
            'POST',
            rqBodyBiometria,
            { 'Content-Type': 'application/json' }
        );

        /** 9️⃣ Retornar client-token limpio */
        return rp.responseBody.data['client-token']
            .replace(/^Bearer\s+/i, '');
    }

    async numComercioAfiliacion(rucTmp: string): Promise<number> {
        let hdrs = {
            ruc: rucTmp,
            canal: "PC",
        }
        let rpTmp = await this.getResponseBody(
            null,
            `/afiliacion/v1/link-pago/opciones`,
            "GET",
            {},
            hdrs
        );
        console.info("NUM COMERCIO OBTENIDO:", rpTmp.responseBody)
        console.info("NUM COMERCIO OBTENIDO:", rpTmp.responseBody.data.codigoComercio)

        return rpTmp.responseBody.data.codigoComercio;
    }


}

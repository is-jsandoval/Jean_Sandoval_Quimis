import { expect } from "playwright/test";
import { executeQueryOnOracle } from "../database/oracle/oracleDBmanager";
import { Result } from "oracledb";


export default class Assert {

    static async assertSocketResponse(rp: any) {
        expect(rp).not.toBeNull();

        // Si es un arreglo, recórrelo
        if (Array.isArray(rp)) {
            expect(rp.length).toBeGreaterThan(0);

            for (const item of rp) {
                expect(item).not.toBeNull();

                expect(item.nextState).not.toBeNull();
            }
        } else {
            // Si es un único objeto
            //expect(rp.response).toContain("<response>");
            expect(rp.nextState).not.toBeNull();
        }
    }

    static async assertTRXenCash(accion: string, valor: string, saldoInicial: Result<any>) {
        const valorTrx = Number(valor);
        const saldoInicialNum = saldoInicial?.rows?.[0]?.SALDO;

        if (saldoInicialNum === undefined) {
            throw new Error("❌ No se pudo obtener el saldo inicial");
        }

        // 🔹 Consultar saldo final
         const saldoFinalRes = await executeQueryOnOracle('bgCore',`
    SELECT MTSALTOT AS SALDO
    FROM bg_admin.t_maestro C
    JOIN bg_admin.t_cltefil CL ON C.MTCODCLT = CL.CLKEY
    WHERE C.MTCUENTA = '18245922'
  `) ;

        const saldoFinalNum = saldoFinalRes?.rows?.[0]?.SALDO;
        if (saldoFinalNum === undefined) {
            throw new Error("❌ No se pudo obtener el saldo final");
        }

        console.info(`\n🧾 saldoInicial = ${saldoInicialNum}`);
        console.info(`💰 monto de la trx = ${valorTrx}`);
        console.info(`🏦 saldoFinal = ${saldoFinalNum}`);
        console.info(`⚙️ acción esperada: ${accion}`);

        // 🔹 Validación según la acción
        switch (accion) {
            case 'disminuye': {
                const esperado = saldoInicialNum - valorTrx;
                expect(Number(saldoFinalNum.toFixed(2))).toBe(Number(esperado.toFixed(2)));
                break;
            }
            case 'aumenta': {
                const esperado = saldoInicialNum + valorTrx;
                expect(Number(saldoFinalNum.toFixed(2))).toBe(Number(esperado.toFixed(2)));
                break;
            }
            case 'mantiene': {
                expect(Number(saldoFinalNum.toFixed(2))).toBe(Number(saldoInicialNum.toFixed(2)));
                break;
            }
            default:
                throw new Error(`⚠️ Acción no reconocida: ${accion}`);
        }

        console.info('✅ Validación de saldo realizada correctamente.');
    }

    static async assertRegex(valor: string, patron: RegExp) {
        const cumple = patron.test(valor);
        expect(cumple).toBe(true);
    }

    static async assertMensaje(msjObtenido: string, msjEsperado: string) {
        expect(msjObtenido).toBe(msjEsperado)
    }

    static async assertStatus(statusObtenido: string, statusEsperado: string) {
        expect(statusObtenido).toBe(statusEsperado)
    }

    static async assertLongitud(jsonResponse: string) {
        expect(jsonResponse).not.toBeNull();
        expect(jsonResponse).not.toBeUndefined();
    }

    static async assertArchivoBase64(fileBuffer: Buffer) {
        // Validar que el archivo no sea nulo ni vacío
        expect(fileBuffer).toBeDefined();
        expect(fileBuffer.length).toBeGreaterThan(0);
        expect(fileBuffer.length).toBeGreaterThan(1000);
    }

    static async assertContieneOtp(jsonResponse: any) {
        expect(jsonResponse).not.toBeNull();
        expect(jsonResponse).not.toBeUndefined();

        expect(jsonResponse).toHaveProperty('otp');
        expect(jsonResponse.otp).toBeDefined();
        expect(jsonResponse.otp).not.toBe('');
    }

    static async assertContieneClaves(jsonResponse: any, ...claves: string[]) {
        expect(jsonResponse).not.toBeNull();
        expect(jsonResponse).not.toBeUndefined();

        claves.forEach((clave) => {
            expect(jsonResponse).toHaveProperty(clave);
            expect(jsonResponse[clave]).toBeDefined();
            expect(jsonResponse[clave]).not.toBe('');
        });
    }

    static async assertNumeroObjetos(jsonResponse: any[], cantidadEsperada: number) {
        expect(Array.isArray(jsonResponse)).toBeTruthy();
        expect(String(jsonResponse.length)).toBe(cantidadEsperada);
    }

    static async assertPagoAutorizado(jsonResponse: any) {
        expect(jsonResponse).toHaveProperty('data');
        expect(jsonResponse.data.autorizado).toBeTruthy();
    }

}
import * as fs from 'fs';
import * as path from 'path';

export class FileLoaderHelper {

    static loadTextFromEnv(envVarName: string): string {
        const filePath = process.env[envVarName];

        if (!filePath) {
            throw new Error(`La variable de entorno ${envVarName} no está definida`);
        }

        const absolutePath = path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Archivo no encontrado: ${absolutePath}`);
        }

        return fs.readFileSync(absolutePath, 'utf-8').trim();
    }

    static loadBinaryFromEnv(envVarName: string): Buffer {
        const filePath = process.env[envVarName];
        if (!filePath) {
            throw new Error(`Variable ${envVarName} no definida`);
        }

        const absolutePath = path.resolve(process.cwd(), filePath);

        return fs.readFileSync(absolutePath);
    }
}

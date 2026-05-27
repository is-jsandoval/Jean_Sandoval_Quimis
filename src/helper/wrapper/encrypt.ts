import * as Forge from "node-forge";    

export default class Encrypt {

    private static readonly RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCp2yn+A7cokoY7JsMVxVND1u5f
    j6lMussCchgiiERBnq2hItKtPEckpqfaWclTmksv6/I8AYxu7JbRPZUAtoi0EZJt
    JHYPUX2/Rkoo9aSLF0YGqWcZzlMVMjawjTmIeH5zUEYmcPeRje5bw+1VkCck1bKM
    FiaUv/dO1Ir9/xGhCwIDAQAB
    -----END PUBLIC KEY-----`


    private static readonly _publicKey = `MIICCgKCAgEAuPxFkA1tps0r0hgokfQ5sR8xD254BIUj6ZfxfeCtterkx8oEIf58IJ+ft83Wi/uCRnPZeghNcwghw4Hs2ntRLw2m68U2MYQeDJCSWw8VcY74KHvxIa6S3SAHUUAWdQbqgoQ2Gf6HJA1CFI8tHVH+KAdFmIowybs4hvlcEtzfcylqVRN2Hj0P6CR/S3xUxhlYpw5Ala5YYU/qgd8C/UFs7lgYgr/Z9vWt7HuJOnZJgUWq6043kyT7+KXrPlk70uZ/XWj6RVWG+Hm9dp4yxz0vbcAKAIPaSAzn14rI+v7gcSQml7bPdRP1+vDXR2ShOKvdj0nXXKkr/M3Dcnd46/elEW4D0IsdJq1iuU4YHzNHLybGANbdtYbJ2/O8qOUiLpPuMVPfuE3Fzk4XeOur8fJ++A8g/0IoFmwOws3q1RjmEtaFBbxUAkJV/s58dP/uJHQrGj4Wj70DB93Ix26c1XPIOF/odTXcHXH4I8F4Q6Efi2z/yAtzmxhcP3NOPU0jHO8hC9OX6rvrtdOIcYsrN5Lx7rcCfJi9pTakSreaqNR1giExIp70t3weH+qO05r8tFxCG3IsUIX72fbDh+m9jE7tygAir/YWG5gt85JhiebKn4FFW2iGmEzcvRYwemG3h34N4KKzMGL3iNkytWXCKtmXC/7EL3zSOf/l4TqgWWBC3e0CAwEAAQ==`;

    private static encrypt(valueToEncrypt: any, publicKeyPem: string): string {
        const publicKey = Forge.pki.publicKeyFromPem(publicKeyPem);
        const stringified = typeof valueToEncrypt === "string"
            ? valueToEncrypt
            : JSON.stringify(valueToEncrypt);
        const encrypted = publicKey.encrypt(stringified);
        return Buffer.from(encrypted, "binary").toString("base64");
    }

    private static encryptWpos(valueToEncrypt: any, publicKeyPem: string): string {
        const publicKey = Forge.pki.publicKeyFromAsn1(Forge.asn1.fromDer(Forge.util.decode64(publicKeyPem)));
        const stringified = typeof valueToEncrypt === "string"
            ? valueToEncrypt
            : JSON.stringify(valueToEncrypt);

            const encr = {
                md: Forge.md.sha256.create(), // Match OAEP with SHA256
                mgf1: {
                  md: Forge.md.sha256.create()
                }
              }

        const encrypted = publicKey.encrypt(Forge.util.encodeUtf8(stringified), 'RSA-OAEP', encr);
        return Buffer.from(encrypted, "binary").toString("base64");
    }

    static async encryptWithPublicKey(valueToEncrypt: any) {
        return this.encrypt(valueToEncrypt, this.RSA_PUBLIC_KEY_PEM);

    }

    static async encryptForAuthorizer(valueToEncrypt: any) {
        return this.encryptWpos(valueToEncrypt, this._publicKey);

    }
}
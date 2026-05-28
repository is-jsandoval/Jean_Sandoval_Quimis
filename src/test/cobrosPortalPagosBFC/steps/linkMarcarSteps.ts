import * as assert from "assert";
import { Given, When, Then } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";
import Assert from "../../../helper/wrapper/assert";

const requestHandler = new RequestHelper();
const hdrs = require("../data/v1/hdrs.json");
Given("Marcar {string} un link de pago con estado {string} para el endpoint marcar link",
  async function (estadoDestino: string, estadoLink: string) {
    this.extraHeaders = {};
    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }

    header.codigoAuditoria = "618596";
    header.estado = estadoDestino;
    header.codigoError = "00";
    this.hdrs = header

  }
);

When("Envío una solicitud {string} al endpoint {string} para el endpoint marcar link",
  async function (metodo, endpoint) {
    this.rp = await requestHandler.getResponseBody(
      null,
      endpoint,
      metodo,
      {},
      {
        ...this.hdrs,
        ...this.extraHeaders
      }
    );
    this.attach(JSON.stringify(this.rp, null, 2), "application/json");
    console.log("Respuesta recibida:", JSON.stringify(this.rp, null, 2));

  }
);

Then("el código de respuesta debe ser {string} para el endpoint marcar link",
  async function (status: string) {
    await Assert.assertStatus(String(this.rp?.status), String(status));
  }
);

Then("la respuesta data contiene todos los campos esperados para el link {string} para el endpoint marcar link",
  function (estadoLink: string) {
    const responseBody = this.rp?.responseBody;
    assert.ok(responseBody, "La respuesta no contiene responseBody");

    switch (estadoLink) {
      case "activo":
        const monto = responseBody.data.monto;
        assert.ok(monto !== undefined && monto !== null && monto !== "",
          `El campo 'monto' debe estar poblado. Valor recibido: ${monto}`
        );
        break;

      case "expirado":
        assert.strictEqual(
          responseBody.message,
          "El link de pagos expiró.",
          `Se esperaba mensaje 'El link de pagos expiró.', pero se obtuvo '${responseBody.message}'`
        );
        break;
      case "usado":
        assert.strictEqual(
          responseBody.message,
          "El link ya se encuentra pagado.",
          `Se esperaba mensaje 'El link ya se encuentra pagado.', pero se obtuvo '${responseBody.message}'`
        );
        break;
      case "bloqueado":
        assert.strictEqual(
          responseBody.message,
          "El link de pagos no existe.",
          `Se esperaba mensaje 'El link de pagos no existe.', pero se obtuvo '${responseBody.message}'`
        );
        break;
    }
  }
);
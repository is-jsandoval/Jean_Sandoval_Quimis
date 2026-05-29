import * as assert from "assert";
import { Given, When, Then } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";
import Assert from "../../../helper/wrapper/assert";
import { cambiarEstadoLink } from "../data/cobrosPortalPagosQueries";

import { generaLinkPagos } from "../../../helper/wrapper/linkPagosHelper";

const requestHandler = new RequestHelper();
const hdrs = require("../data/v1/hdrs.json");
Given("Existe un link de pago con estado {string} en endpoint consultar link",
  async function (estadoLink: string) {

    const auditNumber = await generaLinkPagos("11.11", "0954121646001", "Pago automatizado");
    this.extraHeaders = {};


    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }
    switch (estadoLink) {
      case "activo":
        header.codigoAuditoria = auditNumber;
        break;
      case "expirado":
        await this.dbs.linkPagos
          .request()
          .input("numero", auditNumber)
          .input("estado", "E")//.charAt(0).toUpperCase()
          .query(cambiarEstadoLink);
        header.codigoAuditoria = auditNumber;
        break;
      case "usado":
        await this.dbs.linkPagos
          .request()
          .input("numero", auditNumber)
          .input("estado", "U")//.charAt(0).toUpperCase()
          .query(cambiarEstadoLink);
        header.codigoAuditoria = auditNumber;
        break;
      case "bloqueado":
        header.codigoAuditoria = "999999";
        break;
      case "Inexistente":
        header.codigoAuditoria = "000000";
        break;
      case "vacio":
        header.codigoAuditoria = " ";
        break;

    }
    this.hdrs = header
  }
);
Given("No envío el header codigoAuditoria en endpoint consultar link",
  async function () {
    this.hdrs = {
      accept: "text/plain"
    };
  }
);

When("Envío una solicitud {string} al endpoint {string} en endpoint consultar link",
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

Then("el código de respuesta debe ser {string} en endpoint consultar link",
  async function (status: string) {
    await Assert.assertStatus(String(this.rp?.status), String(status));
  }
);

Then("la respuesta data contiene todos los campos esperados para el link {string} en endpoint consultar link",
  function (estadoLink: string) {
    const responseBody = this.rp?.responseBody;

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
      case "Inexistente":
        assert.strictEqual(
          responseBody.message,
          "El link de pagos no existe.",
          `Se esperaba mensaje 'El link de pagos no existe.', pero se obtuvo '${responseBody.message}'`
        );
        break;
      case "vacio":
        break;
    }
  }
);
////////////////////////////////////////////////////
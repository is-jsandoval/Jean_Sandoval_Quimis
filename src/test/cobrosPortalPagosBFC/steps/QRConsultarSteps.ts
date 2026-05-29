import * as assert from "assert";
import { Given, When, Then } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";
import Assert from "../../../helper/wrapper/assert";
import { cambiarEstadoLink } from "../data/cobrosPortalPagosQueries";

import { generaLinkPagos } from "../../../helper/wrapper/linkPagosHelper";

const requestHandler = new RequestHelper();
const hdrs = require("../data/v1/hdrs.json");
Given("Existe un link-QR con estado {string} en endpoint consultar link-QR",
  async function (estadoLink: string) {

    const auditNumber = await generaLinkPagos("11.11", "0954121646001", "Pago automatizado");
    this.extraHeaders = {};


    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }
    switch (estadoLink) {
      case "activo":
        header.accept = "text/plain";
        header.codigoAuditoria = "000002";
        break;
      case "inactivo":
        header.codigoAuditoria = "000006";
        break;

    }
    this.hdrs = header
  }
);
Given("No envío el header codigoAuditoria en endpoint consultar link-QR",
  async function () {
    this.hdrs = {
      accept: "text/plain"
    };
  }
);

When("Envío una solicitud {string} al endpoint {string} en endpoint consultar link-QR",
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

  }
);

Then("el código de respuesta debe ser {string} en endpoint consultar link-QR",
  async function (status: string) {
    await Assert.assertStatus(String(this.rp?.status), String(status));
  }
);

Then("la respuesta data contiene todos los campos esperados para el link {string} en endpoint consultar link-QR",
  async function (estadoLink: string) {
    const responseBody = this.rp?.responseBody;

    switch (estadoLink) {
      case "activo":
        const nombreComercio = responseBody.data.nombreComercio;
        this.attach(`Valor de nombreComercio: ${nombreComercio}`, "text/plain");
        assert.ok(nombreComercio !== undefined && nombreComercio !== null && nombreComercio !== "",
          `El campo 'nombreComercio' debe estar poblado. Valor recibido: ${nombreComercio}`
        );
        break;

      case "inactivo":
        const mensaje = this.rp.responseBody.message;
        await Assert.assertMensaje(mensaje, "No se encontró información del link.");
        break;
    }
  }
);
////////////////////////////////////////////////////
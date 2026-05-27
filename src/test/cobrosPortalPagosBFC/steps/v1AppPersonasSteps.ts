import { Given, When } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";



Given(
  "Existe un link de pago con estado {string}",
  async function (estadoLink: string) {

    switch (estadoLink) {

      case "activo":
        this.rqBody = {
          "token": tkn,
          "remoteIp": "https://172.26.60.45/credito-comercio/login"
        };
        break;
      default:
        throw new Error(`Estado de link no soportado: ${estadoLink}`);
    }
  }
);

When(
  "Envío una solicitud {string} a {string} {string} para la validacion de recaptcha",
  async function (metodo, endpoint, estado) {

    this.rp = await requestHandler.getResponseBody(
      null,
      endpoint,
      metodo,
      this.rqBody
    );

    console.info("asdf: ", this.rp.responseBody)
    this.attach(JSON.stringify(this.rp, null, 2), "application/json");

  }
);

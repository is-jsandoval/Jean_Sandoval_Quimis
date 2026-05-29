Feature: Marcar link de pago
  @cobrosPortalPagosBFC
  Scenario Outline: TC - BFC - Link - Validar cambio exitoso desde estado activo hacia "<estadoDestino>"
    Given Marcar "<estadoDestino>" un link de pago con estado "A" para el endpoint marcar link
    When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar" para el endpoint marcar link
    Then el código de respuesta debe ser "200" para el endpoint marcar link
    And el estado del link debe actualizarse a "<estadoDestino>" para el endpoint marcar link
    Examples:
      | estadoDestino |
      | N             |
      | U             |

  @cobrosPortalPagosBFC
  Scenario Outline: TC - BFC - Link - Validar transición no permitida desde "<estadoActual>" hacia "<estadoDestino>"
    Given Existe un link de pago con estado "<estadoActual>" para el endpoint marcar link a estado "<estadoDestino>"
    When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar" para el endpoint marcar link
    Then el código de respuesta debe ser "400" para el endpoint marcar link
    And la respuesta contiene el mensaje "<mensaje>" para el endpoint marcar link

    Examples:
      | estadoActual | estadoDestino | mensaje                                           |
      | N            | U             | No se pudo actualizar el estado del link de pago. |
      | N            | A             | Estado no valido.                                 |
      | U            | N             | No se pudo actualizar el estado del link de pago. |
      | U            | A             | Estado no valido.                                 |
      | E            | A             | Estado no valido.                                 |
      | E            | U             | No se pudo actualizar el estado del link de pago. |
      | A            | E             | Estado no valido.                                 |

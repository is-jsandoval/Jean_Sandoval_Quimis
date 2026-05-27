Feature: Consultar link de pago

  @bfc @link_pago @consulta_exitosa
  Scenario Outline: TC - BFC - Link - Validar endpoint consultar que retorna correctamente un link <estadoLink>
    Given Existe un link de pago con estado "<estadoLink>"
    When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
    Then el código de respuesta debe ser 200
    And la respuesta contiene el campo "data"
    And el estado del link debe ser "<codigoEstado>"

    Examples:
      | estadoLink | codigoEstado |
      | activo     | A             |
  #     | expirado   | E             |
  #     | usado      | U             |
  #     | bloqueado  | N             |



  #   @bfc @link_pago @validacion
  # Scenario: TC - BFC - Link - Validar consulta sin codigoAuditoria
  #   Given No envío el header "codigoAuditoria"
  #   When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
  #   Then el código de respuesta debe ser 400



  #   @bfc @link_pago @validacion
  # Scenario: TC - BFC - Link - Validar consulta con codigoAuditoria inválido
  #   Given Envío el header "codigoAuditoria" inválido
  #   When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
  #   Then el código de respuesta debe ser 400


  #   @bfc @link_pago @contrato
  # Scenario: TC - BFC - Link - Validar estructura de respuesta del endpoint consultar
  #   Given Existe un link válido
  #   When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
  #   Then el código de respuesta debe ser 200
  #   And la respuesta contiene el objeto "data"
  #   And el campo "monto" debe ser decimal
  #   And el campo "fechaExpira" debe ser tipo fecha
  #   And el campo "nombreCliente" debe ser string
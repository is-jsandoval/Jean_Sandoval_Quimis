Feature: Consultar link de pago

  @cobrosPortalPagosBFC @sprint_2026_P2_11
  Scenario Outline: TC - BFC - Link - Validar endpoint consultar QR que retorna correctamente un linkQR con estado "<estadoLink>"
    Given Existe un link-QR con estado "<estadoLink>" en endpoint consultar link-QR
    When Envío una solicitud "GET" al endpoint "/link-pago/v1/qr/consultar" en endpoint consultar link-QR
    Then el código de respuesta debe ser "<codigoRespuesta>" en endpoint consultar link-QR
    And la respuesta data contiene todos los campos esperados para el link "<estadoLink>" en endpoint consultar link-QR

    Examples:
      | estadoLink  | codigoEstado | codigoRespuesta |
      | activo      | A            |             200 |
      | inactivo    | I            |             400 |
     

  @cobrosPortalPagosBFC @sprint_2026_P2_11
  Scenario: TC - BFC - Link - Validar consulta sin codigoAuditoria
    Given No envío el header codigoAuditoria en endpoint consultar link-QR
    When Envío una solicitud "GET" al endpoint "/link-pago/v1/qr/consultar" en endpoint consultar link-QR
    Then el código de respuesta debe ser "400" en endpoint consultar link-QR

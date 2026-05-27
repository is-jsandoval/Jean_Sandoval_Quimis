import { request } from "playwright/test";

const BASE_URL = 'http://172.26.60.165/Bg.LdapService.ws/LDAPService.asmx';

export async function deleteUserAccount(username: string) {

  const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:DeleteUserAccount>
      <tem:Application>PortalComercios</tem:Application>
      <tem:User>${username}</tem:User>
      <tem:canal>Comercios</tem:canal>
      <tem:opid>Comercios</tem:opid>
      <tem:terminal>Comercios</tem:terminal>
    </tem:DeleteUserAccount>
  </soapenv:Body>
</soapenv:Envelope>
`;

  const apiContext = await request.newContext();

  try {
    const response = await apiContext.post(BASE_URL, {
      headers: {
        'Content-Type': 'text/xml;charset=utf-8',
        'SOAPAction': '"http://tempuri.org/DeleteUserAccount"',
      },
      data: soapEnvelope,
    });

    const responseText = await response.text();

    console.info('\nRespuesta:', responseText);
    return responseText;

  } catch (error: any) {
    console.error('\nError al llamar al servicio SOAP:', error.message);
  }
}


export async function PasswordReset(username: string) {

  const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:PasswordReset>
         <tem:Application>PortalComercios</tem:Application>
         <tem:userLogin>${username}</tem:userLogin>
         <tem:NewPassword>Bg123456.</tem:NewPassword>
         <tem:opcChangeNextSesion>false</tem:opcChangeNextSesion>
         <tem:autogenerar>false</tem:autogenerar>
         <tem:canal>Comercios</tem:canal>
         <tem:opid>Comercios</tem:opid>
         <tem:terminal>Comercios</tem:terminal>
      </tem:PasswordReset>
   </soapenv:Body>
</soapenv:Envelope>
`;

  const apiContext = await request.newContext();

  try {
    const response = await apiContext.post(BASE_URL, {
      headers: {
        'Content-Type': 'text/xml;charset=utf-8',
        'SOAPAction': '"http://tempuri.org/PasswordReset"',
      },
      data: soapEnvelope,
    });

    const responseText = await response.text();

    console.info('Respuesta:', responseText);
    return responseText;

  } catch (error: any) {
    console.error('Error al llamar al servicio SOAP:', error.message);
  }
}
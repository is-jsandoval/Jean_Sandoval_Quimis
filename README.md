# Proyecto de Automatización de Pruebas API

Este proyecto es una solución para la automatización de pruebas de APIs utilizando tecnologías como **Gherkin**, **Cucumber**, **Playwright**, y **TypeScript**. Su objetivo es realizar pruebas de escenarios escritos en lenguaje natural y validar las respuestas de las APIs a través de solicitudes HTTP.

## Tecnologías Utilizadas

- **Gherkin**: Para la definición de escenarios de prueba en lenguaje natural, facilitando la colaboración entre equipos técnicos y no técnicos.
- **Cucumber**: Para ejecutar los escenarios definidos en Gherkin y organizar las pruebas siguiendo la metodología BDD (Behavior Driven Development).
- **Playwright**: Utilizado para interactuar con las APIs, enviar solicitudes HTTP y manejar respuestas.
- **TypeScript**: Lenguaje de programación tipado que ayuda a mejorar la calidad del código y facilita la detección de errores en tiempo de desarrollo.
- **Node.js**: Plataforma para ejecutar JavaScript/TypeScript en el lado del servidor.
- **Visual Studio Code**: IDE utilizado para el desarrollo y configuración del proyecto.
  
## Estructura del Proyecto

El proyecto sigue una estructura clara y organizada para facilitar el desarrollo, mantenimiento y escalabilidad.

```
src/
 ├── helper/
 │    ├── database/
 │    │    ├── oracle/
 │    │    ├── sqlite/
 │    ├── env/
 │    │    ├── .env.desa
 │    │    ├── env.ts
 │    ├── report/
 │    │    ├── report.ts
 │    ├── util/
 │    │    ├── ForgeUtils.ts
 │    │    ├── logger.ts
 │    ├── wrapper/
 │    │    ├── assert.ts
 │    │    ├── HttpContextManager.ts
 │    │    ├── OTPcontextManager.ts
 │    │    ├── RequestHelper.ts
 ├── hooks/
 │    ├── hooks.ts
 ├── test/
 │    ├── data/
 │    ├── features/    
 │    ├── steps/         
test-results/
```

### Descripción de Carpetas

- **src/helper/**: 
  - **database/**: Contiene módulos para manejar conexiones con bases de datos, incluyendo **oracle** y **sqlite**.
  - **env/**: Almacena configuraciones del entorno, como variables de entorno y configuraciones en TypeScript.
  - **report/**: Scripts para generar reportes de los resultados de las pruebas.
  - **util/**: Funciones utilitarias, como **ForgeUtils.ts** para operaciones de soporte y **logger.ts** para registrar eventos y logs.
  - **wrapper/**: Módulos de abstracción que simplifican interacciones. Por ejemplo, **HttpContextManager.ts** gestiona contextos de solicitudes HTTP y **RequestHelper.ts** facilita las solicitudes HTTP.

- **src/hooks/**: 
  Define hooks que se ejecutan antes o después de las pruebas, usando el archivo **hooks.ts**.

- **test/**:
  - **data/**: Almacena datos de prueba reutilizables, como JSON o CSV.
  - **features/**: Contiene los archivos `.feature` escritos en Gherkin, que definen los escenarios de prueba.
  - **steps/**: Implementación de los pasos para los escenarios Gherkin en TypeScript.

- **test-results/**:
  Carpeta donde se almacenan los reportes generados después de la ejecución de las pruebas. Estos reportes incluyen detalles de las pruebas realizadas, el tiempo de ejecución, y si las pruebas fueron exitosas o fallaron.

## Instalación y Configuración

### Requisitos Previos

- **Node.js** (v16 o superior)
- **npm** (o **yarn**) como gestor de paquetes

### Instalación

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone https://bancoguayaquil@dev.azure.com/bancoguayaquil/automatizacion-QA/_git/automatizacion-QA
   cd proyecto-automatizacion-api
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```


3. Configura las variables de entorno en el archivo `.env.desa` dentro del directorio **src/helper/env/**. Asegúrate de que los valores de las API y bases de datos estén correctamente configurados.

### Ejecución de las Pruebas

Para ejecutar las pruebas definidas en los archivos `.feature`, puedes utilizar el siguiente comando:

```bash
npm run test
```

Esto ejecutará las pruebas utilizando **Cucumber** y generará un reporte HTML en la carpeta **test-results/**.

### Generación de Reportes

Los resultados de las pruebas se almacenan en la carpeta **test-results/**. El archivo principal es un reporte HTML generado automáticamente que puedes abrir en tu navegador para ver los detalles de la ejecución.

```bash
test-results/cucumber-report.html
```


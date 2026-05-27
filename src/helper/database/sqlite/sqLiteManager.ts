import * as sqlite3 from 'sqlite3';

class SQLiteConnection {

  private readonly db: sqlite3.Database;

  constructor(databasePath: string) {
    this.db = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error al abrir la base de datos:', err.message);
      } else {
        console.info('Conexión exitosa a la base de datos');
      }
    });
  }

  public async ejecutarSQL(query: string) {
    this.db.run(query, (err) => {
      if (err) {
        console.error('\nError al ejecutar el query:', err.message);
      } else {
        console.info('\nQuery ejecutado exitosamente.');
      }
    });
  }

  public async create(nombreDeTabla: string, columnasSQL: Record<string, string>, columnas: string[] = [], datos: object[] = []) {
    const nombreTabla = nombreDeTabla;
    try {
      const tablaExistente = await this.tablaExiste(this.db, nombreTabla);
      if (!tablaExistente) {
        console.info(`La tabla '${nombreTabla}' no existe. Creando tabla...`);
        await this.crearTabla(nombreTabla, columnasSQL);
        await this.insertData(nombreTabla, columnas, datos);
      } else {
        console.info(`La tabla '${nombreTabla}' ya existe.`);
      }
    } catch (error) {
      console.error('Error durante la creación de la tabla o consulta de datos:', error);
    }
  }

  public crearTabla(
    nombreTabla: string,
    columnas: Record<string, string>
  ): Promise<void> {

    const columnasSQL = Object.entries(columnas)
      .map(([nombre, tipo]) => `${nombre} ${tipo}`)
      .join(", ");

    return new Promise((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${nombreTabla} (${columnasSQL})`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }


  public tablaExiste(db: sqlite3.Database, nombreTabla: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [nombreTabla],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(!!row);
          }
        }
      );
    });
  }

  public insertData(nombreTabla: string, columnas: string[], datos: object[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(datos) || datos.length === 0) {
        return reject(new Error('El array de datos está vacío o es inválido.'));
      }

      const placeholders = datos.map(() => `(${columnas.map(() => '?').join(',')})`).join(',');
      const valores: any[] = [];

      datos.forEach((fila) => {
        columnas.forEach((columna) => {
          valores.push(fila[columna] || null); // Valores faltantes se reemplazan con `null`
        });
      });

      const query = `INSERT INTO ${nombreTabla} (${columnas.join(',')}) VALUES ${placeholders}`;
      this.db.run(query, valores, (err) => {
        if (err) {
          reject(new Error(`Error al insertar datos en la tabla '${nombreTabla}': ${err.message}`));
        } else {
          console.info(`Datos insertados en la tabla '${nombreTabla}' exitosamente.`);
          resolve();
        }
      });
    });
  }

  public async consultaUsuario(nombreTabla: string, asdf?: string): Promise<UsuarioNormalizado> {
    let query = `SELECT * FROM ${nombreTabla}`;

    if (asdf) {
      query = asdf
    }


    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        if (!rows || rows.length === 0) {
          reject(new Error(`No existen registros en la tabla ${nombreTabla}`));
          return;
        }

        const row = rows[Math.floor(Math.random() * rows.length)] as UsuarioSQLiteRow;

        const usuarioNormalizado: UsuarioNormalizado = {
          user: row.usuario ?? 'SRV_AUTOMATION',
          cedula: row.identificacion ?? row.cedula ?? '',
          contexto: row.producto ?? row.rol ?? ''
        };

        if (!usuarioNormalizado.cedula) {
          reject(new Error(`No se pudo obtener CEDULA desde ${nombreTabla}`));
          return;
        }

        // Variables de entorno (si decides seguir usándolas)
        process.env.USER = usuarioNormalizado.user;
        process.env.CEDULA = usuarioNormalizado.cedula;
        process.env.CONTEXTO = usuarioNormalizado.contexto;

        resolve(usuarioNormalizado);
      });
    });
  }



  public async consultaIdentificacion(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.get<{ identificacion: string }>(
        `SELECT identificacion FROM users WHERE usuario = ?;`,
        [process.env.USER],
        (err, row) => {
          if (err) return reject(err);
          const id = row?.identificacion ?? '';
          resolve(id);
        }
      );
    });
  }



  public async consultaListaDeUsuarios(): Promise<Usuarios[]> {
    const query = 'SELECT * FROM usuarios';
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows: []) => {
        if (err) {
          console.error('Error al realizar la consulta:', err);
          reject(err);
        } else {
          console.info("\nrows: ", rows);
          resolve(rows);
        }
      });
    });
  }
  public consultaRandom<T = any>(query: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return reject(new Error('No se encontraron registros'));
        resolve(rows[Math.floor(Math.random() * rows.length)] as T);
      });
    });
  }

  public close(): void {
    try {
      this.db.close((err) => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err.message);
        } else {
          console.info('Conexión cerrada correctamente');
        }
      });
    } catch (error) {
      console.error('Error inesperado al cerrar la conexión:', error);
    }
  }

}

export interface Usuarios {
  id: number;
  identificacion: string;
  usuario: string;
  cuenta: string
}

interface UsuarioNormalizado {
  user: string;
  cedula: string;
  contexto: string; // puede ser producto o rol
}
interface UsuarioSQLiteRow {
  usuario?: string;
  identificacion?: string;
  cedula?: string;
  producto?: string;
  rol?: string;
}

export default SQLiteConnection;
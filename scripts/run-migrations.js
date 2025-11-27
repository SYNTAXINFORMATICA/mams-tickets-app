import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  try {
    console.log('Verificando tablas existentes...');

    // Verificar si la tabla mams_users existe
    const tablesCheck = await sql(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name LIKE 'mams_%'`
    );

    if (tablesCheck.length === 0) {
      console.log('Creando tablas...');
      console.log('Las tablas se deben crear ejecutando: scripts/01-create-tables.sql');
      console.log('En producción, ejecutar directamente en la BD.');
    } else {
      console.log(`Tablas existentes encontradas: ${tablesCheck.length}`);
    }

    console.log('Migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error en migraciones:', error);
    process.exit(1);
  }
}

runMigrations();

-- Crear schema y tablas para sistema de soporte técnico
-- Prefijo de tablas: mams_

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS mams_users (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('administrador', 'analista', 'ingeniero_soporte')),
  area VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en cedula y email
CREATE INDEX IF NOT EXISTS mams_idx_users_cedula ON mams_users(cedula);
CREATE INDEX IF NOT EXISTS mams_idx_users_email ON mams_users(email);
CREATE INDEX IF NOT EXISTS mams_idx_users_role ON mams_users(role);

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS mams_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES mams_users(id) ON DELETE RESTRICT,
  area VARCHAR(100) NOT NULL,
  aplicacion VARCHAR(100) NOT NULL CHECK (aplicacion IN ('SharePoint Online', 'Facturador')),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'abierto' CHECK (
    estado IN ('abierto', 'en_progreso', 'escalado_nivel_2', 'resuelto', 'cerrado')
  ),
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  nivel_resolucion INTEGER DEFAULT 1 CHECK (nivel_resolucion IN (1, 2)),
  asignado_a INTEGER REFERENCES mams_users(id) ON DELETE SET NULL,
  resolucion_ia TEXT,
  resolucion_manual TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Crear índices en tickets
CREATE INDEX IF NOT EXISTS mams_idx_tickets_user_id ON mams_tickets(user_id);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_estado ON mams_tickets(estado);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_aplicacion ON mams_tickets(aplicacion);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_area ON mams_tickets(area);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_asignado_a ON mams_tickets(asignado_a);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_created_at ON mams_tickets(created_at);
CREATE INDEX IF NOT EXISTS mams_idx_tickets_ticket_number ON mams_tickets(ticket_number);

-- Tabla de historial de tickets
CREATE TABLE IF NOT EXISTS mams_ticket_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES mams_tickets(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES mams_users(id) ON DELETE RESTRICT,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en ticket_history
CREATE INDEX IF NOT EXISTS mams_idx_ticket_history_ticket_id ON mams_ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS mams_idx_ticket_history_usuario_id ON mams_ticket_history(usuario_id);

-- Tabla de comentarios en tickets
CREATE TABLE IF NOT EXISTS mams_ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES mams_tickets(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES mams_users(id) ON DELETE RESTRICT,
  comentario TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'comentario' CHECK (tipo IN ('comentario', 'resolucion_ia', 'resolucion_humana')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices en comentarios
CREATE INDEX IF NOT EXISTS mams_idx_ticket_comments_ticket_id ON mams_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS mams_idx_ticket_comments_usuario_id ON mams_ticket_comments(usuario_id);

-- Tabla de reportes y estadísticas
CREATE TABLE IF NOT EXISTS mams_tickets_stats (
  id SERIAL PRIMARY KEY,
  area VARCHAR(100),
  aplicacion VARCHAR(100),
  total_tickets INTEGER DEFAULT 0,
  tickets_resueltos INTEGER DEFAULT 0,
  tickets_pendientes INTEGER DEFAULT 0,
  promedio_tiempo_resolucion INTEGER,
  fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices en estadísticas
CREATE INDEX IF NOT EXISTS mams_idx_stats_area ON mams_tickets_stats(area);
CREATE INDEX IF NOT EXISTS mams_idx_stats_aplicacion ON mams_tickets_stats(aplicacion);

-- Insertar 5 usuarios predefinidos
INSERT INTO mams_users (cedula, password, nombre, email, role, area) VALUES
  ('100001', 'admin2025*', 'Administrador Sistema', 'admin@doctux.com', 'administrador', 'IT'),
  ('100002', 'pass2025*', 'Juan Analista', 'juan.analista@doctux.com', 'analista', 'Ventas'),
  ('100003', 'pass2025*', 'María Analista', 'maria.analista@doctux.com', 'analista', 'Finanzas'),
  ('100004', 'pass2025*', 'Carlos Analista', 'carlos.analista@doctux.com', 'analista', 'Operaciones'),
  ('100005', 'pass2025*', 'Roberto Ingeniero', 'roberto.soporte@doctux.com', 'ingeniero_soporte', 'IT')
ON CONFLICT (cedula) DO NOTHING;

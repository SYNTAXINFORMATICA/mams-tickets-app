# Guía de Configuración - Doctux Sistema de Soporte Técnico

## Inicio Rápido Local

### 1. Clonar repositorio
\`\`\`bash
git clone <repo-url>
cd doctux
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Crear archivo `.env.local`:

\`\`\`env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/doctux-db

# Azure OpenAI / GPT-5
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here

# Autenticación
NEXTAUTH_SECRET=generate-with-openssl-rand-hex-32
NEXTAUTH_URL=http://localhost:3000

# Node
NODE_ENV=development
\`\`\`

### 4. Configurar Base de Datos Local (Opcional)

Si usas PostgreSQL local:

\`\`\`bash
# Crear base de datos
createdb doctux-db

# Ejecutar script de creación
psql -d doctux-db -f scripts/01-create-tables.sql
\`\`\`

### 5. Iniciar servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

Acceder a: http://localhost:3000/login

### Usuarios de Prueba

| Cédula | Contraseña | Rol |
|--------|-----------|-----|
| 100001 | admin2025* | Administrador |
| 100002 | pass2025* | Analista |
| 100003 | pass2025* | Analista |
| 100004 | pass2025* | Analista |
| 100005 | pass2025* | Ingeniero de Soporte |

## Despliegue en Producción (Azure)

Ver: [azure-deploy.md](./azure-deploy.md)

## Características Principales

### Dashboard de Tickets
- Vista de todos los tickets con filtros y ordenamiento
- Estados: Abierto, En Progreso, Escalado Nivel 2, Resuelto, Cerrado
- Prioridades: Baja, Media, Alta, Urgente

### IA Nivel 1 (Resolución Automática)
- Análisis automático de incidencias
- Intenta resolver problemas comunes
- Escala problemas complejos a Nivel 2

### Gestión Manual Nivel 2
- Ingenieros de soporte manejan casos escalados
- Pueden cerrar tickets con resolución manual
- Historial completo de cambios

### Reportes
- Tickets por área (pregunta: ¿Cuál es el área con más tickets?)
- Tickets por aplicación (pregunta: ¿Cuáles son las apps con más incidencias?)
- Estadísticas de resolución (IA vs Humanos)
- Tiempo promedio de resolución

### Roles y Permisos

**Administrador (100001)**
- Ver todos los tickets
- Editar y borrar tickets
- Procesar con IA
- Ver reportes
- Cerrar tickets

**Analista (100002, 100003, 100004)**
- Crear tickets
- Ver todos los tickets
- Ver detalles (solo lectura)

**Ingeniero de Soporte (100005)**
- Ver todos los tickets
- Procesar con IA
- Asignar tickets a sí mismo
- Cerrar tickets con resolución manual
- Ver reportes

## Estructura de Carpetas

\`\`\`
doctux/
├── app/
│   ├── api/
│   │   ├── auth/            # Endpoints de autenticación
│   │   ├── tickets/         # Endpoints de tickets
│   │   └── reports/         # Endpoints de reportes
│   ├── dashboard/           # Páginas protegidas
│   ├── login/               # Página de login
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── auth/                # Componentes de autenticación
│   ├── dashboard/           # Componentes del dashboard
│   └── ui/                  # Componentes de UI (shadcn)
├── lib/
│   ├── db.ts               # Conexión a BD
│   ├── azure-ai.ts         # Integración con IA
│   └── auth-utils.ts       # Utilidades de auth
├── hooks/
│   └── use-auth.ts         # Hook para autenticación
├── scripts/
│   ├── 01-create-tables.sql
│   └── run-migrations.js
├── middleware.ts           # Middleware de autenticación
└── .env.example            # Ejemplo de variables
\`\`\`

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/[id]` - Obtener detalle
- `PUT /api/tickets/[id]` - Actualizar ticket
- `DELETE /api/tickets/[id]` - Borrar ticket (solo admin)
- `POST /api/tickets/[id]/resolve` - Procesar con IA
- `POST /api/tickets/[id]/assign` - Asignar a ingeniero
- `POST /api/tickets/[id]/close` - Cerrar ticket

### Reportes
- `GET /api/reports/stats` - Estadísticas generales

## Seguridad

- Autenticación basada en sesiones con cookies httpOnly
- Middleware que protege rutas
- Control de acceso por roles
- Validación en servidor (nunca confiar en cliente)
- Variables sensibles en variables de entorno

## Notas Importantes

1. **Contraseñas**: En desarrollo se almacenan en texto plano. En producción, usar bcrypt.
2. **IA**: Requiere credenciales válidas de Azure OpenAI.
3. **Base de datos**: Solo PostgreSQL. No soporta otras BDs por el momento.
4. **Escalabilidad**: Diseñado para 5 usuarios de prueba. Para más usuarios, considerar optimizaciones de BD.

## Soporte

Para problemas o dudas:
1. Revisar [azure-deploy.md](./azure-deploy.md)
2. Verificar variables de entorno
3. Revisar logs de la aplicación
4. Contactar al equipo de desarrollo

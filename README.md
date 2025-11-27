# Doctux - Sistema Inteligente de Soporte Técnico

Doctux es una plataforma integral de gestión de tickets de soporte técnico que integra inteligencia artificial (GPT-5) para resolver automáticamente incidencias de Nivel 1, con escalado a soporte humano para problemas complejos.

## Características

### 🤖 Resolución Automática con IA
- Análisis inteligente de incidencias técnicas
- Resolución automática de problemas comunes
- Escalado inteligente a Nivel 2 para casos complejos
- Integración con GPT-5 en Azure

### 📊 Dashboard Intuitivo
- Vista unificada de todos los tickets
- Filtros por estado, aplicación y área
- Ordenamiento por múltiples criterios
- Semáforos visuales de prioridad y estado

### 👥 Gestión de Usuarios
- 3 roles predefinidos: Administrador, Analista, Ingeniero de Soporte
- 5 usuarios de prueba preconfigurados
- Control de acceso basado en roles

### 📈 Reportes Avanzados
- Tickets por área (responde: ¿Cuál es el área con más incidencias?)
- Tickets por aplicación (responde: ¿Cuáles son las apps con más problemas?)
- Tasa de resolución IA vs Humanos
- Tiempo promedio de resolución
- Gráficos y estadísticas en tiempo real

### 🔒 Seguridad
- Autenticación por cédula y contraseña
- Control de sesiones con cookies httpOnly
- Middleware de protección de rutas
- Validación en servidor

## Stack Tecnológico

- **Frontend**: React 19.2 + TypeScript + Tailwind CSS v4
- **Backend**: Next.js 16 (App Router)
- **Base de Datos**: PostgreSQL en Azure
- **IA**: Azure OpenAI GPT-5
- **Gráficos**: Recharts
- **UI**: Shadcn/ui
- **Runtime**: Node.js v24

## Instalación

### Requisitos
- Node.js v24+
- PostgreSQL 15+
- Cuenta de Azure con créditos

### Pasos

1. **Clonar repositorio**
   \`\`\`bash
   git clone https://github.com/your-org/doctux.git
   cd doctux
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar variables de entorno**
   \`\`\`bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales
   \`\`\`

4. **Crear base de datos**
   \`\`\`bash
   psql -d doctux-db -f scripts/01-create-tables.sql
   \`\`\`

5. **Iniciar servidor**
   \`\`\`bash
   npm run dev
   \`\`\`

   Acceder a: `http://localhost:3000`

## Usuarios de Prueba

| Cédula | Contraseña | Rol |
|--------|-----------|-----|
| 100001 | admin2025* | Administrador |
| 100002 | pass2025* | Analista |
| 100003 | pass2025* | Analista |
| 100004 | pass2025* | Analista |
| 100005 | pass2025* | Ingeniero de Soporte |

## Estructura del Proyecto

\`\`\`
doctux/
├── app/
│   ├── api/                 # API Routes
│   ├── dashboard/           # Páginas protegidas
│   ├── login/              # Página de login
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── auth/               # Componentes de auth
│   ├── dashboard/          # Componentes del dashboard
│   └── ui/                 # Componentes reutilizables
├── lib/
│   ├── db.ts              # Conexión a BD
│   ├── azure-ai.ts        # Integración con IA
│   └── auth-utils.ts      # Utilidades
├── hooks/
│   └── use-auth.ts        # Hook de autenticación
├── scripts/
│   ├── 01-create-tables.sql
│   └── run-migrations.js
├── middleware.ts          # Middleware de auth
└── .env.example          # Variables de entorno
\`\`\`

## Flujo de Tickets

\`\`\`
1. Analista crea ticket
   ↓
2. Sistema procesa con IA (Nivel 1)
   ├─ ✓ Resuelve → Ticket cerrado
   └─ ✗ Escala → Asignar a Ingeniero
   ↓
3. Ingeniero de soporte (Nivel 2)
   ├─ Revisa
   ├─ Resuelve manualmente
   └─ Cierra ticket
\`\`\`

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obtener usuario

### Tickets
- `GET /api/tickets` - Listar
- `POST /api/tickets` - Crear
- `GET /api/tickets/[id]` - Detalle
- `PUT /api/tickets/[id]` - Actualizar
- `DELETE /api/tickets/[id]` - Borrar
- `POST /api/tickets/[id]/resolve` - Procesar con IA
- `POST /api/tickets/[id]/close` - Cerrar

### Reportes
- `GET /api/reports/stats` - Estadísticas

## Despliegue

### Azure App Service

Ver guía completa en [azure-deploy.md](./azure-deploy.md)

Resumen rápido:
\`\`\`bash
# 1. Crear recursos en Azure
az group create --name doctux-rg --location eastus

# 2. Configurar BD PostgreSQL
az postgres flexible-server create ...

# 3. Crear Web App
az webapp create ...

# 4. Desplegar
git push azure main
\`\`\`

### Variables de Entorno en Producción
- `DATABASE_URL` - Conexión PostgreSQL
- `AZURE_OPENAI_ENDPOINT` - Endpoint de Azure OpenAI
- `AZURE_OPENAI_API_KEY` - API Key
- `NEXTAUTH_SECRET` - Secreto de sesión
- `NEXTAUTH_URL` - URL de la app

## Rendimiento y Escalabilidad

- **Diseñado para**: 5 usuarios de prueba
- **Base de datos**: Índices optimizados en tablas principales
- **Caché**: Implementar Redis para sesiones en escala

## Seguridad

- ✓ Autenticación con sesiones httpOnly
- ✓ CSRF protection
- ✓ Control de acceso por roles
- ✓ Validación en servidor
- ✓ SQL: Parametrizadas (sin SQL injection)

## Próximas Mejoras

- [ ] Autenticación OAuth (Microsoft 365)
- [ ] Notificaciones por correo
- [ ] Asignación automática de ingenieros
- [ ] Machine learning para predicción de resoluciones
- [ ] Integración con Jira/Azure DevOps
- [ ] Mobile app
- [ ] Análisis de sentimiento en tickets

## Soporte

- Documentación: Ver SETUP.md y azure-deploy.md
- Issues: Crear en GitHub
- Email: support@doctux.com

## Licencia

MIT

## Autor

Doctux Team

---

**¡Doctux - Soporte Técnico Inteligente!**

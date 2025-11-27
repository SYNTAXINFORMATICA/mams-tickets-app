# Guía de Despliegue en Azure

## Requisitos Previos

1. **Cuenta de Azure** con suscripción activa
2. **Azure CLI** instalado (https://learn.microsoft.com/cli/azure/install-azure-cli)
3. **Node.js v24** instalado
4. **Git** instalado

## Paso 1: Preparar Base de Datos PostgreSQL

### Crear instancia PostgreSQL en Azure

\`\`\`bash
az postgres flexible-server create \
  --resource-group doctux-rg \
  --name doctux-db \
  --admin-user doctux-admin \
  --admin-password YourPassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15
\`\`\`

### Crear base de datos

\`\`\`bash
az postgres flexible-server db create \
  --resource-group doctux-rg \
  --server-name doctux-db \
  --database-name doctux-db
\`\`\`

### Ejecutar script SQL

\`\`\`bash
psql -h doctux-db.postgres.database.azure.com \
  -U doctux-admin \
  -d doctux-db \
  -f scripts/01-create-tables.sql
\`\`\`

## Paso 2: Configurar Azure OpenAI / GPT-5

### Crear recurso Azure OpenAI

\`\`\`bash
az cognitiveservices account create \
  --name doctux-openai \
  --resource-group doctux-rg \
  --kind OpenAI \
  --sku s0 \
  --location eastus \
  --custom-domain doctux-openai
\`\`\`

### Desplegar modelo GPT-5

\`\`\`bash
az cognitiveservices account deployment create \
  --name doctux-openai \
  --resource-group doctux-rg \
  --deployment-name gpt-5-chat-formacion \
  --model-name gpt-5 \
  --model-version 1.0
\`\`\`

## Paso 3: Crear Aplicación Web en Azure

### Crear App Service Plan

\`\`\`bash
az appservice plan create \
  --name doctux-plan \
  --resource-group doctux-rg \
  --sku B2 \
  --is-linux
\`\`\`

### Crear Web App

\`\`\`bash
az webapp create \
  --resource-group doctux-rg \
  --plan doctux-plan \
  --name doctux-app \
  --runtime "node|20"
\`\`\`

## Paso 4: Configurar Variables de Entorno

### Obtener credenciales

\`\`\`bash
# PostgreSQL Connection String
az postgres flexible-server connection-string show \
  --server-name doctux-db \
  --admin-user doctux-admin

# Azure OpenAI Keys
az cognitiveservices account keys list \
  --name doctux-openai \
  --resource-group doctux-rg
\`\`\`

### Configurar en Azure App Service

\`\`\`bash
az webapp config appsettings set \
  --resource-group doctux-rg \
  --name doctux-app \
  --settings \
    DATABASE_URL="postgresql://..." \
    AZURE_OPENAI_ENDPOINT="https://doctux-openai.openai.azure.com/" \
    AZURE_OPENAI_API_KEY="your-api-key" \
    NEXTAUTH_SECRET="generate-random-secret" \
    NEXTAUTH_URL="https://doctux-app.azurewebsites.net" \
    NODE_ENV="production"
\`\`\`

## Paso 5: Desplegar Aplicación

### Opción A: Despliegue desde GitHub

\`\`\`bash
az webapp deployment github-actions add \
  --repo-url https://github.com/your-org/doctux \
  --branch main \
  --resource-group doctux-rg \
  --name doctux-app \
  --runtime "node|20"
\`\`\`

### Opción B: Despliegue Local

\`\`\`bash
# Build
npm run build

# Crear archivo de despliegue
az webapp deployment source config-zip \
  --resource-group doctux-rg \
  --name doctux-app \
  --src-path app.zip
\`\`\`

## Paso 6: Configurar Dominio Personalizado

\`\`\`bash
az webapp config hostname add \
  --resource-group doctux-rg \
  --webapp-name doctux-app \
  --hostname doctux.tudominio.com
\`\`\`

## Paso 7: Habilitar HTTPS y SSL

\`\`\`bash
# Crear certificado SSL gratuito
az webapp config ssl create \
  --resource-group doctux-rg \
  --name doctux-app \
  --certificate-name doctux-ssl
\`\`\`

## Verificación Post-Despliegue

1. Acceder a: `https://doctux-app.azurewebsites.net`
2. Probar login con credenciales:
   - Usuario: `100001`
   - Contraseña: `admin2025*`
3. Crear ticket de prueba
4. Verificar integración con IA
5. Revisar reportes

## Monitoreo

### Habilitar Application Insights

\`\`\`bash
az monitor app-insights component create \
  --app doctux-insights \
  --location eastus \
  --resource-group doctux-rg \
  --application-type web
\`\`\`

### Ver logs

\`\`\`bash
az webapp log tail \
  --resource-group doctux-rg \
  --name doctux-app
\`\`\`

## Solución de Problemas

### Base de datos no conecta
- Verificar reglas de firewall de PostgreSQL
- Confirmar CONNECTION_STRING en variables de entorno
- Ejecutar: `psql -c "SELECT version();" -h doctux-db.postgres.database.azure.com`

### IA no responde
- Verificar AZURE_OPENAI_ENDPOINT y AZURE_OPENAI_API_KEY
- Confirmar que el modelo está desplegado
- Ver logs: `az webapp log tail --resource-group doctux-rg --name doctux-app`

### Errores de compilación
- Ejecutar: `npm install`
- Verificar Node.js version: `node -v`
- Revisar logs de App Service

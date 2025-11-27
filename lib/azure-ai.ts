interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  modelName: string;
}

const azureConfig: AzureAIConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  modelName: 'gpt-5-chat-formacion',
};

export interface TicketResolutionRequest {
  ticketId: number;
  titulo: string;
  descripcion: string;
  aplicacion: string;
}

export interface TicketResolutionResponse {
  puedResolverse: boolean;
  resolucion?: string;
  pasos?: string[];
  requiereEscalacion: boolean;
  razonEscalacion?: string;
}

export async function resolveTicketWithAI(
  request: TicketResolutionRequest
): Promise<TicketResolutionResponse> {
  try {
    if (!azureConfig.endpoint || !azureConfig.apiKey) {
      return {
        puedResolverse: false,
        requiereEscalacion: true,
        razonEscalacion: 'Sistema de IA no configurado',
      };
    }

    const prompt = `Eres un ingeniero de soporte técnico nivel 1 especializado en ${request.aplicacion}. 
    
Analiza el siguiente ticket de soporte y determine si puedes resolverlo:

Título: ${request.titulo}
Descripción: ${request.descripcion}
Aplicación: ${request.aplicacion}

Responde en JSON con este formato:
{
  "puedResolverse": boolean,
  "resolucion": "pasos para resolver" (si puedResolverse es true),
  "pasos": ["paso 1", "paso 2", ...],
  "requiereEscalacion": boolean,
  "razonEscalacion": "razón si requiere escalación"
}

Si el problema es simple (errores comunes, reinicios, permisos básicos), intenta resolverlo. 
Si requiere acceso administrativo o configuración compleja, escala a nivel 2.`;

    const response = await fetch(`${azureConfig.endpoint}/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-10-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de soporte técnico experto.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        puedResolverse: false,
        requiereEscalacion: true,
        razonEscalacion: 'Error al procesar respuesta de IA',
      };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error in Azure AI:', error);
    return {
      puedResolverse: false,
      requiereEscalacion: true,
      razonEscalacion: 'Error al conectar con sistema de IA',
    };
  }
}

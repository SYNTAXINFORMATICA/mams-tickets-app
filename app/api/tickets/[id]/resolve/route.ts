import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { resolveTicketWithAI } from '@/lib/azure-ai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);

    // Obtener ticket
    const ticketResult = await sql(
      'SELECT * FROM mams_tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.length === 0) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    const ticket = ticketResult[0];

    // Llamar a IA para intentar resolución automática
    const aiResolution = await resolveTicketWithAI({
      ticketId: ticket.id,
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      aplicacion: ticket.aplicacion,
    });

    // Actualizar ticket según resultado de IA
    if (aiResolution.puedResolverse) {
      // Resolver automáticamente
      const result = await sql(
        `UPDATE mams_tickets
         SET estado = 'resuelto',
             nivel_resolucion = 1,
             resolucion_ia = $1,
             updated_at = CURRENT_TIMESTAMP,
             resolved_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [aiResolution.resolucion, ticketId]
      );

      // Registrar comentario de resolución IA
      const user = JSON.parse(sessionCookie);
      await sql(
        `INSERT INTO mams_ticket_comments (ticket_id, usuario_id, comentario, tipo)
         VALUES ($1, $2, $3, $4)`,
        [ticketId, user.id, aiResolution.resolucion, 'resolucion_ia']
      );

      // Registrar en historial
      await sql(
        `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
         VALUES ($1, $2, $3, $4)`,
        [ticketId, user.id, 'resuelto_automaticamente', 'Ticket resuelto por IA Nivel 1']
      );

      return NextResponse.json({
        success: true,
        resolved: true,
        ticket: result[0],
        resolution: aiResolution,
      });
    } else {
      // Escalar a Nivel 2
      const result = await sql(
        `UPDATE mams_tickets
         SET estado = 'escalado_nivel_2',
             nivel_resolucion = 2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [ticketId]
      );

      // Registrar comentario de escalación
      const user = JSON.parse(sessionCookie);
      await sql(
        `INSERT INTO mams_ticket_comments (ticket_id, usuario_id, comentario, tipo)
         VALUES ($1, $2, $3, $4)`,
        [
          ticketId,
          user.id,
          `Escalado a Nivel 2. Razón: ${aiResolution.razonEscalacion}`,
          'resolucion_ia',
        ]
      );

      // Registrar en historial
      await sql(
        `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
         VALUES ($1, $2, $3, $4)`,
        [
          ticketId,
          user.id,
          'escalado',
          `Escalado a Nivel 2: ${aiResolution.razonEscalacion}`,
        ]
      );

      return NextResponse.json({
        success: true,
        resolved: false,
        escalated: true,
        ticket: result[0],
        resolution: aiResolution,
      });
    }
  } catch (error) {
    console.error('Error resolving ticket:', error);
    return NextResponse.json(
      { error: 'Error al procesar ticket' },
      { status: 500 }
    );
  }
}

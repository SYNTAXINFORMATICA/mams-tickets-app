import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie);

    // Solo ingeniero de soporte y admin pueden cerrar
    if (!['ingeniero_soporte', 'administrador'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const { resolucion } = await request.json();

    const result = await sql(
      `UPDATE mams_tickets
       SET estado = 'cerrado',
           resolucion_manual = $1,
           updated_at = CURRENT_TIMESTAMP,
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [resolucion, ticketId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Registrar comentario
    await sql(
      `INSERT INTO mams_ticket_comments (ticket_id, usuario_id, comentario, tipo)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, user.id, resolucion, 'resolucion_humana']
    );

    // Registrar en historial
    await sql(
      `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, user.id, 'cerrado', 'Ticket cerrado por ingeniero de soporte']
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json(
      { error: 'Error al cerrar' },
      { status: 500 }
    );
  }
}

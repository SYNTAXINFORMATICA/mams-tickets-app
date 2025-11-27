import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);

    const result = await sql(
      `SELECT t.*, u.nombre as reportado_por, a.nombre as asignado_nombre
       FROM mams_tickets t
       JOIN mams_users u ON t.user_id = u.id
       LEFT JOIN mams_users a ON t.asignado_a = a.id
       WHERE t.id = $1`,
      [ticketId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Obtener comentarios
    const comments = await sql(
      `SELECT c.*, u.nombre FROM mams_ticket_comments c
       JOIN mams_users u ON c.usuario_id = u.id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at DESC`,
      [ticketId]
    );

    // Obtener historial
    const history = await sql(
      `SELECT h.*, u.nombre FROM mams_ticket_history h
       JOIN mams_users u ON h.usuario_id = u.id
       WHERE h.ticket_id = $1
       ORDER BY h.created_at DESC`,
      [ticketId]
    );

    return NextResponse.json({
      ticket: result[0],
      comments,
      history,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie);

    // Solo admin y ingeniero de soporte pueden editar
    if (user.role === 'analista') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const { estado, prioridad, resolucion_manual } = await request.json();

    const result = await sql(
      `UPDATE mams_tickets
       SET estado = COALESCE($1, estado),
           prioridad = COALESCE($2, prioridad),
           resolucion_manual = COALESCE($3, resolucion_manual),
           updated_at = CURRENT_TIMESTAMP,
           resolved_at = CASE WHEN $1 = 'cerrado' THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $4
       RETURNING *`,
      [estado, prioridad, resolucion_manual, ticketId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Registrar en historial
    await sql(
      `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, user.id, 'actualizado', `Ticket actualizado por ${user.role}`]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie);

    // Solo admin puede borrar
    if (user.role !== 'administrador') {
      return NextResponse.json(
        { error: 'Solo administradores pueden borrar tickets' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);

    await sql('DELETE FROM mams_tickets WHERE id = $1', [ticketId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Error al borrar ticket' },
      { status: 500 }
    );
  }
}

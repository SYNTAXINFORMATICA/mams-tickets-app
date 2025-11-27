import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

    // Solo ingeniero de soporte y admin pueden asignar
    if (!['ingeniero_soporte', 'administrador'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const { ingeniero_id, resolucion } = await request.json();

    // Actualizar ticket
    const result = await sql(
      `UPDATE mams_tickets
       SET asignado_a = $1,
           estado = 'en_progreso',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND estado = 'escalado_nivel_2'
       RETURNING *`,
      [ingeniero_id, ticketId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ticket no encontrado o no está escalado' },
        { status: 404 }
      );
    }

    // Registrar en historial
    await sql(
      `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, user.id, 'asignado', `Asignado a ingeniero para Nivel 2`]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return NextResponse.json(
      { error: 'Error al asignar' },
      { status: 500 }
    );
  }
}

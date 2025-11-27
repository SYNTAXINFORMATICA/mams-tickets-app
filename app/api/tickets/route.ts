import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const aplicacion = searchParams.get('aplicacion');
    const area = searchParams.get('area');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT t.*, u.nombre as reportado_por FROM mams_tickets t JOIN mams_users u ON t.user_id = u.id WHERE 1=1';
    const params: any[] = [];

    if (estado) {
      query += ` AND t.estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (aplicacion) {
      query += ` AND t.aplicacion = $${params.length + 1}`;
      params.push(aplicacion);
    }

    if (area) {
      query += ` AND t.area = $${params.length + 1}`;
      params.push(area);
    }

    // Validar sortBy para evitar SQL injection
    const validSortFields = ['ticket_number', 'titulo', 'estado', 'prioridad', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY t.${sortField} ${sortDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const tickets = await sql(query, params);

    // Obtener total para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM mams_tickets t WHERE 1=1';
    const countParams: any[] = [];

    if (estado) {
      countQuery += ` AND t.estado = $${countParams.length + 1}`;
      countParams.push(estado);
    }

    if (aplicacion) {
      countQuery += ` AND t.aplicacion = $${countParams.length + 1}`;
      countParams.push(aplicacion);
    }

    if (area) {
      countQuery += ` AND t.area = $${countParams.length + 1}`;
      countParams.push(area);
    }

    const countResult = await sql(countQuery, countParams);
    const total = countResult[0].total;

    return NextResponse.json({
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie);
    const { area, aplicacion, titulo, descripcion } = await request.json();

    if (!area || !aplicacion || !titulo || !descripcion) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Generar número de ticket único
    const ticketNumber = `TKT-${Date.now()}`;

    const result = await sql(
      `INSERT INTO mams_tickets (ticket_number, user_id, area, aplicacion, titulo, descripcion, estado, prioridad)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [ticketNumber, user.id, area, aplicacion, titulo, descripcion, 'abierto', 'media']
    );

    // Registrar en historial
    await sql(
      `INSERT INTO mams_ticket_history (ticket_id, usuario_id, accion, descripcion)
       VALUES ($1, $2, $3, $4)`,
      [result[0].id, user.id, 'creado', 'Ticket creado por analista']
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    );
  }
}

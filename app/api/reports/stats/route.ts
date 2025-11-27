import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Tickets por área
    const ticketsByArea = await sql(
      `SELECT area, COUNT(*) as total 
       FROM mams_tickets 
       WHERE area IS NOT NULL 
       GROUP BY area 
       ORDER BY total DESC`
    );

    // Tickets por aplicación
    const ticketsByApp = await sql(
      `SELECT aplicacion, COUNT(*) as total 
       FROM mams_tickets 
       GROUP BY aplicacion 
       ORDER BY total DESC`
    );

    // Estadísticas generales
    const stats = await sql(
      `SELECT 
         COUNT(*) as total_tickets,
         SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
         SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
         SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
         SUM(CASE WHEN nivel_resolucion = 1 AND estado IN ('resuelto', 'cerrado') THEN 1 ELSE 0 END) as resueltos_ia,
         SUM(CASE WHEN nivel_resolucion = 2 AND estado IN ('resuelto', 'cerrado') THEN 1 ELSE 0 END) as resueltos_humanos
       FROM mams_tickets`
    );

    // Tiempo promedio de resolución
    const avgTime = await sql(
      `SELECT 
         AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as horas_promedio
       FROM mams_tickets 
       WHERE resolved_at IS NOT NULL`
    );

    return NextResponse.json({
      ticketsByArea,
      ticketsByApp,
      stats: stats[0],
      avgResolutionTime: avgTime[0]?.horas_promedio || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

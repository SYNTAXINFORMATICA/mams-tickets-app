import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = JSON.parse(sessionCookie);

    return NextResponse.json({
      user: {
        id: user.id,
        cedula: user.cedula,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        area: user.area,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

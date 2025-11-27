import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { cedula, password } = await request.json();

    if (!cedula || !password) {
      return NextResponse.json(
        { error: 'Cédula y contraseña son requeridas' },
        { status: 400 }
      );
    }

    const result = await sql('SELECT * FROM mams_users WHERE cedula = $1', [cedula]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrecta' },
        { status: 401 }
      );
    }

    const user = result[0];

    // Comparación simple (en producción usar bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrecta' },
        { status: 401 }
      );
    }

    if (user.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // Crear sesión
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          email: user.email,
          role: user.role,
          area: user.area,
        },
      },
      { status: 200 }
    );

    // Configurar cookie de sesión (30 días)
    response.cookies.set('session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

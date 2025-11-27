'use client';

import { useAuth } from '@/hooks/use-auth';
import { TicketsTable } from '@/components/dashboard/tickets-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!user) {
    return <div className="p-8">No autenticado</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Doctux</h1>
              <p className="text-sm text-slate-400">Bienvenido, {user.nombre}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                Rol: <span className="text-blue-400">{user.role.replace('_', ' ')}</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Tickets de Soporte</h2>
            <p className="text-slate-400 mt-1">Gestiona tus incidencias técnicas</p>
          </div>
          {user.role === 'analista' && (
            <Button onClick={() => router.push('/dashboard/tickets/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          )}
        </div>

        <TicketsTable userRole={user.role} />
      </div>
    </div>
  );
}

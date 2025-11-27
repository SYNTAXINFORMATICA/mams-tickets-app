'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No autenticado</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">Doctux</h1>
            <p className="text-xs text-slate-400 mt-1">{user.nombre}</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Button
              variant={pathname === '/dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                router.push('/dashboard');
                setSidebarOpen(false);
              }}
            >
              Tickets
            </Button>

            {user.role !== 'analista' && (
              <Button
                variant={pathname === '/dashboard/reports' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  router.push('/dashboard/reports');
                  setSidebarOpen(false);
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </Button>
            )}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex-1" />
            <div className="text-sm text-slate-400">
              Rol: <span className="text-blue-400">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

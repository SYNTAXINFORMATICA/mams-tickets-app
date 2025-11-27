'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewTicketPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [area, setArea] = useState('');
  const [aplicacion, setAplicacion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!area || !aplicacion || !titulo || !descripcion) {
      setError('Todos los campos son requeridos');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, aplicacion, titulo, descripcion }),
      });

      if (response.ok) {
        const ticket = await response.json();
        router.push(`/dashboard/tickets/${ticket.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear ticket');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Crear Nuevo Ticket</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Reportar Incidencia Técnica</CardTitle>
            <CardDescription>
              Describe el problema que estás experimentando. El sistema intentará resolverlo automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Área *</label>
                  <Input
                    placeholder="Ej: Ventas, Finanzas, Operaciones"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Aplicación *</label>
                  <Select value={aplicacion} onValueChange={setAplicacion}>
                    <SelectTrigger disabled={submitting}>
                      <SelectValue placeholder="Selecciona una aplicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SharePoint Online">SharePoint Online</SelectItem>
                      <SelectItem value="Facturador">Facturador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Título del Problema *</label>
                <Input
                  placeholder="Resumen breve del problema"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción Detallada *</label>
                <Textarea
                  placeholder="Describe el problema con el mayor detalle posible. Incluye pasos para reproducir, mensajes de error, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={submitting}
                  rows={8}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Creando...' : 'Crear Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

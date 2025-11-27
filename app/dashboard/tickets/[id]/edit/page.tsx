'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
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

export default function EditTicketPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [resolucion, setResolucion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(true);

  const ticketId = parseInt(params.id);

  useEffect(() => {
    if (!loading && user) {
      loadTicket();
    }
  }, [user, loading]);

  const loadTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        setEstado(data.ticket.estado);
        setPrioridad(data.ticket.prioridad);
        setResolucion(data.ticket.resolucion_manual || '');
      }
    } finally {
      setTicketLoading(false);
    }
  };

  if (loading || ticketLoading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  if (user.role === 'analista') {
    return <div className="p-8">No tienes permisos para editar tickets</div>;
  }

  if (!ticket) return <div className="p-8">Ticket no encontrado</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSubmitting(true);

    try {
      let endpoint = `/api/tickets/${ticketId}`;
      let method = 'PUT';
      let body: any = {};

      if (estado !== ticket.estado) {
        body.estado = estado;
      }

      if (prioridad !== ticket.prioridad) {
        body.prioridad = prioridad;
      }

      if (estado === 'cerrado' && resolucion) {
        endpoint = `/api/tickets/${ticketId}/close`;
        method = 'POST';
        body = { resolucion };
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSuccess('Ticket actualizado exitosamente');
        setTimeout(() => {
          router.push(`/dashboard/tickets/${ticketId}`);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar');
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
          <h1 className="text-2xl font-bold text-white">Editar Ticket {ticket.ticket_number}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{ticket.titulo}</CardTitle>
            <CardDescription>{ticket.area} • {ticket.aplicacion}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger disabled={submitting}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="escalado_nivel_2">Escalado Nivel 2</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridad</label>
                  <Select value={prioridad} onValueChange={setPrioridad}>
                    <SelectTrigger disabled={submitting}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {estado === 'cerrado' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resolución Manual *</label>
                  <Textarea
                    placeholder="Describe cómo se resolvió el problema..."
                    value={resolucion}
                    onChange={(e) => setResolucion(e.target.value)}
                    disabled={submitting}
                    rows={6}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
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

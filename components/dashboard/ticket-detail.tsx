'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, AlertCircle } from 'lucide-react';

interface Comment {
  id: number;
  usuario_id: number;
  nombre: string;
  comentario: string;
  tipo: string;
  created_at: string;
}

interface HistoryItem {
  id: number;
  usuario_id: number;
  nombre: string;
  accion: string;
  descripcion: string;
  created_at: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  titulo: string;
  descripcion: string;
  aplicacion: string;
  area: string;
  estado: string;
  prioridad: string;
  nivel_resolucion: number;
  resolucion_ia?: string;
  resolucion_manual?: string;
  reportado_por: string;
  created_at: string;
}

interface TicketDetailProps {
  ticketId: number;
  userRole: string;
  onUpdate?: () => void;
}

export function TicketDetail({ ticketId, userRole, onUpdate }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newEstado, setNewEstado] = useState('');
  const [newPrioridad, setNewPrioridad] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        setComments(data.comments);
        setHistory(data.history);
        setNewEstado(data.ticket.estado);
        setNewPrioridad(data.ticket.prioridad);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveWithAI = async () => {
    setResolving(true);
    setError('');

    try {
      const response = await fetch(`/api/tickets/${ticketId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          data.resolved
            ? 'Ticket resuelto automáticamente por IA'
            : 'Ticket escalado a Nivel 2'
        );
        await loadTicket();
        onUpdate?.();
      } else {
        setError('Error al procesar con IA');
      }
    } catch (err) {
      setError('Error al conectar con IA');
    } finally {
      setResolving(false);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: newEstado !== ticket?.estado ? newEstado : undefined,
          prioridad: newPrioridad !== ticket?.prioridad ? newPrioridad : undefined,
        }),
      });

      if (response.ok) {
        setSuccess('Ticket actualizado');
        await loadTicket();
        onUpdate?.();
      }
    } catch (err) {
      setError('Error al actualizar');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  const estadoColors: Record<string, string> = {
    abierto: 'bg-blue-100 text-blue-800',
    en_progreso: 'bg-yellow-100 text-yellow-800',
    escalado_nivel_2: 'bg-orange-100 text-orange-800',
    resuelto: 'bg-green-100 text-green-800',
    cerrado: 'bg-gray-100 text-gray-800',
  };

  const prioridadColors: Record<string, string> = {
    baja: 'bg-green-500',
    media: 'bg-yellow-500',
    alta: 'bg-orange-500',
    urgente: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      {/* Errores y Éxitos */}
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

      {/* Información del Ticket */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{ticket.titulo}</CardTitle>
              <CardDescription>
                {ticket.ticket_number} • {ticket.area} • {ticket.aplicacion}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={estadoColors[ticket.estado] || 'bg-gray-100'}>
                {ticket.estado.replace('_', ' ')}
              </Badge>
              <Badge className={prioridadColors[ticket.prioridad] || 'bg-gray-500'}>
                {ticket.prioridad}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.descripcion}</p>
          </div>

          {ticket.resolucion_ia && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Resolución IA</h3>
              <p className="text-blue-800 whitespace-pre-wrap">{ticket.resolucion_ia}</p>
            </div>
          )}

          {ticket.resolucion_manual && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-900 mb-2">Resolución Manual</h3>
              <p className="text-green-800 whitespace-pre-wrap">{ticket.resolucion_manual}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles */}
      {userRole !== 'analista' && ticket.estado !== 'cerrado' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botón de IA */}
            {ticket.estado === 'abierto' && (
              <Button
                onClick={handleResolveWithAI}
                disabled={resolving}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {resolving ? 'Procesando...' : 'Procesar con IA (Nivel 1)'}
              </Button>
            )}

            {/* Actualizar Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actualizar Estado</label>
              <div className="flex gap-2">
                <Select value={newEstado} onValueChange={setNewEstado}>
                  <SelectTrigger>
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
                <Button onClick={handleUpdateTicket}>Actualizar</Button>
              </div>
            </div>

            {/* Actualizar Prioridad */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actualizar Prioridad</label>
              <Select value={newPrioridad} onValueChange={setNewPrioridad}>
                <SelectTrigger>
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
          </CardContent>
        </Card>
      )}

      {/* Comentarios */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{comment.nombre}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {comment.comentario}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="text-sm flex justify-between py-1 border-b">
                <span>{item.nombre} - {item.accion}</span>
                <span className="text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

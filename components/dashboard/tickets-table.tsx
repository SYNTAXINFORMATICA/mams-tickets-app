'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Edit2, Trash2, Eye } from 'lucide-react';

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

export function TicketsTable({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');
  const [aplicacion, setAplicacion] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadTickets();
  }, [estado, aplicacion, sortBy, sortOrder]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estado) params.append('estado', estado);
      if (aplicacion) params.append('aplicacion', aplicacion);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket?')) return;

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTickets();
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="escalado_nivel_2">Escalado Nivel 2</SelectItem>
            <SelectItem value="resuelto">Resuelto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={aplicacion} onValueChange={setAplicacion}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por aplicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las aplicaciones</SelectItem>
            <SelectItem value="SharePoint Online">SharePoint Online</SelectItem>
            <SelectItem value="Facturador">Facturador</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={loadTickets} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('ticket_number')}>
                <div className="flex items-center gap-2">
                  Ticket
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('titulo')}>
                <div className="flex items-center gap-2">
                  Título
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Aplicación</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('prioridad')}>
                <div className="flex items-center gap-2">
                  Prioridad
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('estado')}>
                <div className="flex items-center gap-2">
                  Estado
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Reportado por</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay tickets
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                  <TableCell className="font-medium truncate">{ticket.titulo}</TableCell>
                  <TableCell>{ticket.aplicacion}</TableCell>
                  <TableCell>
                    <Badge className={prioridadColors[ticket.prioridad] || 'bg-gray-500'}>
                      {ticket.prioridad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColors[ticket.estado] || 'bg-gray-100'}>
                      {ticket.estado.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.reportado_por}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {userRole !== 'analista' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/tickets/${ticket.id}/edit`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {userRole === 'administrador' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

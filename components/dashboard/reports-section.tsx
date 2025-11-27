'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Stats {
  ticketsByArea: { area: string; total: number }[];
  ticketsByApp: { aplicacion: string; total: number }[];
  stats: {
    total_tickets: number;
    cerrados: number;
    resueltos: number;
    abiertos: number;
    resueltos_ia: number;
    resueltos_humanos: number;
  };
  avgResolutionTime: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando reportes...</div>;
  }

  if (!stats) {
    return <div>Error al cargar reportes</div>;
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.total_tickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.stats.cerrados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.stats.abiertos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgResolutionTime)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets por Área */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Área</CardTitle>
            <CardDescription>Áreas con más incidencias reportadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ticketsByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets por Aplicación */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Aplicación</CardTitle>
            <CardDescription>Aplicaciones con más incidencias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.ticketsByApp}
                  dataKey="total"
                  nameKey="aplicacion"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.ticketsByApp.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resoluciones por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Resoluciones por Tipo</CardTitle>
            <CardDescription>IA vs Humanos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    type: 'Resolutor',
                    IA: stats.stats.resueltos_ia,
                    Humanos: stats.stats.resueltos_humanos,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="IA" fill="#10b981" />
                <Bar dataKey="Humanos" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span>Tickets Resueltos (IA)</span>
              <span className="font-bold text-green-600">{stats.stats.resueltos_ia}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Tickets Resueltos (Humanos)</span>
              <span className="font-bold text-blue-600">{stats.stats.resueltos_humanos}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Tasa de Resolución IA</span>
              <span className="font-bold">
                {stats.stats.total_tickets > 0
                  ? Math.round(
                    (stats.stats.resueltos_ia / (stats.stats.resueltos_ia + stats.stats.resueltos_humanos || 1)) * 100
                  )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

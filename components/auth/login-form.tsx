'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error en el login');
        setLoading(false);
        return;
      }

      // Éxito - redirigir al dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Doctux</CardTitle>
        <CardDescription>Sistema de Soporte Técnico Inteligente</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="cedula" className="text-sm font-medium">
              Cédula
            </label>
            <Input
              id="cedula"
              type="text"
              placeholder="Ej: 100001"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Usuarios de prueba:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Admin: cedula <strong>100001</strong>, pass <strong>admin2025*</strong></li>
              <li>Analista: cedula <strong>100002</strong>, pass <strong>pass2025*</strong></li>
              <li>Ingeniero: cedula <strong>100005</strong>, pass <strong>pass2025*</strong></li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

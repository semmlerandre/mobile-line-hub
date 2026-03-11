import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const systemName = (() => {
    try {
      const cfg = localStorage.getItem('system-config');
      return cfg ? JSON.parse(cfg).nomeDoSistema : 'Controle de Linhas Móveis';
    } catch { return 'Controle de Linhas Móveis'; }
  })();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo accounts
    const accounts: Record<string, { password: string; role: string; name: string }> = {
      'admin@empresa.com': { password: 'admin123', role: 'admin', name: 'Administrador' },
      'ti@empresa.com': { password: 'ti123', role: 'ti', name: 'Usuário TI' },
      'auditor@empresa.com': { password: 'auditor123', role: 'auditor', name: 'Auditor' },
    };

    const account = accounts[email];
    if (account && account.password === password) {
      localStorage.setItem('user', JSON.stringify({ email, role: account.role, name: account.name }));
      navigate('/');
    } else {
      setError('E-mail ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <Card className="w-full max-w-md border-sidebar-border">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{systemName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Faça login para acessar o sistema</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
          <div className="mt-6 p-3 rounded-md bg-muted text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Contas de demonstração:</p>
            <p>Admin: admin@empresa.com / admin123</p>
            <p>TI: ti@empresa.com / ti123</p>
            <p>Auditor: auditor@empresa.com / auditor123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

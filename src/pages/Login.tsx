import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { getSystemUsers } from '@/lib/store';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cfg = (() => {
    try {
      const raw = localStorage.getItem('system-config');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  })();

  const systemName = cfg.nomeDoSistema || 'Controle de Linhas Móveis';
  const logoUrl = cfg.logoUrl || '';
  const loginBgUrl = cfg.loginBgUrl || '';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getSystemUsers();
    const account = users.find(u => u.email === email);

    if (!account || account.password !== password) {
      setError('E-mail ou senha inválidos');
      return;
    }

    if (account.status === 'bloqueado') {
      setError('Sua conta está bloqueada. Contate o administrador.');
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      email,
      role: account.role,
      name: account.name,
      mustChangePassword: account.mustChangePassword,
    }));

    if (account.mustChangePassword) {
      navigate('/alterar-senha');
    } else {
      navigate('/');
    }
  };

  const users = getSystemUsers().filter(u => u.status === 'ativo');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: loginBgUrl ? undefined : 'hsl(var(--sidebar-background))',
        backgroundImage: loginBgUrl ? `url(${loginBgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {loginBgUrl && <div className="absolute inset-0 bg-black/50" />}
      <Card className="w-full max-w-md border-sidebar-border relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="mx-auto max-h-16 object-contain" />
          ) : (
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary-foreground" />
            </div>
          )}
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
            <p className="font-medium text-foreground">Contas disponíveis:</p>
            {users.map(u => (
              <p key={u.id}>{u.name}: {u.email} / {u.password}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

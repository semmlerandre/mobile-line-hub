import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getSystemUsers, setSystemUsers } from '@/lib/store';

const AlterarSenhaPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();

  const cfg = (() => {
    try {
      const raw = localStorage.getItem('system-config');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  })();

  const systemName = cfg.nomeDoSistema || 'Controle de Linhas Móveis';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const users = getSystemUsers();
    const updated = users.map(u =>
      u.email === user?.email
        ? { ...u, password: newPassword, mustChangePassword: false }
        : u
    );
    setSystemUsers(updated);

    // Update current user session
    const currentUser = { ...user, mustChangePassword: false };
    localStorage.setItem('user', JSON.stringify(currentUser));

    toast.success('Senha alterada com sucesso!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}>
      <Card className="w-full max-w-md border-sidebar-border">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{systemName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Você precisa alterar sua senha para continuar</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
              />
            </div>
            <Button type="submit" className="w-full">Alterar Senha e Continuar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlterarSenhaPage;

import { useState, useRef } from 'react';
import { useStore, defaultConfig, applyPrimaryColor, generateId, getSystemUsers, setSystemUsers } from '@/lib/store';
import type { SystemConfig, SystemUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Upload, Trash2, Palette, UserPlus, Users, Lock, Ban, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const COLOR_PRESETS = [
  { label: 'Ciano', value: '#0891b2' },
  { label: 'Azul', value: '#2563eb' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Vermelho', value: '#dc2626' },
  { label: 'Laranja', value: '#ea580c' },
  { label: 'Roxo', value: '#9333ea' },
  { label: 'Rosa', value: '#db2777' },
  { label: 'Cinza', value: '#475569' },
];

const ConfiguracoesPage = () => {
  const [config, setConfig] = useStore<SystemConfig>('system-config', defaultConfig);
  const [form, setForm] = useState(config);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // User management
  const [users, setUsers] = useState<SystemUser[]>(() => getSystemUsers());
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'ti' as SystemUser['role'] });

  const saveUsers = (updated: SystemUser[]) => {
    setUsers(updated);
    setSystemUsers(updated);
  };

  const handleSave = () => {
    setConfig(form);
    applyPrimaryColor(form.primaryColor);
    // Atualizar título da aba
    if (form.nomeDoSistema) {
      document.title = form.nomeDoSistema;
    }
    // Atualizar favicon com o logo (cache bust)
    if (form.logoUrl) {
      const oldLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
      oldLinks.forEach(el => el.remove());
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = form.logoUrl.startsWith('data:') 
        ? form.logoUrl 
        : form.logoUrl + '?v=' + Date.now();
      document.head.appendChild(link);
    }
    toast.success('Configurações salvas!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx 2MB)'); return; }
    const dataUrl = await fileToDataUrl(file);
    setForm({ ...form, logoUrl: dataUrl });
    toast.success('Logo carregado');
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('Imagem muito grande (máx 50MB)'); return; }
    const dataUrl = await fileToDataUrl(file);
    setForm({ ...form, loginBgUrl: dataUrl });
    toast.success('Imagem de fundo carregada');
  };

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (users.some(u => u.email === newUser.email)) {
      toast.error('E-mail já cadastrado');
      return;
    }
    const user: SystemUser = {
      id: generateId(),
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      status: 'ativo',
      mustChangePassword: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveUsers([...users, user]);
    setNewUser({ email: '', name: '', password: '', role: 'ti' });
    setShowUserDialog(false);
    toast.success('Usuário criado! Ele deverá alterar a senha no primeiro acesso.');
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, status: (u.status === 'ativo' ? 'bloqueado' : 'ativo') as SystemUser['status'] } : u
    );
    saveUsers(updated);
    const user = updated.find(u => u.id === userId);
    toast.success(user?.status === 'bloqueado' ? 'Usuário bloqueado' : 'Usuário desbloqueado');
  };

  const handleResetPassword = (userId: string) => {
    const defaultPass = 'mudar123';
    const updated = users.map(u =>
      u.id === userId ? { ...u, password: defaultPass, mustChangePassword: true } : u
    );
    saveUsers(updated);
    toast.success(`Senha resetada para "${defaultPass}". O usuário deverá alterar no próximo acesso.`);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      toast.error('Deve haver pelo menos um usuário no sistema');
      return;
    }
    saveUsers(users.filter(u => u.id !== userId));
    toast.success('Usuário excluído');
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'ti': return 'TI';
      case 'auditor': return 'Auditor';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o sistema</p>
      </div>

      {/* System Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-5 h-5" />Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Nome do Sistema</Label>
            <Input
              value={form.nomeDoSistema}
              onChange={e => setForm({ ...form, nomeDoSistema: e.target.value })}
              placeholder="Nome exibido no menu e login"
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-5 h-5" />Cor Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setForm({ ...form, primaryColor: preset.value })}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="w-10 h-10 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: preset.value,
                    borderColor: form.primaryColor === preset.value ? preset.value : 'transparent',
                    boxShadow: form.primaryColor === preset.value ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${preset.value}` : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground">{preset.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Label>Cor personalizada:</Label>
            <Input
              type="color"
              value={form.primaryColor}
              onChange={e => setForm({ ...form, primaryColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <span className="text-sm font-mono text-muted-foreground">{form.primaryColor}</span>
          </div>
          <div className="h-10 rounded-lg flex items-center justify-center text-sm font-medium" style={{ backgroundColor: form.primaryColor, color: '#fff' }}>
            Preview da cor principal
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-5 h-5" />Logo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O logo aparece no menu lateral e na tela de login. Formatos: PNG, JPG, SVG. Máx: 2MB.
          </p>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />Enviar Logo
            </Button>
            {form.logoUrl && (
              <Button variant="outline" onClick={() => setForm({ ...form, logoUrl: '' })}>
                <Trash2 className="w-4 h-4 mr-2" />Remover
              </Button>
            )}
          </div>
          {form.logoUrl && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img src={form.logoUrl} alt="Logo" className="max-h-16 object-contain" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Background */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-5 h-5" />Imagem de Fundo do Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Imagem exibida como fundo na tela de login. Formatos: PNG, JPG. Máx: 50MB.
          </p>
          <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => bgInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />Enviar Imagem
            </Button>
            {form.loginBgUrl && (
              <Button variant="outline" onClick={() => setForm({ ...form, loginBgUrl: '' })}>
                <Trash2 className="w-4 h-4 mr-2" />Remover
              </Button>
            )}
          </div>
          {form.loginBgUrl && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img src={form.loginBgUrl} alt="Fundo Login" className="max-h-32 rounded object-cover" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Config */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">Salvar Configurações</Button>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button><UserPlus className="w-4 h-4 mr-2" />Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@empresa.com" />
                </div>
                <div className="space-y-1">
                  <Label>Senha Inicial</Label>
                  <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                  <p className="text-xs text-muted-foreground">O usuário será obrigado a alterar a senha no primeiro acesso.</p>
                </div>
                <div className="space-y-1">
                  <Label>Perfil</Label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v as SystemUser['role'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">Criar Usuário</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">E-mail</th>
                  <th className="text-left p-3 font-medium">Perfil</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3"><Badge variant="outline">{roleLabel(u.role)}</Badge></td>
                    <td className="p-3">
                      <Badge variant={u.status === 'ativo' ? 'default' : 'destructive'}>
                        {u.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(u.id)} title="Resetar Senha">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleBlock(u.id)} title={u.status === 'ativo' ? 'Bloquear' : 'Desbloquear'}>
                        <Ban className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} title="Excluir" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sobre o Sistema</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Sistema de Controle de Linhas Móveis Corporativas</p>
          <p>Versão: 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesPage;

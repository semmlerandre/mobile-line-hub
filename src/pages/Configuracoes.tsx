import { useState, useRef } from 'react';
import { useStore, defaultConfig, applyPrimaryColor } from '@/lib/store';
import type { SystemConfig } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Upload, Trash2, Palette } from 'lucide-react';

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

  const handleSave = () => {
    setConfig(form);
    applyPrimaryColor(form.primaryColor);
    toast.success('Configurações salvas! Recarregue para aplicar em todo o sistema.');
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
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande (máx 5MB)'); return; }
    const dataUrl = await fileToDataUrl(file);
    setForm({ ...form, loginBgUrl: dataUrl });
    toast.success('Imagem de fundo carregada');
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
            Imagem exibida como fundo na tela de login. Formatos: PNG, JPG. Máx: 5MB.
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

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">Salvar Configurações</Button>
      </div>

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

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { SystemConfig } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

const defaultConfig: SystemConfig = { nomeDoSistema: 'Controle de Linhas Móveis', logoUrl: '' };

const ConfiguracoesPage = () => {
  const [config, setConfig] = useStore<SystemConfig>('system-config', defaultConfig);
  const [form, setForm] = useState(config);

  const handleSave = () => {
    setConfig(form);
    toast.success('Configurações salvas. Recarregue a página para ver as mudanças no menu.');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground">Personalize o sistema</p></div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-5 h-5" />Informações do Sistema</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Nome do Sistema</Label>
            <Input value={form.nomeDoSistema} onChange={e => setForm({ ...form, nomeDoSistema: e.target.value })} placeholder="Nome exibido no menu e login" />
          </div>
          <div className="space-y-1">
            <Label>URL do Logo</Label>
            <Input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://exemplo.com/logo.png" />
            <p className="text-xs text-muted-foreground">Insira a URL de uma imagem para usar como logo</p>
          </div>
          {form.logoUrl && (
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview do logo:</p>
              <img src={form.logoUrl} alt="Logo" className="max-h-16 object-contain" />
            </div>
          )}
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sobre o Sistema</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Sistema de Controle de Linhas Móveis Corporativas</p>
          <p>Versão: 1.0.0</p>
          <p>Este sistema permite gerenciar linhas telefônicas, chips, dispositivos, colaboradores, planos e operadoras de forma centralizada.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesPage;

import { useState } from 'react';
import { useStore, DEMO_LINHAS, DEMO_COLABORADORES, DEMO_MOVIMENTACOES, DEMO_CHIPS, DEMO_DISPOSITIVOS, generateId } from '@/lib/store';
import type { Linha, Colaborador, Movimentacao, Chip, Dispositivo } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const eventos = [
  'Entrega de linha', 'Troca de usuário', 'Troca de chip', 'Troca de aparelho',
  'Mudança de plano', 'Suspender linha', 'Cancelamento'
];

const MovimentacoesPage = () => {
  const [linhas, setLinhas] = useStore<Linha[]>('linhas', DEMO_LINHAS);
  const [colaboradores] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);
  const [movs, setMovs] = useStore<Movimentacao[]>('movimentacoes', DEMO_MOVIMENTACOES);
  const [chips] = useStore<Chip[]>('chips', DEMO_CHIPS);
  const [dispositivos] = useStore<Dispositivo[]>('dispositivos', DEMO_DISPOSITIVOS);

  const [form, setForm] = useState({
    linhaId: '', evento: '', colaboradorNovoId: '', numeroChamado: '',
    solicitante: '', responsavelTI: '', observacoes: ''
  });

  const handleSubmit = () => {
    if (!form.linhaId || !form.evento || !form.numeroChamado) {
      toast.error('Linha, evento e número do chamado são obrigatórios');
      return;
    }

    const linha = linhas.find(l => l.id === form.linhaId);
    const colabAnterior = colaboradores.find(c => c.id === linha?.colaboradorId);
    const colabNovo = colaboradores.find(c => c.id === form.colaboradorNovoId);

    const mov: Movimentacao = {
      id: generateId(),
      linhaId: form.linhaId,
      evento: form.evento,
      usuarioAnterior: colabAnterior?.nome || '',
      usuarioNovo: colabNovo?.nome || '',
      numeroChamado: form.numeroChamado,
      solicitante: form.solicitante,
      responsavelTI: form.responsavelTI,
      data: new Date().toISOString().split('T')[0],
      observacoes: form.observacoes
    };

    setMovs(prev => [mov, ...prev]);

    // Update line based on event
    if (form.evento === 'Troca de usuário' && form.colaboradorNovoId) {
      setLinhas(prev => prev.map(l => l.id === form.linhaId ? { ...l, colaboradorId: form.colaboradorNovoId, departamento: colabNovo?.departamento || l.departamento } : l));
    } else if (form.evento === 'Cancelamento') {
      setLinhas(prev => prev.map(l => l.id === form.linhaId ? { ...l, status: 'Cancelada' as const } : l));
    } else if (form.evento === 'Suspender linha') {
      setLinhas(prev => prev.map(l => l.id === form.linhaId ? { ...l, status: 'Suspensa' as const } : l));
    } else if (form.evento === 'Entrega de linha' && form.colaboradorNovoId) {
      setLinhas(prev => prev.map(l => l.id === form.linhaId ? { ...l, colaboradorId: form.colaboradorNovoId, departamento: colabNovo?.departamento || '', status: 'Ativa' as const } : l));
    }

    toast.success('Movimentação registrada');
    setForm({ linhaId: '', evento: '', colaboradorNovoId: '', numeroChamado: '', solicitante: '', responsavelTI: '', observacoes: '' });
  };

  const getLinhaNum = (id: string) => linhas.find(l => l.id === id)?.numero || '-';

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Movimentações</h1><p className="text-muted-foreground">Registre movimentações de linhas</p></div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Linha *</Label>
              <Select value={form.linhaId} onValueChange={v => setForm({ ...form, linhaId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{linhas.map(l => <SelectItem key={l.id} value={l.id}>{l.numero}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Evento *</Label>
              <Select value={form.evento} onValueChange={v => setForm({ ...form, evento: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{eventos.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Usuário Destino</Label>
              <Select value={form.colaboradorNovoId} onValueChange={v => setForm({ ...form, colaboradorNovoId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{colaboradores.filter(c => c.status === 'Ativo').map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Nº Chamado *</Label><Input value={form.numeroChamado} onChange={e => setForm({ ...form, numeroChamado: e.target.value })} placeholder="GLPI-0000" /></div>
            <div className="space-y-1"><Label>Solicitado por</Label><Input value={form.solicitante} onChange={e => setForm({ ...form, solicitante: e.target.value })} /></div>
            <div className="space-y-1"><Label>Responsável TI</Label><Input value={form.responsavelTI} onChange={e => setForm({ ...form, responsavelTI: e.target.value })} /></div>
          </div>
          <div className="space-y-1"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} /></div>
          <Button onClick={handleSubmit}>Registrar Movimentação</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Data</TableHead><TableHead>Linha</TableHead><TableHead>Evento</TableHead>
              <TableHead>Usuário Anterior</TableHead><TableHead>Usuário Novo</TableHead>
              <TableHead>Chamado</TableHead><TableHead>Responsável TI</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {movs.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.data}</TableCell>
                  <TableCell className="font-medium">{getLinhaNum(m.linhaId)}</TableCell>
                  <TableCell><Badge variant="outline">{m.evento}</Badge></TableCell>
                  <TableCell>{m.usuarioAnterior || '-'}</TableCell>
                  <TableCell>{m.usuarioNovo || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{m.numeroChamado}</TableCell>
                  <TableCell>{m.responsavelTI}</TableCell>
                </TableRow>
              ))}
              {movs.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovimentacoesPage;

import { useState } from 'react';
import { useStore, DEMO_LINHAS, DEMO_OPERADORAS, DEMO_PLANOS, DEMO_CHIPS, DEMO_COLABORADORES, DEMO_DISPOSITIVOS, DEMO_MOVIMENTACOES, generateId } from '@/lib/store';
import type { Linha, Operadora, Plano, Chip, Colaborador, Dispositivo, Movimentacao } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyLinha: Omit<Linha, 'id'> = {
  numero: '', operadoraId: '', planoId: '', chipId: '', status: 'Em estoque',
  colaboradorId: '', departamento: '', dataEntrega: '', responsavelEntrega: '',
  solicitadoPor: '', departamentoSolicitante: '', dataSolicitacao: '', motivo: '',
  numeroChamado: '', dispositivoId: ''
};

const statusColor = (s: string) => {
  if (s === 'Ativa') return 'bg-success/10 text-success border-success/20';
  if (s === 'Suspensa') return 'bg-warning/10 text-warning border-warning/20';
  if (s === 'Cancelada') return 'bg-destructive/10 text-destructive border-destructive/20';
  return 'bg-muted text-muted-foreground';
};

const LinhasPage = () => {
  const [data, setData] = useStore<Linha[]>('linhas', DEMO_LINHAS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [planos] = useStore<Plano[]>('planos', DEMO_PLANOS);
  const [chips] = useStore<Chip[]>('chips', DEMO_CHIPS);
  const [colaboradores] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);
  const [dispositivos] = useStore<Dispositivo[]>('dispositivos', DEMO_DISPOSITIVOS);
  const [movs, setMovs] = useStore<Movimentacao[]>('movimentacoes', DEMO_MOVIMENTACOES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Linha | null>(null);
  const [form, setForm] = useState<Omit<Linha, 'id'>>(emptyLinha);

  const handleSave = () => {
    if (!form.numero.trim()) { toast.error('Número é obrigatório'); return; }
    if (editing) {
      setData(prev => prev.map(l => l.id === editing.id ? { ...l, ...form } : l));
      toast.success('Linha atualizada');
    } else {
      const newId = generateId();
      setData(prev => [...prev, { id: newId, ...form }]);
      if (form.colaboradorId) {
        const colab = colaboradores.find(c => c.id === form.colaboradorId);
        setMovs(prev => [...prev, {
          id: generateId(), linhaId: newId, evento: 'Entrega de linha',
          usuarioAnterior: '', usuarioNovo: colab?.nome || '',
          numeroChamado: form.numeroChamado, solicitante: form.solicitadoPor,
          responsavelTI: form.responsavelEntrega, data: form.dataEntrega || new Date().toISOString().split('T')[0],
          observacoes: form.motivo
        }]);
      }
      toast.success('Linha cadastrada');
    }
    setOpen(false); setEditing(null); setForm(emptyLinha);
  };

  const handleEdit = (l: Linha) => { setEditing(l); setForm({ ...l }); setOpen(true); };
  const handleDelete = (id: string) => { setData(prev => prev.filter(l => l.id !== id)); toast.success('Linha removida'); };

  const getName = (list: { id: string; nome?: string }[], id: string) => list.find(i => i.id === id)?.nome || '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Linhas Telefônicas</h1><p className="text-muted-foreground">Gerencie as linhas cadastradas</p></div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(emptyLinha); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Nova Linha</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Linha</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Número</Label><Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="(11) 99999-0000" /></div>
                <div className="space-y-1"><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Linha['status'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Ativa">Ativa</SelectItem><SelectItem value="Suspensa">Suspensa</SelectItem><SelectItem value="Cancelada">Cancelada</SelectItem><SelectItem value="Em estoque">Em estoque</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Operadora</Label>
                  <Select value={form.operadoraId} onValueChange={v => setForm({ ...form, operadoraId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{operadoras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Plano</Label>
                  <Select value={form.planoId} onValueChange={v => setForm({ ...form, planoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{planos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Chip</Label>
                  <Select value={form.chipId} onValueChange={v => setForm({ ...form, chipId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{chips.map(c => <SelectItem key={c.id} value={c.id}>{c.iccid}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Colaborador</Label>
                  <Select value={form.colaboradorId} onValueChange={v => { const c = colaboradores.find(x => x.id === v); setForm({ ...form, colaboradorId: v, departamento: c?.departamento || '' }); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{colaboradores.filter(c => c.status === 'Ativo').map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Dispositivo</Label>
                  <Select value={form.dispositivoId} onValueChange={v => setForm({ ...form, dispositivoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{dispositivos.map(d => <SelectItem key={d.id} value={d.id}>{d.marca} {d.modelo}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Nº Chamado</Label><Input value={form.numeroChamado} onChange={e => setForm({ ...form, numeroChamado: e.target.value })} placeholder="GLPI-0000" /></div>
                <div className="space-y-1"><Label>Motivo</Label>
                  <Select value={form.motivo} onValueChange={v => setForm({ ...form, motivo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novo colaborador">Novo colaborador</SelectItem>
                      <SelectItem value="Substituição">Substituição</SelectItem>
                      <SelectItem value="Projeto">Projeto</SelectItem>
                      <SelectItem value="Linha temporária">Linha temporária</SelectItem>
                      <SelectItem value="Linha de plantão">Linha de plantão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Solicitado por</Label><Input value={form.solicitadoPor} onChange={e => setForm({ ...form, solicitadoPor: e.target.value })} /></div>
                <div className="space-y-1"><Label>Responsável Entrega (TI)</Label><Input value={form.responsavelEntrega} onChange={e => setForm({ ...form, responsavelEntrega: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Data Entrega</Label><Input type="date" value={form.dataEntrega} onChange={e => setForm({ ...form, dataEntrega: e.target.value })} /></div>
                <div className="space-y-1"><Label>Depto Solicitante</Label><Input value={form.departamentoSolicitante} onChange={e => setForm({ ...form, departamentoSolicitante: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Número</TableHead><TableHead>Operadora</TableHead><TableHead>Plano</TableHead><TableHead>Colaborador</TableHead><TableHead>Depto</TableHead><TableHead>Chamado</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.numero}</TableCell>
                <TableCell>{getName(operadoras, l.operadoraId)}</TableCell>
                <TableCell>{getName(planos, l.planoId)}</TableCell>
                <TableCell>{getName(colaboradores, l.colaboradorId)}</TableCell>
                <TableCell>{l.departamento || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{l.numeroChamado || '-'}</TableCell>
                <TableCell><Badge className={statusColor(l.status)} variant="outline">{l.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(l)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma linha cadastrada</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default LinhasPage;

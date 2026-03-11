import { useState } from 'react';
import { useStore, DEMO_CHIPS, DEMO_OPERADORAS, generateId } from '@/lib/store';
import type { Chip, Operadora } from '@/lib/store';
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

const emptyChip: Omit<Chip, 'id'> = { iccid: '', operadoraId: '', tipo: 'SIM', status: 'Disponível', dataAtivacao: '', observacoes: '' };

const statusColor = (s: string) => {
  if (s === 'Disponível') return 'bg-success/10 text-success border-success/20';
  if (s === 'Em uso') return 'bg-info/10 text-info border-info/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
};

const ChipsPage = () => {
  const [data, setData] = useStore<Chip[]>('chips', DEMO_CHIPS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Chip | null>(null);
  const [form, setForm] = useState<Omit<Chip, 'id'>>(emptyChip);

  const handleSave = () => {
    if (!form.iccid.trim()) { toast.error('ICCID é obrigatório'); return; }
    if (editing) {
      setData(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast.success('Chip atualizado');
    } else {
      setData(prev => [...prev, { id: generateId(), ...form }]);
      toast.success('Chip cadastrado');
    }
    setOpen(false); setEditing(null); setForm(emptyChip);
  };

  const handleEdit = (c: Chip) => { setEditing(c); setForm({ ...c }); setOpen(true); };
  const handleDelete = (id: string) => { setData(prev => prev.filter(c => c.id !== id)); toast.success('Chip removido'); };
  const getOpName = (id: string) => operadoras.find(o => o.id === id)?.nome || '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Chips</h1><p className="text-muted-foreground">Gerencie os chips cadastrados</p></div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(emptyChip); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Chip</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Chip</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>ICCID</Label><Input value={form.iccid} onChange={e => setForm({ ...form, iccid: e.target.value })} /></div>
              <div className="space-y-1"><Label>Operadora</Label>
                <Select value={form.operadoraId} onValueChange={v => setForm({ ...form, operadoraId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{operadoras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v as Chip['tipo'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="eSIM">eSIM</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Chip['status'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Disponível">Disponível</SelectItem><SelectItem value="Em uso">Em uso</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Data de Ativação</Label><Input type="date" value={form.dataAtivacao} onChange={e => setForm({ ...form, dataAtivacao: e.target.value })} /></div>
              <div className="space-y-1"><Label>Observações</Label><Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>ICCID</TableHead><TableHead>Operadora</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Ativação</TableHead><TableHead className="w-24">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">{c.iccid}</TableCell>
                <TableCell>{getOpName(c.operadoraId)}</TableCell>
                <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                <TableCell><Badge className={statusColor(c.status)} variant="outline">{c.status}</Badge></TableCell>
                <TableCell>{c.dataAtivacao || '-'}</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum chip cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default ChipsPage;

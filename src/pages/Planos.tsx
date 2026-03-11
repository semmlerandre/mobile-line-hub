import { useState } from 'react';
import { useStore, DEMO_PLANOS, DEMO_OPERADORAS, generateId } from '@/lib/store';
import type { Plano, Operadora } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyPlano: Omit<Plano, 'id'> = { operadoraId: '', nome: '', tipo: 'Voz + Dados', franquiaDados: '', minutos: '', valorMensal: 0, observacoes: '' };

const PlanosPage = () => {
  const [data, setData] = useStore<Plano[]>('planos', DEMO_PLANOS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plano | null>(null);
  const [form, setForm] = useState<Omit<Plano, 'id'>>(emptyPlano);

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editing) {
      setData(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
      toast.success('Plano atualizado');
    } else {
      setData(prev => [...prev, { id: generateId(), ...form }]);
      toast.success('Plano cadastrado');
    }
    setOpen(false); setEditing(null); setForm(emptyPlano);
  };

  const handleEdit = (p: Plano) => { setEditing(p); setForm({ ...p }); setOpen(true); };
  const handleDelete = (id: string) => { setData(prev => prev.filter(p => p.id !== id)); toast.success('Plano removido'); };
  const getOpName = (id: string) => operadoras.find(o => o.id === id)?.nome || '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Planos</h1><p className="text-muted-foreground">Gerencie os planos cadastrados</p></div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(emptyPlano); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Plano</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Plano</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Operadora</Label>
                <Select value={form.operadoraId} onValueChange={v => setForm({ ...form, operadoraId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{operadoras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-1"><Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v as Plano['tipo'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Voz">Voz</SelectItem>
                    <SelectItem value="Dados">Dados</SelectItem>
                    <SelectItem value="Voz + Dados">Voz + Dados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Franquia de Dados</Label><Input value={form.franquiaDados} onChange={e => setForm({ ...form, franquiaDados: e.target.value })} /></div>
                <div className="space-y-1"><Label>Minutos</Label><Input value={form.minutos} onChange={e => setForm({ ...form, minutos: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Valor Mensal (R$)</Label><Input type="number" step="0.01" value={form.valorMensal} onChange={e => setForm({ ...form, valorMensal: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-1"><Label>Observações</Label><Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nome</TableHead><TableHead>Operadora</TableHead><TableHead>Tipo</TableHead><TableHead>Franquia</TableHead><TableHead>Minutos</TableHead><TableHead>Valor</TableHead><TableHead className="w-24">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{getOpName(p.operadoraId)}</TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell>{p.franquiaDados}</TableCell>
                <TableCell>{p.minutos}</TableCell>
                <TableCell>R$ {p.valorMensal.toFixed(2)}</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum plano cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default PlanosPage;

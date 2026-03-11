import { useState } from 'react';
import { useStore, DEMO_COLABORADORES, generateId } from '@/lib/store';
import type { Colaborador } from '@/lib/store';
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

const emptyColab: Omit<Colaborador, 'id'> = { nome: '', matricula: '', departamento: '', cargo: '', email: '', status: 'Ativo' };

const ColaboradoresPage = () => {
  const [data, setData] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [form, setForm] = useState<Omit<Colaborador, 'id'>>(emptyColab);

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editing) {
      setData(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast.success('Colaborador atualizado');
    } else {
      setData(prev => [...prev, { id: generateId(), ...form }]);
      toast.success('Colaborador cadastrado');
    }
    setOpen(false); setEditing(null); setForm(emptyColab);
  };

  const handleEdit = (c: Colaborador) => { setEditing(c); setForm({ ...c }); setOpen(true); };
  const handleDelete = (id: string) => { setData(prev => prev.filter(c => c.id !== id)); toast.success('Colaborador removido'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Colaboradores</h1><p className="text-muted-foreground">Gerencie os colaboradores</p></div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(emptyColab); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Colaborador</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Colaborador</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Matrícula</Label><Input value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} /></div>
                <div className="space-y-1"><Label>Departamento</Label><Input value={form.departamento} onChange={e => setForm({ ...form, departamento: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Cargo</Label><Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} /></div>
                <div className="space-y-1"><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Colaborador['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Desligado">Desligado</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nome</TableHead><TableHead>Matrícula</TableHead><TableHead>Departamento</TableHead><TableHead>Cargo</TableHead><TableHead>E-mail</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.matricula}</TableCell>
                <TableCell>{c.departamento}</TableCell>
                <TableCell>{c.cargo}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell><Badge className={c.status === 'Ativo' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'} variant="outline">{c.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum colaborador cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default ColaboradoresPage;

import { useState } from 'react';
import { useStore, DEMO_OPERADORAS, generateId } from '@/lib/store';
import type { Operadora } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyOp: Omit<Operadora, 'id'> = { nome: '', cnpj: '', email: '', telefone: '', contatoComercial: '', observacoes: '' };

const OperadorasPage = () => {
  const [data, setData] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Operadora | null>(null);
  const [form, setForm] = useState<Omit<Operadora, 'id'>>(emptyOp);

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editing) {
      setData(prev => prev.map(o => o.id === editing.id ? { ...o, ...form } : o));
      toast.success('Operadora atualizada');
    } else {
      setData(prev => [...prev, { id: generateId(), ...form }]);
      toast.success('Operadora cadastrada');
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyOp);
  };

  const handleEdit = (op: Operadora) => {
    setEditing(op);
    setForm({ nome: op.nome, cnpj: op.cnpj, email: op.email, telefone: op.telefone, contatoComercial: op.contatoComercial, observacoes: op.observacoes });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(o => o.id !== id));
    toast.success('Operadora removida');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operadoras</h1>
          <p className="text-muted-foreground">Gerencie as operadoras cadastradas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyOp); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Operadora</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Operadora</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {(['nome', 'cnpj', 'email', 'telefone', 'contatoComercial', 'observacoes'] as const).map(field => (
                <div key={field} className="space-y-1">
                  <Label>{field === 'contatoComercial' ? 'Contato Comercial' : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  <Input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                </div>
              ))}
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(op => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.nome}</TableCell>
                  <TableCell>{op.cnpj}</TableCell>
                  <TableCell>{op.email}</TableCell>
                  <TableCell>{op.telefone}</TableCell>
                  <TableCell>{op.contatoComercial}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(op)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(op.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma operadora cadastrada</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperadorasPage;

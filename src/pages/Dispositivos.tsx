import { useState } from 'react';
import { useStore, DEMO_DISPOSITIVOS, generateId } from '@/lib/store';
import type { Dispositivo } from '@/lib/store';
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

const emptyDisp: Omit<Dispositivo, 'id'> = { marca: '', modelo: '', imei: '', numeroPatrimonio: '', dataAquisicao: '', status: 'Disponível' };

const statusColor = (s: string) => {
  if (s === 'Disponível') return 'bg-success/10 text-success border-success/20';
  if (s === 'Em uso') return 'bg-info/10 text-info border-info/20';
  if (s === 'Manutenção') return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
};

const DispositivosPage = () => {
  const [data, setData] = useStore<Dispositivo[]>('dispositivos', DEMO_DISPOSITIVOS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dispositivo | null>(null);
  const [form, setForm] = useState<Omit<Dispositivo, 'id'>>(emptyDisp);

  const handleSave = () => {
    if (!form.marca.trim()) { toast.error('Marca é obrigatória'); return; }
    if (editing) {
      setData(prev => prev.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast.success('Dispositivo atualizado');
    } else {
      setData(prev => [...prev, { id: generateId(), ...form }]);
      toast.success('Dispositivo cadastrado');
    }
    setOpen(false); setEditing(null); setForm(emptyDisp);
  };

  const handleEdit = (d: Dispositivo) => { setEditing(d); setForm({ ...d }); setOpen(true); };
  const handleDelete = (id: string) => { setData(prev => prev.filter(d => d.id !== id)); toast.success('Dispositivo removido'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Dispositivos</h1><p className="text-muted-foreground">Gerencie os dispositivos cadastrados</p></div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(emptyDisp); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Dispositivo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Dispositivo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Marca</Label><Input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} /></div>
                <div className="space-y-1"><Label>Modelo</Label><Input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>IMEI</Label><Input value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Nº Patrimônio</Label><Input value={form.numeroPatrimonio} onChange={e => setForm({ ...form, numeroPatrimonio: e.target.value })} /></div>
                <div className="space-y-1"><Label>Data Aquisição</Label><Input type="date" value={form.dataAquisicao} onChange={e => setForm({ ...form, dataAquisicao: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Dispositivo['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponível">Disponível</SelectItem><SelectItem value="Em uso">Em uso</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem><SelectItem value="Descartado">Descartado</SelectItem>
                  </SelectContent>
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
            <TableHead>Marca</TableHead><TableHead>Modelo</TableHead><TableHead>IMEI</TableHead><TableHead>Patrimônio</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.marca}</TableCell>
                <TableCell>{d.modelo}</TableCell>
                <TableCell className="font-mono text-sm">{d.imei}</TableCell>
                <TableCell>{d.numeroPatrimonio}</TableCell>
                <TableCell><Badge className={statusColor(d.status)} variant="outline">{d.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(d)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum dispositivo cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default DispositivosPage;

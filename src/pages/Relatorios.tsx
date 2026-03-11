import { useState } from 'react';
import { useStore, DEMO_LINHAS, DEMO_OPERADORAS, DEMO_PLANOS, DEMO_COLABORADORES, DEMO_DISPOSITIVOS, DEMO_CHIPS, DEMO_MOVIMENTACOES } from '@/lib/store';
import type { Linha, Operadora, Plano, Colaborador, Dispositivo, Chip, Movimentacao } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success('Arquivo exportado');
}

const RelatoriosPage = () => {
  const [linhas] = useStore<Linha[]>('linhas', DEMO_LINHAS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [planos] = useStore<Plano[]>('planos', DEMO_PLANOS);
  const [colaboradores] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);
  const [dispositivos] = useStore<Dispositivo[]>('dispositivos', DEMO_DISPOSITIVOS);
  const [chips] = useStore<Chip[]>('chips', DEMO_CHIPS);
  const [movs] = useStore<Movimentacao[]>('movimentacoes', DEMO_MOVIMENTACOES);

  const [filterOp, setFilterOp] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getName = (list: { id: string; nome?: string }[], id: string) => list.find(i => i.id === id)?.nome || '-';

  const filteredLinhas = linhas.filter(l => {
    if (filterOp !== 'all' && l.operadoraId !== filterOp) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    return true;
  });

  const exportLinhas = () => {
    const headers = ['Número', 'Operadora', 'Plano', 'Colaborador', 'Departamento', 'Status', 'Chamado'];
    const rows = filteredLinhas.map(l => [
      l.numero, getName(operadoras, l.operadoraId), getName(planos, l.planoId),
      getName(colaboradores, l.colaboradorId), l.departamento || '', l.status, l.numeroChamado || ''
    ]);
    exportCSV(headers, rows, 'relatorio-linhas.csv');
  };

  const exportHistorico = () => {
    const headers = ['Data', 'Linha', 'Evento', 'Usuário Anterior', 'Usuário Novo', 'Chamado', 'Responsável TI', 'Observações'];
    const rows = movs.map(m => [
      m.data, linhas.find(l => l.id === m.linhaId)?.numero || '', m.evento,
      m.usuarioAnterior, m.usuarioNovo, m.numeroChamado, m.responsavelTI, m.observacoes
    ]);
    exportCSV(headers, rows, 'relatorio-historico.csv');
  };

  const exportCustos = () => {
    const headers = ['Linha', 'Operadora', 'Plano', 'Valor Mensal'];
    const rows = linhas.filter(l => l.status === 'Ativa').map(l => {
      const plano = planos.find(p => p.id === l.planoId);
      return [l.numero, getName(operadoras, l.operadoraId), plano?.nome || '', (plano?.valorMensal || 0).toFixed(2)];
    });
    exportCSV(headers, rows, 'relatorio-custos.csv');
  };

  const exportInventario = () => {
    const headers = ['Tipo', 'Identificador', 'Status', 'Detalhes'];
    const rows: string[][] = [
      ...chips.filter(c => c.status === 'Disponível').map(c => ['Chip', c.iccid, c.status, c.tipo]),
      ...dispositivos.filter(d => d.status === 'Disponível').map(d => ['Dispositivo', `${d.marca} ${d.modelo}`, d.status, d.imei]),
      ...linhas.filter(l => l.status === 'Em estoque').map(l => ['Linha', l.numero, l.status, '']),
    ];
    exportCSV(headers, rows, 'relatorio-inventario.csv');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Consulte e exporte relatórios</p></div>

      <Tabs defaultValue="linhas">
        <TabsList>
          <TabsTrigger value="linhas">Linhas</TabsTrigger>
          <TabsTrigger value="inventario">Inventário</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="linhas" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1"><p className="text-sm text-muted-foreground">Operadora</p>
              <Select value={filterOp} onValueChange={setFilterOp}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas</SelectItem>{operadoras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><p className="text-sm text-muted-foreground">Status</p>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Ativa">Ativa</SelectItem><SelectItem value="Suspensa">Suspensa</SelectItem><SelectItem value="Cancelada">Cancelada</SelectItem><SelectItem value="Em estoque">Em estoque</SelectItem></SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportLinhas}><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Operadora</TableHead><TableHead>Plano</TableHead><TableHead>Colaborador</TableHead><TableHead>Depto</TableHead><TableHead>Status</TableHead><TableHead>Chamado</TableHead></TableRow></TableHeader>
              <TableBody>{filteredLinhas.map(l => (
                <TableRow key={l.id}><TableCell>{l.numero}</TableCell><TableCell>{getName(operadoras, l.operadoraId)}</TableCell><TableCell>{getName(planos, l.planoId)}</TableCell><TableCell>{getName(colaboradores, l.colaboradorId)}</TableCell><TableCell>{l.departamento || '-'}</TableCell><TableCell><Badge variant="outline">{l.status}</Badge></TableCell><TableCell>{l.numeroChamado || '-'}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-4">
          <Button variant="outline" onClick={exportInventario}><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-base">Chips Disponíveis</CardTitle></CardHeader><CardContent>
              <p className="text-3xl font-bold">{chips.filter(c => c.status === 'Disponível').length}</p>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Dispositivos Disponíveis</CardTitle></CardHeader><CardContent>
              <p className="text-3xl font-bold">{dispositivos.filter(d => d.status === 'Disponível').length}</p>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Linhas em Estoque</CardTitle></CardHeader><CardContent>
              <p className="text-3xl font-bold">{linhas.filter(l => l.status === 'Em estoque').length}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="custos" className="space-y-4">
          <Button variant="outline" onClick={exportCustos}><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Linha</TableHead><TableHead>Operadora</TableHead><TableHead>Plano</TableHead><TableHead>Valor Mensal</TableHead></TableRow></TableHeader>
              <TableBody>{linhas.filter(l => l.status === 'Ativa').map(l => {
                const plano = planos.find(p => p.id === l.planoId);
                return (<TableRow key={l.id}><TableCell>{l.numero}</TableCell><TableCell>{getName(operadoras, l.operadoraId)}</TableCell><TableCell>{plano?.nome || '-'}</TableCell><TableCell>R$ {(plano?.valorMensal || 0).toFixed(2)}</TableCell></TableRow>);
              })}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Button variant="outline" onClick={exportHistorico}><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Linha</TableHead><TableHead>Evento</TableHead><TableHead>Anterior</TableHead><TableHead>Novo</TableHead><TableHead>Chamado</TableHead><TableHead>Resp. TI</TableHead></TableRow></TableHeader>
              <TableBody>{movs.map(m => (
                <TableRow key={m.id}><TableCell>{m.data}</TableCell><TableCell>{linhas.find(l => l.id === m.linhaId)?.numero || '-'}</TableCell><TableCell><Badge variant="outline">{m.evento}</Badge></TableCell><TableCell>{m.usuarioAnterior || '-'}</TableCell><TableCell>{m.usuarioNovo || '-'}</TableCell><TableCell>{m.numeroChamado}</TableCell><TableCell>{m.responsavelTI}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosPage;

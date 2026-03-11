import { useStore, DEMO_LINHAS, DEMO_OPERADORAS, DEMO_PLANOS, DEMO_COLABORADORES, DEMO_DISPOSITIVOS } from '@/lib/store';
import type { Linha, Operadora, Plano, Colaborador, Dispositivo } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign } from 'lucide-react';

const CustosPage = () => {
  const [linhas] = useStore<Linha[]>('linhas', DEMO_LINHAS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [planos] = useStore<Plano[]>('planos', DEMO_PLANOS);
  const [colaboradores] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);

  const linhasAtivas = linhas.filter(l => l.status === 'Ativa');

  const custoTotal = linhasAtivas.reduce((acc, l) => {
    const plano = planos.find(p => p.id === l.planoId);
    return acc + (plano?.valorMensal || 0);
  }, 0);

  const custoPorOp = operadoras.map(op => {
    const cost = linhasAtivas
      .filter(l => l.operadoraId === op.id)
      .reduce((acc, l) => {
        const plano = planos.find(p => p.id === l.planoId);
        return acc + (plano?.valorMensal || 0);
      }, 0);
    return { ...op, custo: cost, qtd: linhasAtivas.filter(l => l.operadoraId === op.id).length };
  }).filter(o => o.qtd > 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Custos</h1><p className="text-muted-foreground">Visão de custos mensais</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4">
          <DollarSign className="w-10 h-10 text-warning" />
          <div><p className="text-sm text-muted-foreground">Custo Total Mensal</p><p className="text-2xl font-bold">R$ {custoTotal.toFixed(2)}</p></div>
        </CardContent></Card>
        {custoPorOp.map(op => (
          <Card key={op.id}><CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{op.nome}</p>
            <p className="text-xl font-bold">R$ {op.custo.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{op.qtd} linhas</p>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardHeader><CardTitle className="text-base">Detalhamento por Linha</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Linha</TableHead><TableHead>Colaborador</TableHead><TableHead>Operadora</TableHead><TableHead>Plano</TableHead><TableHead>Valor Mensal</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {linhasAtivas.map(l => {
                const plano = planos.find(p => p.id === l.planoId);
                const op = operadoras.find(o => o.id === l.operadoraId);
                const colab = colaboradores.find(c => c.id === l.colaboradorId);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.numero}</TableCell>
                    <TableCell>{colab?.nome || '-'}</TableCell>
                    <TableCell>{op?.nome || '-'}</TableCell>
                    <TableCell>{plano?.nome || '-'}</TableCell>
                    <TableCell>R$ {(plano?.valorMensal || 0).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustosPage;

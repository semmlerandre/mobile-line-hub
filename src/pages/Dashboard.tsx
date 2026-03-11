import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore, DEMO_LINHAS, DEMO_OPERADORAS, DEMO_CHIPS, DEMO_DISPOSITIVOS, DEMO_PLANOS, DEMO_COLABORADORES } from '@/lib/store';
import type { Linha, Operadora, Chip, Dispositivo, Plano, Colaborador } from '@/lib/store';
import { Phone, Cpu, Smartphone, DollarSign, Users, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const [linhas] = useStore<Linha[]>('linhas', DEMO_LINHAS);
  const [operadoras] = useStore<Operadora[]>('operadoras', DEMO_OPERADORAS);
  const [chips] = useStore<Chip[]>('chips', DEMO_CHIPS);
  const [dispositivos] = useStore<Dispositivo[]>('dispositivos', DEMO_DISPOSITIVOS);
  const [planos] = useStore<Plano[]>('planos', DEMO_PLANOS);
  const [colaboradores] = useStore<Colaborador[]>('colaboradores', DEMO_COLABORADORES);

  const linhasAtivas = linhas.filter(l => l.status === 'Ativa').length;
  const chipsDisponiveis = chips.filter(c => c.status === 'Disponível').length;
  const dispositivosDisponiveis = dispositivos.filter(d => d.status === 'Disponível').length;

  const custoTotal = linhas
    .filter(l => l.status === 'Ativa')
    .reduce((acc, l) => {
      const plano = planos.find(p => p.id === l.planoId);
      return acc + (plano?.valorMensal || 0);
    }, 0);

  // Lines per operator
  const linhasPorOperadora = operadoras.map(op => ({
    name: op.nome,
    value: linhas.filter(l => l.operadoraId === op.id && l.status === 'Ativa').length,
  })).filter(d => d.value > 0);

  // Lines per department
  const depts = [...new Set(linhas.filter(l => l.departamento).map(l => l.departamento))];
  const linhasPorDepto = depts.map(d => ({
    name: d,
    value: linhas.filter(l => l.departamento === d && l.status === 'Ativa').length,
  }));

  // Cost per operator
  const custoPorOperadora = operadoras.map(op => {
    const cost = linhas
      .filter(l => l.operadoraId === op.id && l.status === 'Ativa')
      .reduce((acc, l) => {
        const plano = planos.find(p => p.id === l.planoId);
        return acc + (plano?.valorMensal || 0);
      }, 0);
    return { name: op.nome, valor: cost };
  }).filter(d => d.valor > 0);

  const cards = [
    { title: 'Linhas Ativas', value: linhasAtivas, icon: Phone, color: 'text-primary' },
    { title: 'Chips Disponíveis', value: chipsDisponiveis, icon: Cpu, color: 'text-info' },
    { title: 'Dispositivos Disponíveis', value: dispositivosDisponiveis, icon: Smartphone, color: 'text-success' },
    { title: 'Custo Mensal Total', value: `R$ ${custoTotal.toFixed(2)}`, icon: DollarSign, color: 'text-warning' },
    { title: 'Colaboradores Ativos', value: colaboradores.filter(c => c.status === 'Ativo').length, icon: Users, color: 'text-primary' },
    { title: 'Operadoras', value: operadoras.length, icon: Building2, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de linhas móveis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`w-10 h-10 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Linhas por Operadora</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={linhasPorOperadora} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {linhasPorOperadora.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Custos por Operadora</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={custoPorOperadora}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Linhas por Departamento</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={linhasPorDepto}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

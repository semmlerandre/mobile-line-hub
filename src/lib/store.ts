// Centralized data store using localStorage
import { useState, useEffect, useCallback } from 'react';

export interface Operadora {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  contatoComercial: string;
  observacoes: string;
}

export interface Plano {
  id: string;
  operadoraId: string;
  nome: string;
  tipo: 'Voz' | 'Dados' | 'Voz + Dados';
  franquiaDados: string;
  minutos: string;
  valorMensal: number;
  observacoes: string;
}

export interface Chip {
  id: string;
  iccid: string;
  operadoraId: string;
  tipo: 'SIM' | 'eSIM';
  status: 'Disponível' | 'Em uso' | 'Cancelado';
  dataAtivacao: string;
  observacoes: string;
}

export interface Linha {
  id: string;
  numero: string;
  operadoraId: string;
  planoId: string;
  chipId: string;
  status: 'Ativa' | 'Suspensa' | 'Cancelada' | 'Em estoque';
  colaboradorId: string;
  departamento: string;
  dataEntrega: string;
  responsavelEntrega: string;
  solicitadoPor: string;
  departamentoSolicitante: string;
  dataSolicitacao: string;
  motivo: string;
  numeroChamado: string;
  dispositivoId: string;
}

export interface Dispositivo {
  id: string;
  marca: string;
  modelo: string;
  imei: string;
  numeroPatrimonio: string;
  dataAquisicao: string;
  status: 'Disponível' | 'Em uso' | 'Manutenção' | 'Descartado';
}

export interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
  departamento: string;
  cargo: string;
  email: string;
  status: 'Ativo' | 'Desligado';
}

export interface Movimentacao {
  id: string;
  linhaId: string;
  evento: string;
  usuarioAnterior: string;
  usuarioNovo: string;
  numeroChamado: string;
  solicitante: string;
  responsavelTI: string;
  data: string;
  observacoes: string;
}

export interface SystemConfig {
  nomeDoSistema: string;
  logoUrl: string;
}

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [data, setData] = useState<T>(() => getStorage(key, defaultValue));

  const setValue = useCallback((val: T | ((prev: T) => T)) => {
    setData(prev => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
      setStorage(key, next);
      return next;
    });
  }, [key]);

  return [data, setValue];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Demo data
export const DEMO_OPERADORAS: Operadora[] = [
  { id: '1', nome: 'Vivo', cnpj: '02.449.992/0001-64', email: 'contato@vivo.com.br', telefone: '(11) 1058', contatoComercial: 'João Silva', observacoes: '' },
  { id: '2', nome: 'Claro', cnpj: '40.432.544/0001-47', email: 'contato@claro.com.br', telefone: '(11) 1052', contatoComercial: 'Maria Santos', observacoes: '' },
  { id: '3', nome: 'TIM', cnpj: '04.206.050/0001-80', email: 'contato@tim.com.br', telefone: '(11) 1056', contatoComercial: 'Pedro Costa', observacoes: '' },
];

export const DEMO_PLANOS: Plano[] = [
  { id: '1', operadoraId: '1', nome: 'Empresarial 50GB', tipo: 'Voz + Dados', franquiaDados: '50GB', minutos: 'Ilimitado', valorMensal: 89.90, observacoes: '' },
  { id: '2', operadoraId: '2', nome: 'Corporativo 30GB', tipo: 'Dados', franquiaDados: '30GB', minutos: '500', valorMensal: 59.90, observacoes: '' },
  { id: '3', operadoraId: '3', nome: 'TIM Empresa 100GB', tipo: 'Voz + Dados', franquiaDados: '100GB', minutos: 'Ilimitado', valorMensal: 129.90, observacoes: '' },
];

export const DEMO_COLABORADORES: Colaborador[] = [
  { id: '1', nome: 'Carlos Oliveira', matricula: 'MAT-001', departamento: 'TI', cargo: 'Analista de Sistemas', email: 'carlos@empresa.com', status: 'Ativo' },
  { id: '2', nome: 'Ana Pereira', matricula: 'MAT-002', departamento: 'Comercial', cargo: 'Gerente Comercial', email: 'ana@empresa.com', status: 'Ativo' },
  { id: '3', nome: 'Roberto Lima', matricula: 'MAT-003', departamento: 'Financeiro', cargo: 'Analista Financeiro', email: 'roberto@empresa.com', status: 'Ativo' },
  { id: '4', nome: 'Fernanda Souza', matricula: 'MAT-004', departamento: 'RH', cargo: 'Coordenadora RH', email: 'fernanda@empresa.com', status: 'Ativo' },
];

export const DEMO_CHIPS: Chip[] = [
  { id: '1', iccid: '8955010140000000001', operadoraId: '1', tipo: 'SIM', status: 'Em uso', dataAtivacao: '2024-01-15', observacoes: '' },
  { id: '2', iccid: '8955010140000000002', operadoraId: '2', tipo: 'eSIM', status: 'Disponível', dataAtivacao: '', observacoes: '' },
  { id: '3', iccid: '8955010140000000003', operadoraId: '3', tipo: 'SIM', status: 'Em uso', dataAtivacao: '2024-03-10', observacoes: '' },
];

export const DEMO_DISPOSITIVOS: Dispositivo[] = [
  { id: '1', marca: 'Samsung', modelo: 'Galaxy S24', imei: '350000000000001', numeroPatrimonio: 'PAT-001', dataAquisicao: '2024-01-10', status: 'Em uso' },
  { id: '2', marca: 'Apple', modelo: 'iPhone 15', imei: '350000000000002', numeroPatrimonio: 'PAT-002', dataAquisicao: '2024-02-20', status: 'Disponível' },
  { id: '3', marca: 'Motorola', modelo: 'Edge 40', imei: '350000000000003', numeroPatrimonio: 'PAT-003', dataAquisicao: '2024-03-05', status: 'Em uso' },
];

export const DEMO_LINHAS: Linha[] = [
  { id: '1', numero: '(11) 99999-0001', operadoraId: '1', planoId: '1', chipId: '1', status: 'Ativa', colaboradorId: '1', departamento: 'TI', dataEntrega: '2024-01-20', responsavelEntrega: 'Admin TI', solicitadoPor: 'Gerente TI', departamentoSolicitante: 'TI', dataSolicitacao: '2024-01-15', motivo: 'Novo colaborador', numeroChamado: 'GLPI-8892', dispositivoId: '1' },
  { id: '2', numero: '(11) 99999-0002', operadoraId: '2', planoId: '2', chipId: '3', status: 'Ativa', colaboradorId: '2', departamento: 'Comercial', dataEntrega: '2024-03-15', responsavelEntrega: 'Admin TI', solicitadoPor: 'Diretor Comercial', departamentoSolicitante: 'Comercial', dataSolicitacao: '2024-03-10', motivo: 'Substituição', numeroChamado: 'INC-10022', dispositivoId: '3' },
  { id: '3', numero: '(11) 99999-0003', operadoraId: '3', planoId: '3', chipId: '', status: 'Em estoque', colaboradorId: '', departamento: '', dataEntrega: '', responsavelEntrega: '', solicitadoPor: '', departamentoSolicitante: '', dataSolicitacao: '', motivo: '', numeroChamado: '', dispositivoId: '' },
];

export const DEMO_MOVIMENTACOES: Movimentacao[] = [
  { id: '1', linhaId: '1', evento: 'Entrega de linha', usuarioAnterior: '', usuarioNovo: 'Carlos Oliveira', numeroChamado: 'GLPI-8892', solicitante: 'Gerente TI', responsavelTI: 'Admin TI', data: '2024-01-20', observacoes: 'Linha entregue para novo colaborador' },
  { id: '2', linhaId: '2', evento: 'Entrega de linha', usuarioAnterior: '', usuarioNovo: 'Ana Pereira', numeroChamado: 'INC-10022', solicitante: 'Diretor Comercial', responsavelTI: 'Admin TI', data: '2024-03-15', observacoes: 'Substituição de aparelho antigo' },
];

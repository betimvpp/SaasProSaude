export interface PacienteData {
  pacienteNome: string;
  tecnicos: TecnicoData[];
}

export interface TecnicoData {
  tecnico: string;
  dias: DiaValor[];
}

export interface DiaValor {
  dia: number;
  observacao: string;
  valor: string;
}

export interface EscalaData {
  paciente_id: string;
  funcionario_id: string;
  nome_colaborador?: string;
  data: string;
  tipo_servico: string;
  valor_recebido: number;
  valor_pago: number;
  pagamentoAR_AV: string;
  horario_gerenciamento?: string;
}

export interface ExcelReaderResult {
  success: boolean;
  data?: PacienteData;
  error?: string;
  escalas?: EscalaData[];
} 
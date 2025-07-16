import * as XLSX from "xlsx";
import { PacienteData, TecnicoData, DiaValor, EscalaData, ExcelReaderResult } from "./types";
import supabase from "./supabase";

const ignorePatterns = [
  "DIAGNOSTICO",
  "DISPOSITIVO",
  "PERÍODO",
  "ESCALA",
  "PACIENTE",
  "COOPERVIDA",
  "HAPVIDA",
  "HOME DOCTOR",
  "REGISTRO",
  "ENDEREÇO",
  "TÉCNICOS",
  "TELEFONE",
  "COREN",
];

function isLinhaIgnorada(texto: string): boolean {
  if (!texto || typeof texto !== "string") return true;
  return ignorePatterns.some((padrao) => texto.toUpperCase().includes(padrao));
}

function getServiceTime(tipoServico: string): string {
  switch (tipoServico.toUpperCase()) {
    case 'SD':
      return '7:00 às 19:00';
    case 'SN':
      return '19:00 às 7:00';
    case 'P':
      return '7:00 às 7:00';
    case 'M':
      return '7:00 às 13:00';
    case 'T':
      return '13:00 às 19:00';
    case 'GR':
      return '7:00 às 7:00'; // GR geralmente é plantão completo
    default:
      return 'Horário não definido';
  }
}

function getPagamentoAR_AV(tipoServico: string): string {
  switch (tipoServico.toUpperCase()) {
    case 'N':
      return 'AR';
    case 'P':
      return 'AR';
    case 'M':
      return 'AR';
    case 'T':
      return 'AR';
    case 'GR':
      return 'AR'; // GR geralmente é AR (A Receber)
    default:
      return 'AR';
  }
}

function contemNumeros(valor: string): boolean {
  return /\d/.test(valor);
}

// Função para contar quantos "GR" existem em uma string
function contarGR(valor: string): number {
  if (!valor || typeof valor !== 'string') return 0;
  
  // Converter para maiúsculo e contar ocorrências de "GR"
  const valorUpper = valor.toUpperCase();
  const matches = valorUpper.match(/GR/g);
  return matches ? matches.length : 0;
}

// Função para extrair o tipo de serviço principal (primeiro tipo encontrado)
function extrairTipoServicoPrincipal(valor: string): string {
  if (!valor || typeof valor !== 'string') return '';
  
  const valorUpper = valor.toUpperCase();
  
  // Procurar por tipos de serviço conhecidos
  if (valorUpper.includes('P')) return 'P';
  if (valorUpper.includes('SN')) return 'SN';
  if (valorUpper.includes('SD')) return 'SD';
  if (valorUpper.includes('M')) return 'M';
  if (valorUpper.includes('T')) return 'T';
  if (valorUpper.includes('Gr')) return 'GR';
  if (valorUpper.includes('C') || valorUpper.includes('GR')) return 'GR';
  
  return valorUpper;
}

// Função para normalizar nomes (sem acentos e lowercase)
function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Função para buscar paciente por correspondência parcial de nome
async function buscarPacientePorNome(nomePaciente: string): Promise<{ paciente_id: string; nome: string } | null> {
  try {

    
    // Primeiro, tentar busca exata - APENAS LEITURA
    const { data: pacienteExato, error: errorExato } = await supabase
      .from("paciente")
      .select("paciente_id, nome")
      .eq("nome", nomePaciente)
      .single();

    if (pacienteExato && !errorExato) {

      return pacienteExato;
    }

    // Se não encontrar, buscar por correspondência parcial - APENAS LEITURA
    const nomeNormalizado = normalizarNome(nomePaciente);

    
    // Buscar todos os pacientes - APENAS LEITURA
    const { data: todosPacientes, error: errorTodos } = await supabase
      .from("paciente")
      .select("paciente_id, nome");

    if (errorTodos || !todosPacientes) {
      console.error("❌ Erro ao buscar todos os pacientes:", errorTodos);
      return null;
    }

    // Procurar por correspondência parcial
    for (const paciente of todosPacientes) {
      const nomeBancoNormalizado = normalizarNome(paciente.nome);
      
      // Verificar se o nome do Excel está contido no nome do banco
      if (nomeBancoNormalizado.includes(nomeNormalizado) || nomeNormalizado.includes(nomeBancoNormalizado)) {

        return paciente;
      }
    }


    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar paciente:", error);
    return null;
  }
}

// Função para buscar funcionário por correspondência parcial de nome
async function buscarFuncionarioPorNome(nomeFuncionario: string): Promise<{ funcionario_id: string; nome: string } | null> {
  try {
    // Primeiro, tentar busca exata
    const { data: funcionarioExato, error: errorExato } = await supabase
      .from("funcionario")
      .select("funcionario_id, nome")
      .eq("nome", nomeFuncionario)
      .single();

    if (funcionarioExato && !errorExato) {
      return funcionarioExato;
    }

    // Se não encontrar, buscar por correspondência parcial
    const nomeNormalizado = normalizarNome(nomeFuncionario);
    
    // Buscar todos os funcionários
    const { data: todosFuncionarios, error: errorTodos } = await supabase
      .from("funcionario")
      .select("funcionario_id, nome");

    if (errorTodos || !todosFuncionarios) {
      return null;
    }

    // Procurar por correspondência parcial
    for (const funcionario of todosFuncionarios) {
      const nomeBancoNormalizado = normalizarNome(funcionario.nome);
      
      // Verificar se o nome do Excel está contido no nome do banco
      if (nomeBancoNormalizado.includes(nomeNormalizado) || nomeNormalizado.includes(nomeBancoNormalizado)) {
        return funcionario;
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return null;
  }
}

export async function lerArquivoExcel(file: File): Promise<ExcelReaderResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let pacienteNome = "";
    const tecnicos: TecnicoData[] = [];

    for (const row of rows as any[]) {
      const rowValues = row.map((cell: any) => (cell || "").toString().trim());

      if ((rowValues[0] || "").toLowerCase().includes("paciente")) {
        pacienteNome = rowValues[0].split(":").pop()?.replace(/"/g, "").trim() || "";
        continue;
      }

      // Detectar técnico se a coluna 1 (índice 1) tiver nome, e coluna 3 (índice 3) for um valor como "P", "F", etc
      const nomeTecnico = rowValues[1];
      const temValorDeEscala = rowValues.slice(3).some((v: any) => v && v !== "");

      if (
        pacienteNome &&
        nomeTecnico &&
        nomeTecnico.length > 2 &&
        !isLinhaIgnorada(nomeTecnico) &&
        temValorDeEscala
      ) {
        const dias: DiaValor[] = [];

        for (let j = 3; j < rowValues.length; j++) {
          const valor = rowValues[j];
          if (valor && valor !== "") {
            dias.push({ dia: j - 2, observacao: "", valor: valor });
          }
        }

        if (dias.length > 0) {
          tecnicos.push({ tecnico: nomeTecnico, dias: dias });
        }
      }
    }

    const pacienteData: PacienteData = { pacienteNome, tecnicos };

    return {
      success: true,
      data: pacienteData
    };
  } catch (error) {
    console.error("Erro ao ler arquivo Excel:", error);
    return {
      success: false,
      error: "Erro ao processar o arquivo Excel"
    };
  }
}

export async function processarEscalasDoExcel(
  pacienteData: PacienteData, 
  mesAno: string
): Promise<ExcelReaderResult> {
  try {
    const escalas: EscalaData[] = [];
    
    // Buscar paciente pelo nome usando busca flexível
    const paciente = await buscarPacientePorNome(pacienteData.pacienteNome);

    if (!paciente) {
      return {
        success: false,
        error: `Paciente "${pacienteData.pacienteNome}" não encontrado no sistema`
      };
    }

    // Para cada técnico, buscar funcionário pelo nome usando busca flexível
    for (const tecnico of pacienteData.tecnicos) {
      const funcionario = await buscarFuncionarioPorNome(tecnico.tecnico);

      if (!funcionario) {
        console.warn(`Funcionário "${tecnico.tecnico}" não encontrado`);
        continue;
      }

      // Para cada dia do técnico, criar escalas
      for (const diaValor of tecnico.dias) {
        const data = `${mesAno}-${diaValor.dia.toString().padStart(2, '0')}`;
        
        // Filtrar escalas que contêm números
        if (contemNumeros(diaValor.valor)) {
          continue; // Pular esta escala
        }
        
        // Extrair o tipo de serviço principal
        const tipoServicoPrincipal = extrairTipoServicoPrincipal(diaValor.valor);
        
        // Se for "C", transformar em "GR"
        let tipoServico = tipoServicoPrincipal;
        if (tipoServico.toUpperCase() === 'C') {
          tipoServico = 'GR';
        }
        
        // Contar quantos "GR" existem na string
        const quantidadeGR = contarGR(diaValor.valor);
        
        // Se não há GR ou apenas um GR, criar uma escala normal
        if (quantidadeGR <= 1) {
          // Verificar se é tipo "MT" para duplicar em "M" e "T"
          if (tipoServico.toUpperCase() === 'MT') {
            // Criar escala com tipo "M"
            const escalaM: EscalaData = {
              paciente_id: paciente.paciente_id,
              funcionario_id: funcionario.funcionario_id,
              nome_colaborador: funcionario.nome,
              data: data,
              tipo_servico: 'M',
              valor_recebido: 0, // Será definido pelo usuário
              valor_pago: 0, 
              pagamentoAR_AV: getPagamentoAR_AV('M'),
              horario_gerenciamento: getServiceTime('M')
            };
            escalas.push(escalaM);

            // Criar escala com tipo "T"
            const escalaT: EscalaData = {
              paciente_id: paciente.paciente_id,
              funcionario_id: funcionario.funcionario_id,
              nome_colaborador: funcionario.nome,
              data: data,
              tipo_servico: 'T',
              valor_recebido: 0, // Será definido pelo usuário
              valor_pago: 0, 
              pagamentoAR_AV: getPagamentoAR_AV('T'),
              horario_gerenciamento: getServiceTime('T')
            };
            escalas.push(escalaT);
          } else {
            const escala: EscalaData = {
              paciente_id: paciente.paciente_id,
              funcionario_id: funcionario.funcionario_id,
              nome_colaborador: funcionario.nome,
              data: data,
              tipo_servico: tipoServico,
              valor_recebido: 0, // Será definido pelo usuário
              valor_pago: 0, 
              pagamentoAR_AV: getPagamentoAR_AV(tipoServico),
              horario_gerenciamento: getServiceTime(tipoServico)
            };
            escalas.push(escala);
          }
        } else {
          // Se há múltiplos GR, criar múltiplas escalas GR
          for (let i = 0; i < quantidadeGR; i++) {
            const escala: EscalaData = {
              paciente_id: paciente.paciente_id,
              funcionario_id: funcionario.funcionario_id,
              nome_colaborador: funcionario.nome,
              data: data,
              tipo_servico: 'GR',
              valor_recebido: 0, // Será definido pelo usuário
              valor_pago: 0, 
              pagamentoAR_AV: getPagamentoAR_AV('GR'),
              horario_gerenciamento: getServiceTime('GR')
            };
            escalas.push(escala);
          }
        }
      }
    }

    return {
      success: true,
      data: pacienteData,
      escalas: escalas
    };
  } catch (error) {
    console.error("Erro ao processar escalas:", error);
    return {
      success: false,
      error: "Erro ao processar as escalas do Excel"
    };
  }
}

export async function salvarEscalasDoExcel(escalas: EscalaData[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("escala")
      .insert(escalas);

    if (error) {
      console.error("Erro ao salvar escalas:", error);
      return {
        success: false,
        error: "Erro ao salvar as escalas no banco de dados"
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Erro ao salvar escalas:", error);
    return {
      success: false,
      error: "Erro interno ao salvar as escalas"
    };
  }
} 
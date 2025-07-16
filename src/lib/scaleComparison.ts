import supabase from "./supabase";
import { PacienteData } from "./types";

// Função auxiliar: normaliza nomes (sem acentos e lowercase)
function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Interface para o resultado da comparação
export interface ComparacaoEscala {
  data: string;
  paciente: string;
  tecnico: string;
  existe: boolean;
  diferente: boolean;
  original?: string;
  novo?: string;
  paciente_id: string;
  tecnico_id: string;
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

// Função principal: compara escalas do Excel com as do banco
export async function handleCompararEscalasSupabase(
  pacientesData: PacienteData[],
  mes: number,
  ano: number
): Promise<ComparacaoEscala[]> {
  try {
    const mesAnoReferencia = `${ano}-${String(mes).padStart(2, "0")}`;
    let comparacoes: ComparacaoEscala[] = [];

    // Loop por paciente > técnico > dias
    for (const pacienteData of pacientesData) {
      // Buscar paciente usando busca flexível
      const pacienteBanco = await buscarPacientePorNome(pacienteData.pacienteNome);

      if (!pacienteBanco) {
        console.warn(`⚠️ Paciente "${pacienteData.pacienteNome}" não encontrado no banco`);
        continue;
      }

      const pacienteId = pacienteBanco.paciente_id;

      for (const tecnicoData of pacienteData.tecnicos) {
        // Buscar funcionário usando busca flexível
        const tecnicoBanco = await buscarFuncionarioPorNome(tecnicoData.tecnico);

        if (!tecnicoBanco) {
          console.warn(`⚠️ Funcionário "${tecnicoData.tecnico}" não encontrado no banco`);
          continue;
        }

        const tecnicoId = tecnicoBanco.funcionario_id;

        for (const diaValor of tecnicoData.dias) {
          const dataFormatada = `${mesAnoReferencia}-${String(diaValor.dia).padStart(2, "0")}`;

          // Consulta se já existe escala no banco
          const { data: escalaExistente, error: escalaError } = await supabase
            .from("escala")
            .select("tipo_servico")
            .eq("paciente_id", pacienteId)
            .eq("funcionario_id", tecnicoId)
            .eq("data", dataFormatada)
            .maybeSingle();

          if (escalaError) {
            console.error(`❌ Erro ao consultar escala para ${dataFormatada}:`, escalaError);
            continue;
          }

          if (escalaExistente) {
            const diferente = escalaExistente.tipo_servico !== diaValor.valor;

            comparacoes.push({
              data: dataFormatada,
              paciente: pacienteData.pacienteNome,
              tecnico: tecnicoData.tecnico,
              existe: true,
              diferente,
              original: escalaExistente.tipo_servico,
              novo: diaValor.valor,
              paciente_id: pacienteId,
              tecnico_id: tecnicoId,
            });

          }
        }
      }
    }

    return comparacoes;
  } catch (error) {
    console.error("❌ Erro na função handleCompararEscalasSupabase:", error);
    throw error;
  }
} 
import supabase from "./supabase";

interface EscalaImportada {
  paciente_id: string;
  funcionario_id: string;
  data: string;
  tipo_servico: string;
  valor_recebido: number;
  valor_pago: number;
  pagamentoAR_AV: string;
  horario_gerenciamento: string;
}

interface ResultadoEnvio {
  sucessos: number;
  erros: number;
  escalasExistentes: number;
  detalhes: {
    sucessos: string[];
    erros: string[];
    escalasExistentes: string[];
  };
}

export async function enviarEscalasImportadas(escalas: EscalaImportada[]): Promise<ResultadoEnvio> {
  const resultado: ResultadoEnvio = {
    sucessos: 0,
    erros: 0,
    escalasExistentes: 0,
    detalhes: {
      sucessos: [],
      erros: [],
      escalasExistentes: []
    }
  };

  for (const escala of escalas) {
    // Verificar se escala já existe
    const { data: escalaExistente, error } = await supabase
      .from("escala")
      .select("escala_id")
      .eq("paciente_id", escala.paciente_id)
      .eq("funcionario_id", escala.funcionario_id)
      .eq("data", escala.data)
      .maybeSingle();

    if (error) {
      resultado.erros++;
      resultado.detalhes.erros.push(`Erro ao consultar escala: ${error.message}`);
      continue;
    }

    if (escalaExistente) {
      resultado.escalasExistentes++;
      resultado.detalhes.escalasExistentes.push(`Escala já existe em ${escala.data} para paciente ${escala.paciente_id} / funcionário ${escala.funcionario_id}`);
      continue;
    }

    // Preparar dados para inserção
    const novaEscala = {
      paciente_id: escala.paciente_id,
      funcionario_id: escala.funcionario_id,
      data: escala.data,
      tipo_servico: escala.tipo_servico,
      valor_recebido: escala.valor_recebido,
      valor_pago: escala.valor_pago,
      pagamentoAR_AV: escala.pagamentoAR_AV,
      horario_gerenciamento: escala.horario_gerenciamento,
    };

    // Inserir escala no banco
    const { error: insertError } = await supabase
      .from("escala")
      .insert(novaEscala);

    if (insertError) {
      resultado.erros++;
      resultado.detalhes.erros.push(`Erro ao inserir escala: ${insertError.message}`);
    } else {
      resultado.sucessos++;
      resultado.detalhes.sucessos.push(`Escala criada para paciente ${escala.paciente_id} - funcionário ${escala.funcionario_id} em ${escala.data}`);
    }
  }

  return resultado;
} 
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

// Função para verificar se há algum problema no banco de dados
async function verificarDadosPaciente(pacienteId: string): Promise<void> {
  try {
    console.log("🔍 Verificando dados do paciente antes da operação:", pacienteId);
    
    const { data: pacienteAntes, error: errorAntes } = await supabase
      .from("paciente")
      .select("*")
      .eq("paciente_id", pacienteId)
      .single();

    if (errorAntes) {
      console.error("❌ Erro ao verificar dados do paciente:", errorAntes);
      return;
    }

    console.log("📋 Dados do paciente antes:", pacienteAntes);
    
    // Aguardar um pouco para verificar se há mudanças automáticas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: pacienteDepois, error: errorDepois } = await supabase
      .from("paciente")
      .select("*")
      .eq("paciente_id", pacienteId)
      .single();

    if (errorDepois) {
      console.error("❌ Erro ao verificar dados do paciente após operação:", errorDepois);
      return;
    }

    console.log("📋 Dados do paciente depois:", pacienteDepois);
    
    // Verificar se houve mudanças
    const mudancas = Object.keys(pacienteAntes).filter(key => 
      pacienteAntes[key] !== pacienteDepois[key]
    );
    
    if (mudancas.length > 0) {
      console.warn("⚠️ MUDANÇAS DETECTADAS nos dados do paciente:", mudancas);
      mudancas.forEach(key => {
        console.warn(`  ${key}: "${pacienteAntes[key]}" -> "${pacienteDepois[key]}"`);
      });
      
      // Se detectar mudanças, tentar restaurar os dados originais
      console.log("🔄 Tentando restaurar dados originais do paciente...");
      const { error: restoreError } = await supabase
        .from("paciente")
        .update(pacienteAntes)
        .eq("paciente_id", pacienteId);
        
      if (restoreError) {
        console.error("❌ Erro ao restaurar dados do paciente:", restoreError);
      } else {
        console.log("✅ Dados do paciente restaurados com sucesso");
      }
    } else {
      console.log("✅ Nenhuma mudança detectada nos dados do paciente");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar dados do paciente:", error);
  }
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

  console.log("🚀 Iniciando envio de escalas importadas:", escalas.length, "escalas");

  // Verificar dados do paciente antes de qualquer operação
  if (escalas.length > 0) {
    await verificarDadosPaciente(escalas[0].paciente_id);
  }

  // Processar escalas uma por vez para maior controle
  for (let i = 0; i < escalas.length; i++) {
    const escala = escalas[i];
    
    try {
      console.log(`📋 Processando escala ${i + 1}/${escalas.length}:`, {
        paciente_id: escala.paciente_id,
        funcionario_id: escala.funcionario_id,
        data: escala.data,
        tipo_servico: escala.tipo_servico
      });

      // Verificar se escala já existe
      const { data: escalaExistente, error } = await supabase
        .from("escala")
        .select("escala_id")
        .eq("paciente_id", escala.paciente_id)
        .eq("funcionario_id", escala.funcionario_id)
        .eq("data", escala.data)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao consultar escala existente:", error);
        resultado.erros++;
        resultado.detalhes.erros.push(`Erro ao consultar escala: ${error.message}`);
        continue;
      }

      if (escalaExistente) {
        console.log("⚠️ Escala já existe, pulando...");
        resultado.escalasExistentes++;
        resultado.detalhes.escalasExistentes.push(`Escala já existe em ${escala.data} para paciente ${escala.paciente_id} / funcionário ${escala.funcionario_id}`);
        continue;
      }

      // Preparar dados para inserção - APENAS dados da escala
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

      console.log("💾 Inserindo nova escala:", novaEscala);

      // Inserir escala no banco - APENAS na tabela escala
      // Usar uma abordagem mais específica para evitar triggers indesejados
      const { error: insertError } = await supabase
        .from("escala")
        .insert([novaEscala]); // Usar array para ser mais específico

      if (insertError) {
        console.error("❌ Erro ao inserir escala:", insertError);
        resultado.erros++;
        resultado.detalhes.erros.push(`Erro ao inserir escala: ${insertError.message}`);
      } else {
        console.log("✅ Escala inserida com sucesso");
        resultado.sucessos++;
        resultado.detalhes.sucessos.push(`Escala criada para paciente ${escala.paciente_id} - funcionário ${escala.funcionario_id} em ${escala.data}`);
      }
      
      // Aguardar um pouco entre as inserções para evitar problemas
      if (i < escalas.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("❌ Erro inesperado ao processar escala:", error);
      resultado.erros++;
      resultado.detalhes.erros.push(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Verificar dados do paciente após todas as operações
  if (escalas.length > 0) {
    await verificarDadosPaciente(escalas[0].paciente_id);
  }

  console.log("🏁 Resultado final:", resultado);
  return resultado;
} 
import { z } from 'zod';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const scaleSchema = z.object({
    escala_id: z.number().optional().nullable(),
    paciente_id: z.string().uuid(),
    funcionario_id: z.string().uuid(),
    data: z.string(),
    tipo_servico: z.string(),
    valor_recebido: z.number(),
    valor_pago: z.number(),
    pagamentoAR_AV: z.string().nullable(),
    nomeFuncionario: z.string().optional().nullable(),
    nomePaciente: z.string().optional().nullable(),
    horario_gerenciamento: z.string().optional().nullable(),
    troca_servico_id: z.bigint().optional(),
});

export type Scale = z.infer<typeof scaleSchema>;

export const scaleFiltersSchema = z.object({
    pacienteId: z.string().optional(),
    funcionarioId: z.string().optional(),
    data: z.string().optional(),
    tipoServico: z.string().optional(),
});

export type ScaleFiltersSchema = z.infer<typeof scaleFiltersSchema>;
////////////////////////////////////////////////////////////////
export const serviceExchangeSchema = z.object({
    troca_servico_id: z.bigint(),
    escala_origem_id: z.number(),
    funcionario_origem_id: z.string().uuid(),
    funcionario_destino_id: z.string().uuid(),
    escala_destino_id: z.number(),
    data_servico_colaborador_origem: z.string(),
    data_autorizacao_func_dest: z.string().nullable(),
    status_func_destino: z.string(),
    status_gestor: z.string(),
    data_servico_destino: z.string(),
    servico_origem: z.string(),
    servico_destino: z.string(),

    nomeFuncionarioOrigem: z.string().optional().nullable(),
    nomeFuncionarioDestino: z.string().optional().nullable(),
    nomePaciente: z.string().optional().nullable(),
});

export type ServiceExchange = z.infer<typeof serviceExchangeSchema>;

export const serviceExchangeFiltersSchema = z.object({
    dataOrigem: z.string().optional(),
    dataDestino: z.string().optional(),
    servicoOrigem: z.string().optional(),
    servicoDestino: z.string().optional(),
    troca_servico_id: z.bigint().optional(),
    status: z.string().optional(),

    dateOrder: z.enum(['asc', 'desc']).nullable().optional(),
    originServiceOrder: z.enum(['asc', 'desc']).nullable().optional(),
    destServiceOrder: z.enum(['asc', 'desc']).nullable().optional(),
});

export type ServiceExchangeFiltersSchema = z.infer<typeof serviceExchangeFiltersSchema>;

const ScaleContext = createContext<{
    scales: Scale[];
    scalesNotPaginated: Scale[];

    serviceExchanges: ServiceExchange[];
    serviceExchangesNotPaginated: ServiceExchange[];

    loading: boolean;

    fetchScales: (filters?: ScaleFiltersSchema, pageIndex?: number) => Promise<void>;
    fetchScalesNotPaginated: (filters?: ScaleFiltersSchema) => Promise<void>;

    fetchServiceExchanges: (filters?: ServiceExchangeFiltersSchema, pageIndex?: number) => Promise<void>;
    fetchServiceExchangesNotPaginated: (filters?: ServiceExchangeFiltersSchema,) => Promise<void>;

    scaleCountsByDate: Record<string, number>;

    handleApprove: (scale: ServiceExchange) => Promise<void>;
    handleReject: (scale: ServiceExchange) => Promise<void>;
}>({
    scales: [],
    scalesNotPaginated: [],

    serviceExchanges: [],
    serviceExchangesNotPaginated: [],

    loading: true,

    fetchScales: async () => { },
    fetchScalesNotPaginated: async () => { },

    fetchServiceExchanges: async () => { },
    fetchServiceExchangesNotPaginated: async () => { },

    scaleCountsByDate: {},

    handleApprove: async () => { },
    handleReject: async () => { },
});

export const useScale = () => useContext(ScaleContext);

export const ScaleProvider = ({ children }: { children: ReactNode }) => {
    const [scales, setScales] = useState<Scale[]>([]);
    const [scalesNotPaginated, setScalesNotPaginated] = useState<Scale[]>([]);
    const [serviceExchanges, setServiceExchanges] = useState<ServiceExchange[]>([]);
    const [serviceExchangesNotPaginated, setServiceExchangesNotPaginated] = useState<ServiceExchange[]>([]);
    const [loading, setLoading] = useState(true);
    const [scaleCountsByDate, setScaleCountsByDate] = useState<Record<string, number>>({});

    const fetchScales = useCallback(async (filters: ScaleFiltersSchema = {}, pageIndex: number = 0) => {
        setLoading(true);

        let query = supabase
            .from('escala')
            .select(`*
                ,funcionario:funcionario_id (nome),
                paciente:paciente_id (nome)`)
            .range(pageIndex * 10, pageIndex * 10 + 9);

        if (filters.pacienteId) {
            query = query.eq('paciente_id', filters.pacienteId);
        }
        if (filters.funcionarioId) {
            query = query.eq('funcionario_id', filters.funcionarioId);
        }
        if (filters.data) {
            query = query.eq('data', filters.data);
        }
        if (filters.tipoServico) {
            query = query.ilike('tipo_servico', `%${filters.tipoServico}%`);
        }

        const { data: escalas, error } = await query;

        if (error) {
            console.error('Erro ao buscar dados de escalas:', error);
            setLoading(false);
            return;
        }

        if (escalas) {
            const parsedData = escalas.map((item) => scaleSchema.safeParse({
                ...item,
                nomeFuncionario: item.funcionario?.nome || null,
                nomePaciente: item.paciente?.nome || null,
            }));

            const validScales = parsedData
                .filter((item) => item.success)
                .map((item) => item.data);

            setScales(validScales);
        }

        setLoading(false);
    }, []);

    const fetchScalesNotPaginated = useCallback(async (filters: ScaleFiltersSchema = {}) => {
        setLoading(true);

        let query = supabase
            .from('escala')
            .select(`*
                ,funcionario:funcionario_id (nome),
                paciente:paciente_id (nome)`);

        if (filters.pacienteId) {
            query = query.eq('paciente_id', filters.pacienteId);
        }
        if (filters.funcionarioId) {
            query = query.eq('funcionario_id', filters.funcionarioId);
        }
        if (filters.data) {
            query = query.eq('data', filters.data);
        }
        if (filters.tipoServico) {
            query = query.ilike('tipo_servico', `%${filters.tipoServico}%`);
        }

        const { data: escalas, error } = await query;

        if (error) {
            console.error('Erro ao buscar dados de escalas:', error);
            setLoading(false);
            return;
        }

        if (escalas) {
            const parsedData = escalas.map((item) => scaleSchema.safeParse({
                ...item,
                nomeFuncionario: item.funcionario?.nome || null,
                nomePaciente: item.paciente?.nome || null,
            }));

            const validScales = parsedData
                .filter((item) => item.success)
                .map((item) => item.data);

            setScalesNotPaginated(validScales);

            const counts: Record<string, number> = {};
            validScales.forEach((scale) => {
                const date = scale.data;
                counts[date] = (counts[date] || 0) + 1;
            });
            setScaleCountsByDate(counts);
        }

        setLoading(false);
    }, []);

    const fetchServiceExchanges = useCallback(async (filters: ServiceExchangeFiltersSchema = {}, pageIndex: number = 0) => {
        setLoading(true);

        let query = supabase
            .from('troca_servicos')
            .select(`
            *,
            funcionario_origem:funcionario_origem_id ( nome ),
            funcionario_destino:funcionario_destino_id ( nome ),
            escala_origem:escala_origem_id (
                paciente:paciente_id ( nome )
            )
        `)
            .range(pageIndex * 10, pageIndex * 10 + 9);

        if (filters.dataOrigem) {
            query = query.gte('data_servico_colaborador_origem', filters.dataOrigem);
        }
        if (filters.dataDestino) {
            query = query.lte('data_servico_destino', filters.dataDestino);
        }
        if (filters.servicoOrigem) {
            query = query.eq('servico_origem', filters.servicoOrigem);
        }
        if (filters.servicoDestino) {
            query = query.eq('servico_destino', filters.servicoDestino);
        }
        if (filters.status) {
            query = query.eq('status_gestor', filters.status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar troca_servicos:', error);
            setLoading(false);
            return;
        }

        if (data) {
            const parsedData = data.map((item) => {
                if (typeof item.troca_servico_id === 'number') {
                    item.troca_servico_id = BigInt(item.troca_servico_id);
                }

                const result = serviceExchangeSchema.safeParse({
                    ...item,
                    nomeFuncionarioOrigem: item.funcionario_origem?.nome || null,
                    nomeFuncionarioDestino: item.funcionario_destino?.nome || null,
                    nomePaciente: item.escala_origem?.paciente?.nome || null,
                });

                if (!result.success) {
                    console.error('Erro de validação:', result.error);
                }
                return result;
            });

            const validServiceExchanges = parsedData
                .filter((item) => item.success)
                .map((item) => item.data);

            setServiceExchanges(validServiceExchanges);
        }

        setLoading(false);
    }, []);

    const fetchServiceExchangesNotPaginated = useCallback(async (filters: ServiceExchangeFiltersSchema = {}) => {
        setLoading(true);

        let query = supabase
            .from('troca_servicos')
            .select('*')

        if (filters.dataOrigem) {
            query = query.gte('data_servico_colaborador_origem', filters.dataOrigem);
        }
        if (filters.dataDestino) {
            query = query.lte('data_servico_destino', filters.dataDestino);
        }
        if (filters.servicoOrigem) {
            query = query.eq('servico_origem', filters.servicoOrigem);
        }
        if (filters.servicoDestino) {
            query = query.eq('servico_destino', filters.servicoDestino);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar troca_servicos:', error);
            setLoading(false);
            return;
        }

        if (data) {
            const parsedData = data.map((item) => {
                if (typeof item.troca_servico_id === 'number') {
                    item.troca_servico_id = BigInt(item.troca_servico_id);
                }

                const result = serviceExchangeSchema.safeParse(item);
                if (!result.success) {
                    console.error('Erro de validação:', result.error);
                }
                return result;
            });

            const validServiceExchanges = parsedData
                .filter((item) => item.success)
                .map((item) => item.data);

            setServiceExchangesNotPaginated(validServiceExchanges);
        }

        setLoading(false);
    }, []);

    const handleApprove = useCallback(async (scale: ServiceExchange) => {
        try {
            const { error: trocaError } = await supabase
                .from("troca_servicos")
                .update({ status_gestor: "Aprovado" })
                .eq("troca_servico_id", scale.troca_servico_id);

            if (trocaError) {
                console.error("Erro ao aprovar troca:", trocaError.message);
                return;
            }

            const { error: escalaOrigemError } = await supabase
                .from("escala")
                .update({ funcionario_id: scale.funcionario_destino_id })
                .eq("escala_id", scale.escala_origem_id);

            if (escalaOrigemError) {
                console.error("Erro ao atualizar escala de origem:", escalaOrigemError.message);
                return;
            }

            const { error: escalaDestinoError } = await supabase
                .from("escala")
                .update({ funcionario_id: scale.funcionario_origem_id })
                .eq("escala_id", scale.escala_destino_id);

            if (escalaDestinoError) {
                console.error("Erro ao atualizar escala de destino:", escalaDestinoError.message);
            }

            setScales((prevScales) =>
                prevScales.map((prevScale) =>
                    prevScale.troca_servico_id === scale.troca_servico_id
                        ? { ...prevScale, status_gestor: "Aprovado" }
                        : prevScale
                )
            );

        } catch (error) {
            console.error("Erro desconhecido ao aprovar a troca:", error);
        }
    }, []);

    const handleReject = useCallback(async (scale: ServiceExchange) => {
        try {
            const { error } = await supabase
                .from("troca_servicos")
                .update({ status_gestor: "Rejeitado" })
                .eq("troca_servico_id", scale.troca_servico_id);

            if (error) {
                console.error("Erro ao rejeitar troca:", error.message);
            }

            setScales((prevScales) =>
                prevScales.map((prevScale) =>
                    prevScale.troca_servico_id === scale.troca_servico_id
                        ? { ...prevScale, status_gestor: "Rejeitado" }
                        : prevScale
                )
            );

        } catch (error) {
            console.error("Erro desconhecido ao rejeitar a troca:", error);
        }
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            await fetchScales();
            await fetchScalesNotPaginated();
            await fetchServiceExchanges();
            await fetchServiceExchangesNotPaginated();
        };

        fetchData();
    }, [fetchScales, fetchScalesNotPaginated, fetchServiceExchangesNotPaginated, fetchServiceExchanges]);

    return (
        <ScaleContext.Provider value={{
            scales,
            scalesNotPaginated,

            fetchScales,
            fetchScalesNotPaginated,

            fetchServiceExchanges,
            fetchServiceExchangesNotPaginated,

            loading,
            scaleCountsByDate,

            serviceExchanges,
            serviceExchangesNotPaginated,

            handleApprove,
            handleReject
        }}>
            {children}
        </ScaleContext.Provider>
    );
};

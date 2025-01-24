import supabase from "@/lib/supabase";
import { useContext, createContext, ReactNode, useState, useCallback } from "react";
import { z } from "zod";

export const ProdutividadeSchema = z.object({
    paciente_id: z.string().uuid("ID do paciente deve ser um UUID válido"),
    nome_paciente: z.string().min(1, "O nome do paciente é obrigatório"), // Nome do paciente
    cidade: z.string().min(1, "A cidade é obrigatória"), // Cidade
    plano_saude: z.string().min(1, "O contratante é obrigatório"), // Contratante
    M: z.number().nonnegative().default(0),
    T: z.number().nonnegative().default(0),
    SD: z.number().nonnegative().default(0),
    SN: z.number().nonnegative().default(0),
    P: z.number().nonnegative().default(0),
    G: z.number().nonnegative().default(0),
});

export type produtividadeInfor = z.infer<typeof ProdutividadeSchema>;

export const produtividadeFilterSchema = z.object({
    pacienteName: z.string().optional(),
    contratante: z.string().optional(),
    cidade: z.string().optional(),
    month: z.string().optional(),
});

export type ProdutividadeFilter = z.infer<typeof produtividadeFilterSchema>;

const produtividadeeContext = createContext<{
    fetchProdutividade: (filter?: ProdutividadeFilter, pageIndex?: number) => Promise<void>;
    fetchPacientesScales: (Paciente_id: string, month: string, pageIndex?: number) => Promise<void>;
    PacinteEscalaScalesData: produtividadeInfor[];
    produtividadeData: produtividadeInfor[];
    paymentDataNotPaginated: produtividadeInfor[];
    loading: boolean;
    totalCount: number,

}>({
    fetchProdutividade: async () => { },
    fetchPacientesScales: async () => { },
    PacinteEscalaScalesData: [],
    produtividadeData: [],
    paymentDataNotPaginated: [],
    loading: false,
    totalCount: 0,

});

export const useProdutividade = () => useContext(produtividadeeContext);

export const ProdutividadeProvider = ({ children }: { children: ReactNode }) => {
    const [PacinteEscalaScalesData, setPacinteEscalaScalesData] = useState<produtividadeInfor[]>([]);
    const [produtividadeData, setprodutividadeDataData] = useState<produtividadeInfor[]>([]);
    const [paymentDataNotPaginated, setPaymentDataNotPaginated] = useState<produtividadeInfor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const fetchProdutividade = useCallback(async (filters: ProdutividadeFilter = {}, pageIndex: number = 0) => {
        try {
            setLoading(true);
            const perPage = 10;
            const offset = pageIndex * perPage;
            const { pacienteName, cidade, contratante, month } = filters;

            // Validação do mês
            const currentMonth = month || new Date().toISOString().slice(0, 7);
            const year = parseInt(currentMonth.split("-")[0], 10);
            const monthNumber = parseInt(currentMonth.split("-")[1], 10);
            const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();

            // Query inicial com filtro de pacientes
            let baseSupaBaseQuery = supabase
                .from("paciente")
                .select("*")
                .ilike("nome", `%${pacienteName || ""}%`);

            const { data: allPacientes, error: fullError } = await baseSupaBaseQuery;
            if (fullError) throw fullError;

            // Filtrar escalas pelo mês
            const { data: allScales, error: scalesError } = await supabase
                .from("escala")
                .select("*")
                .gte("data", `${currentMonth}-01`)
                .lte("data", `${currentMonth}-${lastDayOfMonth}`);

            if (scalesError) throw scalesError;

            // Mapeando produtividade
            console.log("allCollaborators", allPacientes);
            const allprodutividade = allPacientes.map((paciente) => {
                const pacienteEscala = allScales.filter((escala) => escala.paciente_id === paciente.paciente_id);
                const totaldeServicoM = pacienteEscala.reduce((acc, scale) => acc + (scale.tipo_servico !== "M" ? (scale.valor_recebido || 0) : 0),0);

                const totals = pacienteEscala.reduce(
                    (acc, scale) => {
                        if (scale.tipo_servico === "M") acc.M += scale.valor_recebido || 0;
                        if (scale.tipo_servico === "T") acc.T += scale.valor_recebido || 0;
                        if (scale.tipo_servico === "SD") acc.SD += scale.valor_recebido || 0;
                        if (scale.tipo_servico === "SN") acc.SN += scale.valor_recebido || 0;
                        if (scale.tipo_servico === "P") acc.P += scale.valor_recebido || 0;
                        if (scale.tipo_servico === "GR") acc.G += scale.valor_recebido || 0;
                        return acc;
                    },
                    { M: 0, T: 0, SD: 0, SN: 0, P: 0, G: 0 }
                );

                return {
                    paciente_id: paciente.id,
                    nome_paciente: paciente.nome,
                    cidade: paciente.cidade || "",
                    plano_saude: paciente.contratante || "",
                    M: totaldeServicoM,
                    T: totals.T,
                    SD: totals.SD,
                    SN: totals.SN,
                    P: totals.P,
                    G: totals.G,
                };
            });

            console.log("toda a produtividade", allprodutividade);
            // Paginação
            const paginatedPayments = allprodutividade.slice(offset, offset + perPage);

            // Atualizando estados
            setprodutividadeDataData(paginatedPayments);
            setPaymentDataNotPaginated(allprodutividade);
            setTotalCount(allprodutividade.length);

        } catch (error) {
            console.error("Erro ao buscar Produtividade:", error);
            setprodutividadeDataData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPacientesScales = useCallback(async (Paciente_id: string, month: string, pageIndex: number = 0) => { }, []);

    return (
        <produtividadeeContext.Provider value={{ fetchProdutividade, fetchPacientesScales, PacinteEscalaScalesData, produtividadeData, paymentDataNotPaginated, loading, totalCount }}>
            {children}
        </produtividadeeContext.Provider>
    );
};
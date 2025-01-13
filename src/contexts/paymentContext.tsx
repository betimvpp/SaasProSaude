import supabase from "@/lib/supabase";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { z } from "zod";

export const paymentInfoSchema = z.object({
    funcionario_id: z.string().uuid(),
    nome: z.string().optional(),
    telefone: z.string().optional(),
    cargo: z.string().optional(),
    chave_pix: z.string().optional(),
    valor_recebido: z.number().optional(),
    valor_pago: z.number().optional(),
    mes: z.string().optional(),

    paciente_telefone: z.string().optional(),
    paciente_nome: z.string().optional(),
    paciente_id: z.string().uuid().optional(),
    escala_id: z.string().uuid().optional(),
    tipo_servico: z.string().optional(),
    pagamentoAR_AV: z.string().optional(),
    data: z.date().optional()
});

export type PaymentInfo = z.infer<typeof paymentInfoSchema>;

export const paymentFiltersSchema = z.object({
    collaboratorName: z.string().optional(),
    role: z.string().optional(),
    month: z.string().optional(),
});

export type PaymentFilters = z.infer<typeof paymentFiltersSchema>

const PaymentContext = createContext<{
    fetchPayments: (filters?: PaymentFilters, pageIndex?: number) => Promise<void>;
    fetchCollaboratorScales: (funcionario_id: string, month: string, pageIndex?: number) => Promise<void>;
    collaboratorScalesData: PaymentInfo[];
    paymentData: PaymentInfo[];
    loading: boolean;
    totalCount: number;
    totalScalesCount: number;
}>({
    fetchPayments: async () => { },
    fetchCollaboratorScales: async () => { },
    collaboratorScalesData: [],
    paymentData: [],
    loading: false,
    totalCount: 0,
    totalScalesCount: 0
});

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const [collaboratorScalesData, setCollaboratorScalesData] = useState<PaymentInfo[]>([]);
    const [paymentData, setPaymentData] = useState<PaymentInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalScalesCount, setTotalScalesCount] = useState(0);

    const fetchPayments = useCallback(async (filters: PaymentFilters = {}, pageIndex: number = 0) => {
        try {
            setLoading(true);
            const perPage = 10;
            const offset = pageIndex * perPage;
            const { collaboratorName, role, month } = filters;

            let totalQuery = supabase
                .from("funcionario")
                .select("*", { count: "exact", head: true })
                .neq("role", "rh")
                .neq("role", "admin");

            if (collaboratorName) {
                totalQuery = totalQuery.ilike("nome", `%${collaboratorName}%`);
            }

            if (role && role !== "all") {
                totalQuery = totalQuery.eq("role", role);
            }

            const { count: totalCount, error: totalError } = await totalQuery;
            if (totalError) {
                console.error("Erro ao buscar total de colaboradores:", totalError);
                return;
            }
            let query = supabase
                .from("funcionario")
                .select("funcionario_id, nome, role")
                .range(offset, offset + perPage - 1)
                .neq("role", "rh")
                .neq("role", "admin");

            if (collaboratorName) {
                query = query.ilike("nome", `%${collaboratorName}%`);
            }

            if (role && role !== "all") {
                query = query.eq("role", role);
            }

            const { data: collaborators, error: collaboratorError } = await query;

            if (collaboratorError) {
                console.error("Erro ao buscar colaboradores:", collaboratorError);
                setPaymentData([]);
                return;
            }

            const currentMonth = month || new Date().toISOString().slice(0, 7);
            const year = parseInt(currentMonth.split("-")[0], 10);
            const monthNumber = parseInt(currentMonth.split("-")[1], 10);
            const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();

            const { data: allScales, error: scalesError } = await supabase
                .from("escala")
                .select("funcionario_id, valor_recebido, valor_pago, data, pagamentoAR_AV")
                .gte("data", `${currentMonth}-01`)
                .lte("data", `${currentMonth}-${lastDayOfMonth}`);

            if (scalesError) {
                console.error("Erro ao buscar escalas:", scalesError);
                setPaymentData([]);
                return;
            }

            const paymentResults: PaymentInfo[] = collaborators.map((collaborator) => {
                const collaboratorScales = allScales.filter(
                    (scale) => scale.funcionario_id === collaborator.funcionario_id
                );
    
                const valorRecebido = collaboratorScales.reduce(
                    (acc, scale) => acc + (scale.pagamentoAR_AV !== "AV" ? (scale.valor_recebido || 0) : 0),
                    0
                );
                const valorPago = collaboratorScales.reduce(
                    (acc, scale) => acc + (scale.pagamentoAR_AV !== "AV" ? (scale.valor_pago || 0) : 0),
                    0
                );
    
                return {
                    funcionario_id: collaborator.funcionario_id,
                    nome: collaborator.nome,
                    cargo: collaborator.role,
                    valor_recebido: valorRecebido,
                    valor_pago: valorPago,
                    mes: currentMonth
                };
            });

            setPaymentData(paymentResults);
            setTotalCount(totalCount || 0);
        } catch (error) {
            console.error("Erro ao buscar pagamentos:", error);
            setPaymentData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCollaboratorScales = useCallback(
        async (funcionario_id: string = '', month: string = '', pageIndex: number = 0) => {
            try {
                setLoading(true);
                const perPage = 10;
                const offset = pageIndex * perPage;
                const year = parseInt(month.split("-")[0], 10);
                const monthNumber = parseInt(month.split("-")[1], 10);
                const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();

                const { count: totalScalesCount, error: totalError } = await supabase
                    .from("escala")
                    .select("*", { count: "exact", head: true })
                    .eq("funcionario_id", funcionario_id)
                    .gte("data", `${month}-01`)
                    .lte("data", `${month}-${lastDayOfMonth}`);

                if (totalError) {
                    console.error("Erro ao buscar contagem de escalas:", totalError);
                    return;
                }

                const { data: allScales, error: scalesError } = await supabase
                    .from("escala")
                    .select("escala_id, paciente_id, funcionario_id, data, tipo_servico, valor_recebido, valor_pago, pagamentoAR_AV")
                    .eq("funcionario_id", funcionario_id)
                    .gte("data", `${month}-01`)
                    .lte("data", `${month}-${lastDayOfMonth}`)
                    .range(offset, offset + perPage - 1);

                if (scalesError) {
                    console.error("Erro ao buscar escalas:", scalesError);
                    setCollaboratorScalesData([]);
                    return;
                }

                const patientPromises = allScales.map(async (scale) => {
                    const { data: patientData, error: patientError } = await supabase
                        .from("paciente")
                        .select("nome, telefone")
                        .eq("paciente_id", scale.paciente_id)
                        .single();

                    if (patientError) {
                        console.error("Erro ao buscar paciente:", patientError);
                        return null;
                    }

                    const formattedDate = scale.data
                        ? new Date(scale.data).toLocaleDateString("pt-BR")
                        : undefined;

                    return {
                        ...scale,
                        paciente_nome: patientData?.nome,
                        paciente_telefone: patientData?.telefone,
                        tipo_servico: scale.tipo_servico || 'Tipo de serviço não informado',
                        pagamentoAR_AV: scale.pagamentoAR_AV || 'Não informado',
                        data: formattedDate
                    };
                });

                const scalesWithPatients = await Promise.all(patientPromises);

                setCollaboratorScalesData(scalesWithPatients.filter(Boolean) as PaymentInfo[]);
                setTotalScalesCount(totalScalesCount || 0);
            } catch (error) {
                console.error("Erro ao buscar escalas do colaborador:", error);
                setCollaboratorScalesData([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <PaymentContext.Provider value={{ fetchPayments, loading, paymentData, totalCount, collaboratorScalesData, fetchCollaboratorScales, totalScalesCount }}>
            {children}
        </PaymentContext.Provider>
    )
}
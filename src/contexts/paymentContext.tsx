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
    paymentDataNotPaginated: PaymentInfo[];
    loading: boolean;
    totalCount: number;
    totalScalesCount: number;
}>({
    fetchPayments: async () => { },
    fetchCollaboratorScales: async () => { },
    collaboratorScalesData: [],
    paymentData: [],
    paymentDataNotPaginated: [],
    loading: false,
    totalCount: 0,
    totalScalesCount: 0
});

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const [collaboratorScalesData, setCollaboratorScalesData] = useState<PaymentInfo[]>([]);
    const [paymentData, setPaymentData] = useState<PaymentInfo[]>([]);
    const [paymentDataNotPaginated, setPaymentDataNotPaginated] = useState<PaymentInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalScalesCount, setTotalScalesCount] = useState(0);

    const fetchPayments = useCallback(async (filters: PaymentFilters = {}, pageIndex: number = 0) => {
        try {
            setLoading(true);
            const perPage = 10;
            const offset = pageIndex * perPage;
            const { collaboratorName, role, month } = filters;

            let baseQuery = supabase
                .from("funcionario")
                .select("*")
                .neq("role", "rh")
                .neq("role", "admin");

            if (collaboratorName) {
                baseQuery = baseQuery.ilike("nome", `%${collaboratorName}%`);
            }

            if (role && role !== "all") {
                baseQuery = baseQuery.eq("role", role);
            }

            const { data: allCollaborators, error: fullError } = await baseQuery;
            if (fullError) {
                console.error("Erro ao buscar colaboradores filtrados:", fullError);
                setPaymentData([]);
                return;
            }

            const currentMonth = month || new Date().toISOString().slice(0, 7);
            const year = parseInt(currentMonth.split("-")[0], 10);
            const monthNumber = parseInt(currentMonth.split("-")[1], 10);
            const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();

            const { data: allScales, error: scalesError } = await supabase
                .from("escala")
                .select("*")
                .gte("data", `${currentMonth}-01`)
                .lte("data", `${currentMonth}-${lastDayOfMonth}`);

            if (scalesError) {
                console.error("Erro ao buscar escalas:", scalesError);
                setPaymentData([]);
                return;
            }

            const mapPayments = (collaborators: any) =>
                collaborators.map((collaborator: any) => {
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
                        telefone: collaborator.telefone,
                        chave_pix: collaborator.chave_pix,
                        valor_recebido: valorRecebido,
                        valor_pago: valorPago,
                        mes: currentMonth,
                    };
                });

            const allPayments = mapPayments(allCollaborators).filter(
                (payment: any) => payment.valor_recebido !== 0 || payment.valor_pago !== 0
            );

            const paginatedPayments = allPayments.slice(offset, offset + perPage);

            setPaymentData(paginatedPayments);
            setPaymentDataNotPaginated(allPayments);
            setTotalCount(allPayments.length); 
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
                    .select("*")
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
        <PaymentContext.Provider value={{ fetchPayments, loading, paymentData, paymentDataNotPaginated, totalCount, collaboratorScalesData, fetchCollaboratorScales, totalScalesCount }}>
            {children}
        </PaymentContext.Provider>
    )
}
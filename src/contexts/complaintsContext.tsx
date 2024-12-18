import { z } from 'zod';
import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

export const complaintSchema = z.object({
    id: z.number(),
    colaborador_id: z.string().uuid(),
    problem_descripiton: z.string().optional(),
    data: z.string().nullable().optional(),
    nomeFuncionario: z.string().optional().nullable(),
    roleFuncionario: z.string().optional().nullable(),
    telefoneFuncionario: z.string().optional().nullable(),
    resolvido: z.boolean().optional(),
});

export type Complaint = z.infer<typeof complaintSchema>;

export const complaintsFiltersSchema = z.object({
    order: z.enum(['asc', 'desc']).default('asc'),
});

export type ComplaintsFiltersSchema = z.infer<typeof complaintsFiltersSchema>;

const ComplaintsContext = createContext<{
    complaints: Complaint[];
    complaintsNotPaginated: Complaint[];
    loading: boolean;
    fetchComplaints: (params?: { pageIndex?: number; order?: 'asc' | 'desc' }) => Promise<void>;
    fetchComplaintsNotPaginated: () => Promise<void>;
    handleResolve: (complaintId: number) => Promise<void>;
}>({
    complaints: [],
    complaintsNotPaginated: [],
    loading: true,
    fetchComplaints: async () => { },
    fetchComplaintsNotPaginated: async () => { },
    handleResolve: async () => { },
});

export const useComplaints = () => useContext(ComplaintsContext);

export const ComplaintsProvider = ({ children }: { children: ReactNode }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [complaintsNotPaginated, setComplaintsNotPaginated] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = useCallback(async (params?: { pageIndex?: number; order?: 'asc' | 'desc' }) => {
        setLoading(true);

        const filters = complaintsFiltersSchema.parse({
            order: params?.order || 'asc',
        });
        const pageIndex = params?.pageIndex || 0;

        const { data, error } = await supabase
            .from('financeiro_reclamacao')
            .select(`*
            ,colaborador:colaborador_id (nome, role, telefone)`)
            .order('id', { ascending: filters.order === 'asc' })
            .eq('resolvido', false)
            .range(pageIndex * 10, pageIndex * 10 + 9);

        if (error) {
            console.error('Erro ao buscar reclamações:', error);
            toast.error('Erro ao buscar reclamações.');
            setLoading(false);
            return;
        }

        const validatedData = data?.map((complaint) => complaintSchema.parse({
            ...complaint,
            nomeFuncionario: complaint.colaborador?.nome || null,
            roleFuncionario: complaint.colaborador?.role || null,
            telefoneFuncionario: complaint.colaborador?.telefone || null,
        })) || [];

        setComplaints(validatedData);
        setLoading(false);
    }, []);

    const fetchComplaintsNotPaginated = useCallback(async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('financeiro_reclamacao')
            .select(`*
            ,colaborador:colaborador_id (nome, role)`);

        if (error) {
            console.error('Erro ao buscar todas as reclamações:', error);
            toast.error('Erro ao buscar todas as reclamações.');
            setLoading(false);
            return;
        }

        const validatedData = data?.map((complaint) => complaintSchema.parse({
            ...complaint,
            nomeFuncionario: complaint.colaborador?.nome || null,
            roleFuncionario: complaint.colaborador?.role || null,
        })) || [];

        setComplaintsNotPaginated(validatedData);
        setLoading(false);
    }, []);

    const handleResolve = useCallback(async (complaintId: number) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('financeiro_reclamacao')
                .update({ resolvido: true }) // Atualiza o campo resolvido para true
                .eq('id', complaintId);

            if (error) {
                console.error('Erro ao resolver reclamação:', error.message);
                toast.error('Erro ao resolver reclamação.');
                return;
            }

            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.id === complaintId
                        ? { ...complaint, resolvido: true }
                        : complaint
                )
            );

            toast.success('Reclamação resolvida com sucesso!');
        } catch (err) {
            console.error('Erro ao resolver reclamação:', err);
            toast.error('Erro ao resolver reclamação.');
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect(() => {
    //     fetchComplaints();
    //     fetchComplaintsNotPaginated();
    // }, [fetchComplaints, fetchComplaintsNotPaginated]);

    return (
        <ComplaintsContext.Provider value={{
            complaints,
            complaintsNotPaginated,
            loading,
            fetchComplaints,
            fetchComplaintsNotPaginated,
            handleResolve
        }}>
            {children}
        </ComplaintsContext.Provider>
    );
};

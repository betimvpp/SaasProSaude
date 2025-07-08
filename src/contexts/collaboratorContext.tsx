import { z } from 'zod';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export const collaboratorSchema = z.object({
    funcionario_id: z.string().uuid(),
    nome: z.string(),
    cpf: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email(),
    rua: z.string().optional(),
    status: z.string(),
    role: z.string(),
    cidade: z.string().optional(),
    bairro: z.string().optional(),
    banco: z.string().optional(),
    agencia: z.string().optional(),
    conta: z.string().optional(),
    data_nascimento: z.string().optional(),
    chave_pix: z.string().optional(),
});

export type Collaborator = z.infer<typeof collaboratorSchema>;

export const collaboratorFiltersSchema = z.object({
    collaboratorId: z.string().optional(),
    collaboratorName: z.string().optional(),
    role: z.string().optional(),
});

export type CollaboratorFiltersSchema = z.infer<typeof collaboratorFiltersSchema>;

const CollaboratorContext = createContext<{
    collaborators: Collaborator[];
    collaboratorsNotPaginated: Collaborator[];
    loading: boolean;
    fetchCollaborator: (filters?: CollaboratorFiltersSchema, pageIndex?: number) => Promise<void>
    fetchCollaboratorNotPaginated: (filters?: CollaboratorFiltersSchema, pageIndex?: number) => Promise<void>
    updateCollaborator: (updatedData: Partial<Collaborator>, funcionarioId: string, especialidades?: number[]) => Promise<void>;
    addCollaborator: (newData: Omit<Collaborator, 'funcionario_id'>) => Promise<void>;
    getCollaboratorById: (id: string) => Promise<Collaborator | null>;
}>({
    collaborators: [],
    collaboratorsNotPaginated: [],
    loading: true,
    fetchCollaborator: async () => { },
    fetchCollaboratorNotPaginated: async () => { },
    updateCollaborator: async () => { },
    addCollaborator: async () => { },
    getCollaboratorById: async () => null,
});

export const useCollaborator = () => useContext(CollaboratorContext);

export const CollaboratorProvider = ({ children }: { children: ReactNode }) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [collaboratorsNotPaginated, setCollaboratorsNotPaginated] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCollaborator = useCallback(async (filters: CollaboratorFiltersSchema = { collaboratorId: '', collaboratorName: '', role: 'all' }, pageIndex: number = 0) => {
        setLoading(true);

        let query = supabase.from('funcionario')
            .select('*')
            .neq("role", "rh")
            .neq("role", "admin")
            .range(pageIndex * 10, pageIndex * 10 + 9);

        if (filters.collaboratorId) {
            query = query.eq('funcionario_id', filters.collaboratorId);
        }

        if (filters.collaboratorName) {
            query = query.ilike('nome', `%${filters.collaboratorName}%`);
        }

        if (filters.role && filters.role !== 'all') {
            query = query.eq('role', filters.role);
        }

        const { data: funcionario, error } = await query;

        if (error) {
            console.error('Erro ao buscar dados de Colaboradores:', error);
        } else {
            setCollaborators(funcionario);
        }
        setLoading(false);
    }, []);

    const fetchCollaboratorNotPaginated = useCallback(async (filters: CollaboratorFiltersSchema = { collaboratorId: '', collaboratorName: '', role: 'all' }) => {
        setLoading(true);

        let query = supabase.from('funcionario')
            .select('*')
            .neq("role", "rh")
            .neq("role", "admin");

        if (filters.collaboratorId) {
            query = query.eq('funcionario_id', filters.collaboratorId);
        }

        if (filters.collaboratorName) {
            query = query.ilike('nome', `%${filters.collaboratorName}%`);
        }

        if (filters.role && filters.role !== 'all') {
            query = query.eq('role', filters.role);
        }

        const { data: funcionario, error } = await query;

        if (error) {
            console.error('Erro ao buscar dados de Colaboradores:', error);
        } else {
            setCollaboratorsNotPaginated(funcionario);
        }
        setLoading(false);
    }, []);

    const addCollaborator = async (newCollaborator: Partial<Collaborator>) => {
        let createdUserId: string | null = null;

        try {
            // Validação preliminar
            if (!newCollaborator.email || !newCollaborator.cpf) {
                throw new Error('Dados inválidos: email e CPF são obrigatórios.');
            }

            // Verificar duplicação no banco de dados
            const { data: existingUser } = await supabase
                .from('funcionario')
                .select('email, cpf')
                .eq('email', newCollaborator.email)
                .or(`cpf.eq.${newCollaborator.cpf}`)
                .single();

            if (existingUser) {
                throw new Error('Colaborador com este email ou CPF já existe.');
            }

            // Criação do usuário no sistema de autenticação
            const response = await api.post('/auth/v1/signup', {
                email: newCollaborator.email,
                password: newCollaborator.cpf,
            });

            const newUserData = response.data;
            createdUserId = newUserData?.user?.id;

            if (!createdUserId) {
                throw new Error('Erro ao criar usuário: ID de usuário não retornado.');
            }

            // Inserção no Supabase (tabela `funcionario`)
            const collaboratorWithId = {
                ...newCollaborator,
                funcionario_id: createdUserId,
                status: newCollaborator.status || "Ativo",
            };

            const { data, error: insertError } = await supabase
                .from('funcionario')
                .insert(collaboratorWithId)
                .select()
                .single();

            if (insertError || !data) {
                throw new Error(`Erro ao inserir colaborador: ${insertError?.message}`);
            }

            // Atualizar estados da UI
            setCollaborators((prev) => [...prev, data]);
            setCollaboratorsNotPaginated((prev) => [...prev, data]);

            toast.success("Colaborador adicionado com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar colaborador:", error);

            // Reverter usuário em caso de falha no Supabase
            if (createdUserId) {
                try {
                    await api.delete(`/auth/v1/admin/users/${createdUserId}`);
                    console.log("Usuário revertido com sucesso na tabela de autenticação.");
                } catch (deleteError) {
                    console.error("Erro ao reverter usuário:", deleteError);
                    toast.error("Erro ao reverter dados de autenticação. Contate o suporte.");
                }
            }

            toast.error("Erro ao adicionar colaborador!");
        }
    };

    const updateCollaborator = useCallback(async (updatedCollaborator: Partial<Collaborator>, funcionarioId: string, especialidades?: number[]) => {
        setLoading(true);

        try {
            const parsedCollaborator = collaboratorSchema.safeParse(updatedCollaborator);
            if (!parsedCollaborator.success) {
                console.error('Erro na validação do funcionario:', parsedCollaborator.error);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('funcionario')
                .update(parsedCollaborator.data)
                .eq('funcionario_id', funcionarioId)
                .select();

            if (error) {
                console.error('Erro ao atualizar funcionario:', error);
            } else if (data) {
                setCollaborators((prev) => prev.map((patient) => (patient.funcionario_id === data[0].funcionario_id ? data[0] : patient)));

                if (especialidades) {
                    await supabase
                        .from('funcionario_especialidade')
                        .delete()
                        .eq('funcionario_id', funcionarioId);

                    if (especialidades.length > 0) {
                        const especialidadesData = especialidades.map(especialidadeId => ({
                            funcionario_id: funcionarioId,
                            especialidade_id: especialidadeId
                        }));

                        await supabase
                            .from('funcionario_especialidade')
                            .insert(especialidadesData);
                    }
                }
            }
            toast.success("Colaborador atualizado com sucesso!");
        } catch (error) {
            console.error('Erro inesperado ao atualizar colaborador:', error);
            toast.error("Falha ao adicionar colaborador!");
        } finally {
            setLoading(false);
        }
    }, []);

    const getCollaboratorById = async (id: string): Promise<Collaborator | null> => {
        const { data, error } = await supabase
            .from('funcionario')
            .select('*')
            .eq('funcionario_id', id)
            .single();

        if (error) {
            console.error('Erro ao buscar dados do colaborador:', error);
            return null;
        }
        return data || null;
    };

    // useEffect(() => {
    //     fetchCollaborator();
    //     fetchCollaboratorNotPaginated();
    // }, [fetchCollaborator, fetchCollaboratorNotPaginated]);

    return (
        <CollaboratorContext.Provider
            value={{ collaborators, collaboratorsNotPaginated, loading, fetchCollaborator, fetchCollaboratorNotPaginated, updateCollaborator, addCollaborator, getCollaboratorById }}
        >
            {children}
        </CollaboratorContext.Provider>
    );
};

import { z } from 'zod';
import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

export const documentSchema = z.object({
    id: z.number(),
    colaborador_id: z.string().uuid(),
    image_url: z.string().url().optional().nullable(),
    tipo_doc: z.string().optional().nullable(),
    nomeFuncionario: z.string().optional().nullable(),
    roleFuncionario: z.string().optional().nullable(),
});

export type Document = z.infer<typeof documentSchema>;

export const documentsFiltersSchema = z.object({
    order: z.enum(['asc', 'desc']).default('asc'),
})

export type DocumentsFiltersSchema = z.infer<typeof documentsFiltersSchema>

const DocumentsContext = createContext<{
    documents: Document[];
    documentsNotPaginated: Document[];
    loading: boolean;
    fetchDocuments: (params?: { pageIndex?: number; order?: 'asc' | 'desc' }) => Promise<void>;
    fetchDocumentsNotPaginated: () => Promise<void>;
}>({
    documents: [],
    documentsNotPaginated: [],
    loading: true,
    fetchDocuments: async () => { },
    fetchDocumentsNotPaginated: async () => { },
});

export const useDocuments = () => useContext(DocumentsContext);

export const DocumentsProvider = ({ children }: { children: ReactNode }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsNotPaginated, setDocumentsNotPaginated] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = useCallback(async (params?: { pageIndex?: number; order?: 'asc' | 'desc' }) => {
        setLoading(true);

        const pageIndex = params?.pageIndex || 0;
        const order = params?.order || 'asc';

        const { data, error } = await supabase
            .from('colaborador_docs_image')
            .select(`*
            ,colaborador:colaborador_id (nome, role)`)
            .order('id', { ascending: order === 'asc' })
            .range(pageIndex * 10, pageIndex * 10 + 9);

        if (error) {
            console.error('Erro ao buscar documentos:', error);
            toast.error('Erro ao buscar documentos.');
            setLoading(false);
            return;
        }

        const validatedData = data?.map((doc) => documentSchema.parse({
            ...doc,
            nomeFuncionario: doc.colaborador?.nome || null,
            roleFuncionario: doc.colaborador?.role || null,
        })) || [];

        setDocuments(validatedData);
        setLoading(false)
    }, []);


    const fetchDocumentsNotPaginated = useCallback(async () => {
        setLoading(true);

        const { data, error } = await supabase.from('colaborador_docs_image').select('*');

        if (error) {
            console.error('Erro ao buscar todos os documentos:', error);
            toast.error('Erro ao buscar todos os documentos.');
            setLoading(false);
            return;
        }

        const validatedData = data?.map((doc) => documentSchema.parse(doc)) || [];

        setDocumentsNotPaginated(validatedData);
        setLoading(false);
    }, []);

    // useEffect(() => {
    //     fetchDocuments();
    //     fetchDocumentsNotPaginated();
    // }, [fetchDocuments, fetchDocumentsNotPaginated]);

    return (
        <DocumentsContext.Provider value={{ documents, loading, fetchDocuments, documentsNotPaginated, fetchDocumentsNotPaginated }}>
            {children}
        </DocumentsContext.Provider>
    );
};

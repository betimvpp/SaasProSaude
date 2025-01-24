import supabase from '@/lib/supabase';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { z } from 'zod';

export const habilitieSchema = z.object({
    especialidade_id: z.number(),
    nome: z.string(),
});

export type Hability = z.infer<typeof habilitieSchema>;

interface HabilityContextType {
    habilities: Hability[];
    loading: boolean;
    fetchHabilitys: () => Promise<void>;
    fetchPatientHabilities: (patientId: string) => Promise<number[]>;
    fetchCollaboratorHabilities: (collaboratorId: string) => Promise<number[]>;
    addSpecialty: (name: string) => Promise<void>;
}

const HabilityContext = createContext<HabilityContextType | undefined>(undefined);

export const HabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [habilities, setHabilitys] = useState<Hability[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchHabilitys = useCallback(async () => {
        setLoading(true);
    
        const { data: habilitiesData, error } = await supabase
          .from('especialidade')
          .select('*');
    
        if (error) {
          console.error('Erro ao buscar dados da Hability:', error);
          setLoading(false);
          return;
        }
    
        if (habilitiesData) {
          const parsedData = habilitiesData.map((item) => habilitieSchema.safeParse(item));
    
          const validHabilitys = parsedData
            .filter((item) => item.success)
            .map((item) => item.data);
    
          setHabilitys(validHabilitys);
        }
    
        setLoading(false);
      }, []);

    const fetchPatientHabilities = useCallback(async (patientId: string) => {
        const { data, error } = await supabase
            .from('paciente_especialidades')
            .select('*')
            .eq('paciente_id', patientId);

        if (error) {
            console.error('Erro ao buscar especialidades do paciente:', error);
            return [];
        }

        return data.map(item => item.especialidade_id);
    }, []);

    const fetchCollaboratorHabilities = useCallback(async (collaboratorId: string) => {
        const { data, error } = await supabase
            .from('funcionario_especialidade')
            .select('*')
            .eq('funcionario_id', collaboratorId);

        if (error) {
            console.error('Erro ao buscar especialidades do paciente:', error);
            return [];
        }

        return data.map(item => item.especialidade_id);
    }, []);

    const addSpecialty = useCallback(async (name: string) => {
        const { data: existingSpecialty, error: fetchError } = await supabase
            .from('especialidade')
            .select('nome')
            .eq('nome', name)
            .maybeSingle();
    
        if (fetchError) {
            console.error('Erro ao verificar existência da especialidade:', fetchError);
            return;
        }
    
        if (existingSpecialty) {
            console.log('Especialidade já existente.');
            return;
        }
    
        const { data, error: insertError } = await supabase
            .from('especialidade')
            .insert([{ nome: name }]);
    
        if (insertError) {
            console.error('Erro ao adicionar especialidade:', insertError);
            return;
        }
    
        fetchHabilitys();
        console.log('Especialidade adicionada com sucesso:', data);
    }, [fetchHabilitys]);
    
    useEffect(() => {
        fetchHabilitys();
    }, [fetchHabilitys]);

    return (
        <HabilityContext.Provider value={{ habilities, loading, fetchHabilitys, fetchPatientHabilities, addSpecialty, fetchCollaboratorHabilities }}>
            {children}
        </HabilityContext.Provider>
    );
};

export const useHabilities = () => {
    const context = useContext(HabilityContext);
    if (!context) {
        throw new Error('useHabilitys deve ser usado dentro do HabilityProvider');
    }
    return context;
};

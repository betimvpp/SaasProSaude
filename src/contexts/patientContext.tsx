import supabase from '@/lib/supabase';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export const patientSchema = z.object({
  paciente_id: z.string(),
  nome: z.string(),
  cpf: z.string(),
  plano_saude: z.string().optional(),
  telefone: z.string().optional(),
  pagamento_dia: z.number().optional(),
  email: z.string().optional(),
  rua: z.string().optional(),
  cidade: z.string().optional(),
  status: z.string().optional(),
  pagamento_a_profissional: z.number().optional()
});

export type Patient = z.infer<typeof patientSchema>;

export const patientFiltersSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().optional(),
});

export type PatientFiltersSchema = z.infer<typeof patientFiltersSchema>;

interface PatientContextType {
  patients: Patient[];
  patientsNotPaginated: Patient[];
  loading: boolean;
  fetchPatients: (filters?: PatientFiltersSchema, pageIndex?: number) => Promise<void>;
  fetchPatientsNotPaginated: (filters?: PatientFiltersSchema) => Promise<void>;
  addPatient: (newPatient: Omit<Patient, 'paciente_id'> & { especialidades?: number[] }) => Promise<void>
  updatePatient: (updatedPatient: Partial<Patient>, pacienteId: string, especialidades?: number[]) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsNotPaginated, setPatientsNotPaginated] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPatients = useCallback(async (filters: PatientFiltersSchema = { patientId: '', patientName: '' }, pageIndex: number = 0) => {
    setLoading(true);

    let query = supabase
      .from('paciente')
      .select('*')
      .range(pageIndex * 10, pageIndex * 10 + 9);

    if (filters.patientId) {
      query = query.eq('paciente_id', filters.patientId);
    }

    if (filters.patientName) {
      query = query.ilike('nome', `%${filters.patientName}%`);
    }

    const { data: pacientes, error } = await query;

    if (error) {
      console.error('Erro ao buscar dados do Paciente:', error);
      setLoading(false);
      return;
    }

    if (pacientes) {
      const parsedData = pacientes.map((item) => patientSchema.safeParse(item));

      const validPatients = parsedData
        .filter((item) => item.success)
        .map((item) => item.data);

      setPatients(validPatients);
    }

    setLoading(false);
  }, []);

  const fetchPatientsNotPaginated = useCallback(async (filters: PatientFiltersSchema = { patientId: '', patientName: '' }) => {
    setLoading(true);

    let query = supabase
      .from('paciente')
      .select('*');

    if (filters.patientId) {
      query = query.eq('paciente_id', filters.patientId);
    }

    if (filters.patientName) {
      query = query.ilike('nome', `%${filters.patientName}%`);
    }

    const { data: pacientes, error } = await query;

    if (error) {
      console.error('Erro ao buscar dados do Paciente:', error);
      setLoading(false);
      return;
    }

    if (pacientes) {
      const parsedData = pacientes.map((item) => patientSchema.safeParse(item));

      const validPatients = parsedData
        .filter((item) => item.success)
        .map((item) => item.data);

      setPatientsNotPaginated(validPatients);
    }

    setLoading(false);
  }, []);

  const addPatient = useCallback(async (newPatient: Omit<Patient, 'paciente_id'> & { especialidades?: number[] }) => {
    setLoading(true);

    try {
      const parsedPatient = patientSchema.omit({ paciente_id: true }).safeParse(newPatient);
      if (!parsedPatient.success) {
        console.error('Erro na validação do paciente:', parsedPatient.error);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('paciente')
        .insert(parsedPatient.data)
        .select();

      if (error) {
        console.error('Erro ao adicionar paciente:', error);
        setLoading(false);
        return;
      }

      const pacienteId = data?.[0]?.paciente_id;

      if (pacienteId && newPatient.especialidades && newPatient.especialidades.length > 0) {
        const especialidadesData = newPatient.especialidades.map(especialidadeId => ({
          paciente_id: pacienteId,
          especialidade_id: especialidadeId
        }));

        const { error: especialidadeError } = await supabase
          .from('paciente_especialidades')
          .insert(especialidadesData);

        if (especialidadeError) {
          console.error('Erro ao adicionar especialidades do paciente:', especialidadeError);
          setLoading(false);
          return;
        }
      }

      if (patients.length >= 10) {
        setPatientsNotPaginated((prev) => [...prev, { paciente_id: data[0].paciente_id, ...parsedPatient.data }]);
      } else {
        setPatients((prev) => [...prev, { paciente_id: data[0].paciente_id, ...parsedPatient.data }]);
        setPatientsNotPaginated((prev) => [...prev, { paciente_id: data[0].paciente_id, ...parsedPatient.data }]);
      }

      toast.success("Paciente adicionado com sucesso!");
    } catch (error) {
      console.error('Erro inesperado ao adicionar paciente:', error);
      toast.error("Falha inesperada ao adicionar paciente!");
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (updatedPatient: Partial<Patient>, pacienteId: string, especialidades?: number[]) => {
    setLoading(true);

    try {
      const parsedPatient = patientSchema.safeParse(updatedPatient);
      if (!parsedPatient.success) {
        console.error('Erro na validação do paciente:', parsedPatient.error);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('paciente')
        .update(parsedPatient.data)
        .eq('paciente_id', pacienteId)
        .select();

      if (error) {
        console.error('Erro ao atualizar paciente:', error);
      } else if (data) {
        setPatients((prev) => prev.map((patient) => (patient.paciente_id === data[0].paciente_id ? data[0] : patient)));

        if (especialidades) {
          await supabase
            .from('paciente_especialidades')
            .delete()
            .eq('paciente_id', pacienteId);

          if (especialidades.length > 0) {
            const especialidadesData = especialidades.map(especialidadeId => ({
              paciente_id: pacienteId,
              especialidade_id: especialidadeId
            }));

            await supabase
              .from('paciente_especialidades')
              .insert(especialidadesData);
          }
        }
      }
      toast.success("Paciente adicionado com sucesso!");
    } catch (error) {
      console.error('Erro inesperado ao atualizar paciente:', error);
      toast.error("Falha ao adicionar paciente!");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   fetchPatients();
  //   fetchPatientsNotPaginated();
  // }, [fetchPatients, fetchPatientsNotPaginated]);

  return (
    <PatientContext.Provider value={{ fetchPatientsNotPaginated, updatePatient, patientsNotPaginated, patients, loading, fetchPatients, addPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients deve ser usado dentro do PatientProvider');
  }
  return context;
};

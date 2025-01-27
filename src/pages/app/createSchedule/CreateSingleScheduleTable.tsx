import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { patientFiltersSchema, PatientFiltersSchema, usePatients } from '@/contexts/patientContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { CollaboratorFiltersSchema, collaboratorFiltersSchema, useCollaborator } from '@/contexts/collaboratorContext'
import { Scale } from '@/contexts/scaleContext'
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'

export const CreateSingleScheduleTable = ({ isAdmin }: { isAdmin: string }) => {
    const { patients, fetchPatients } = usePatients();
    const { collaboratorsNotPaginated, fetchCollaboratorNotPaginated } = useCollaborator();
    const [searchValue, setSearchValue] = useState('');
    const [collaboratorSearchValue, setCollaboratorSearchValue] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [selectedData, setSelectedData] = useState<Date>();
    const [filteredCollaborators, setFilteredCollaborators] = useState<any[]>([]);
    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
    const [completedSchedules, setCompletedSchedules] = useState<Scale[]>([])
    const [applyNeighborhoodFilter, setApplyNeighborhoodFilter] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');

    const { register, setValue, watch, } = useForm<Scale>({});

    const { register: registerPatient, setValue: setPatientValue } = useForm<PatientFiltersSchema>({
        resolver: zodResolver(patientFiltersSchema),
        defaultValues: {
            patientName: '',
        },
    });

    const { register: registerCollaborator, setValue: setCollaboratorValue } = useForm<CollaboratorFiltersSchema>({
        resolver: zodResolver(collaboratorFiltersSchema),
        defaultValues: {
            collaboratorName: '',
        },
    });

    const handlePatientSelection = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const fetchAvailableCollaborators = async (date: Date) => {
        try {
            if (!date) {
                toast.error("Selecione uma data válida.");
                return;
            }

            const formattedDate = format(date, 'yyyy-MM-dd');

            const { data: availableCollaborators, error } = await supabase
                .from('disponibilidade_funcionario')
                .select('funcionario_id')
                .eq('data', formattedDate);

            if (error) {
                console.error('Erro ao buscar colaboradores disponíveis:', error);
                toast.error('Erro ao buscar colaboradores disponíveis.');
                return;
            }

            if (availableCollaborators && availableCollaborators.length > 0) {
                // Garante consistência no formato dos IDs
                const collaboratorIds = availableCollaborators.map(c => String(c.funcionario_id).trim());

                const filtered = collaboratorsNotPaginated.filter(collaborator =>
                    collaboratorIds.includes(String(collaborator.funcionario_id).trim())
                );

                setFilteredCollaborators(filtered);
            } else {
                toast.info('Nenhum colaborador disponível para a data selecionada.');
                setFilteredCollaborators([]);
            }
        } catch (error) {
            console.error('Erro ao buscar colaboradores disponíveis:', error);
            toast.error('Erro inesperado ao buscar colaboradores disponíveis.');
        }
    };

    const generateSingleSchedule = async () => {
        if (!selectedData || !selectedServiceType || !selectedCollaboratorId || !watch('paciente_id')) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const pagamentoAR_AV = watch("pagamentoAR_AV");
        if (!pagamentoAR_AV) {
            toast.error("Por favor, selecione o tipo de pagamento (À Vista ou À Receber).");
            return;
        }

        const newSchedule: Scale = {
            data: format(selectedData, 'yyyy-MM-dd'),
            paciente_id: watch('paciente_id'),
            funcionario_id: selectedCollaboratorId,
            valor_recebido: watch('valor_recebido') || 0,
            valor_pago: watch('valor_pago') || 0,
            tipo_servico: selectedServiceType,
            pagamentoAR_AV: pagamentoAR_AV,
            horario_gerenciamento: selectedServiceType === 'GR' ? watch('horario_gerenciamento') : null,
        };

        const isDuplicate = completedSchedules.some(
            (schedule) =>
                schedule.data === newSchedule.data &&
                schedule.funcionario_id === newSchedule.funcionario_id
        );

        if (isDuplicate) {
            toast.error("Já existe uma escala para este colaborador nesta data.");
            return;
        }

        try {
            // Salvar no banco de dados
            const { error } = await supabase
                .from('escala')
                .insert(newSchedule);

            if (error) {
                console.error(error);
                toast.error("Erro ao salvar a escala no banco de dados.");
                return;
            }

            // Atualizar a lista local após sucesso
            setCompletedSchedules((prevSchedules) => [...prevSchedules, newSchedule]);

            // Feedback de sucesso
            toast.success("Escala adicionada com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao processar a escala.");
        }
    };

    const handleComplete = () => {
        generateSingleSchedule();
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPatients({ patientName: searchValue });
            fetchCollaboratorNotPaginated({ collaboratorName: collaboratorSearchValue });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchValue, fetchPatients, collaboratorSearchValue, fetchCollaboratorNotPaginated]);

    useEffect(() => {
        if (selectedData) {
            fetchAvailableCollaborators(selectedData);
        }
    }, [selectedData]);

    useEffect(() => {
        const applyFilters = async () => {
            if (!selectedPatientId) return; // Certifique-se de que um paciente está selecionado

            const selectedPatientData = patients.find((patient) => patient.paciente_id === selectedPatientId);
            if (!selectedPatientData) return;

            let filtered = collaboratorsNotPaginated.filter(
                (collaborator) => collaborator.cidade === selectedPatientData.cidade
            );

            // Filtro por bairro
            if (applyNeighborhoodFilter) {
                const { data: matchingBairros, error: bairroError } = await supabase
                    .from("funcionario_bairro")
                    .select("funcionario_id")
                    .eq("bairro", selectedPatientData.bairro);

                if (bairroError) {
                    console.error("Erro ao buscar funcionários pelo bairro:", bairroError);
                    toast.error("Erro ao buscar funcionários pelo bairro.");
                    setFilteredCollaborators(filtered);
                    return;
                }

                if (matchingBairros) {
                    const matchingIds = matchingBairros.map((item) => String(item.funcionario_id).trim());
                    filtered = filtered.filter((collaborator) =>
                        matchingIds.includes(String(collaborator.funcionario_id).trim())
                    );
                }
            }

            // Filtro por especialidades
            const { data: patientSpecialties, error: specialtiesError } = await supabase
                .from("paciente_especialidades")
                .select("especialidade_id")
                .eq("paciente_id", selectedPatientId);

            if (specialtiesError) {
                console.error("Erro ao buscar especialidades do paciente:", specialtiesError);
                toast.error("Erro ao buscar especialidades do paciente.");
                setFilteredCollaborators(filtered);
                return;
            }

            if (patientSpecialties && patientSpecialties.length > 0) {
                const specialtyIds = patientSpecialties.map((s) => String(s.especialidade_id).trim());

                const { data: matchingCollaborators, error: collaboratorsError } = await supabase
                    .from("funcionario_especialidade")
                    .select("funcionario_id")
                    .in("especialidade_id", specialtyIds);

                if (!collaboratorsError && matchingCollaborators) {
                    const matchingIds = matchingCollaborators.map((c) => String(c.funcionario_id).trim());
                    filtered = filtered.filter((collaborator) =>
                        matchingIds.includes(String(collaborator.funcionario_id).trim())
                    );
                }
            }

            setFilteredCollaborators(filtered);
        };

        applyFilters();
    }, [applyNeighborhoodFilter, selectedPatientId, collaboratorsNotPaginated, patients]);


    return (
        <form className='h-full'>
            <Table>
                <TableBody className="grid grid-cols-6">
                    {/* Data */}
                    <TableRow className='row-span-10 col-span-2 flex flex-col items-center justify-center text-start'>
                        <TableCell className="font-semibold w-full text-start ">Data do Serviço:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
                            <DayPicker
                                locale={ptBR}
                                mode="single"
                                selected={selectedData}
                                onSelect={setSelectedData}
                                classNames={{
                                    selected: `bg-primary rounded-full font-bold`,
                                    chevron: `text-primary`,
                                    day_button: `border-none`,
                                }}
                            />
                        </TableCell>
                    </TableRow>

                    {/* Nome Do Paciente */}
                    <TableRow className='col-span-2'>
                        <TableCell className="font-semibold">Nome do Paciente:</TableCell>
                        <TableCell className="flex justify-start -mt-2 flex-col gap-2">
                            <Select
                                {...register('paciente_id')}
                                onValueChange={handlePatientSelection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <Input
                                        className='pb-1'
                                        {...registerPatient("patientName")}
                                        placeholder="Digite o nome do paciente"
                                        onChange={(e) => {
                                            e.preventDefault();
                                            const value = e.target.value;
                                            setSearchValue(value);
                                            setPatientValue("patientName", value);
                                        }}
                                    />

                                    {patients.map((patient) => (
                                        <SelectItem {...register('paciente_id')} key={patient.paciente_id} value={patient.paciente_id}>
                                            {patient.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className='flex items-center space-x-1 pl-1'>
                                <input type="checkbox"
                                    checked={applyNeighborhoodFilter}
                                    onChange={(e) => setApplyNeighborhoodFilter(e.target.checked)}
                                    className='cursor-pointer'
                                />
                                <label htmlFor="">Filtrar por bairro</label>
                            </span>
                        </TableCell>
                    </TableRow>

                    {/* Pagamento Total */}
                    {isAdmin === 'admin' ?
                        <TableRow>
                            <TableCell className="font-semibold">Pagamento Total:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input type='number' {...register('valor_recebido')} id='valor_recebido' />
                            </TableCell>
                        </TableRow>
                        :
                        <></>
                    }

                    {/* Pagamento AR/AV */}
                    <TableRow>
                        <TableCell className="font-semibold">Tipo de Pagamento:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
                            <Select
                                {...register("pagamentoAR_AV")}
                                onValueChange={(value) => setValue("pagamentoAR_AV", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tipo de Servico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="AV">À Vista</SelectItem>
                                    <SelectItem className="cursor-pointer" value="AR">À Receber</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>

                    {/* Nome do Colaborador */}
                    <TableRow className='col-span'>
                        <TableCell className="font-semibold">Nome do Colaborador:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
                            <Select
                                onValueChange={(value) => {
                                    setValue("funcionario_id", value); // Atribui o ID do colaborador
                                    setSelectedCollaboratorId(value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um colaborador" />
                                </SelectTrigger>
                                <SelectContent>
                                    <Input
                                        className='pb-1'
                                        {...registerCollaborator("collaboratorName")}
                                        placeholder="Digite o nome do colaborador"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setCollaboratorSearchValue(value);
                                            setCollaboratorValue("collaboratorName", value);
                                        }}
                                    />
                                    {filteredCollaborators.map((collaborator) => (
                                        <SelectItem key={collaborator.funcionario_id} value={collaborator.funcionario_id}>
                                            {collaborator.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>

                    {/* Pagamento a Colaborador */}
                    <TableRow>
                        <TableCell className="font-semibold">Pagamento Colaborador:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
                            <Input type='number' {...register('valor_pago')} id='valor_pago' />
                        </TableCell>
                    </TableRow>

                    {/* Tipo de Serviço */}
                    <TableRow>
                        <TableCell className="font-semibold">Tipo de Serviço:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
                            <Select
                                {...register("tipo_servico")}
                                onValueChange={(value) => {
                                    setValue("tipo_servico", value);
                                    setSelectedServiceType(value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tipo de Servico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SD">SD</SelectItem>
                                    <SelectItem value="SN">SN</SelectItem>
                                    <SelectItem value="P">P</SelectItem>
                                    <SelectItem value="M">M</SelectItem>
                                    <SelectItem value="T">T</SelectItem>
                                    <SelectItem value="GR">GR</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>

                    {/* Horario GR */}
                    <TableRow>
                        {selectedServiceType === 'GR' && (
                            <>
                                <TableCell className="font-semibold">Horário:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input type="time" {...register('horario_gerenciamento')} placeholder="Informe o horário" />
                                </TableCell>
                            </>
                        )}
                    </TableRow>

                    <TableRow>
                        <TableCell>
                            <Button
                                type="button"
                                onClick={handleComplete}
                                className="mt-4 bg-primary text-white px-4 py-2 rounded"
                            >
                                Criar Escala
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table >
        </form >
    )
}

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { patientFiltersSchema, PatientFiltersSchema, usePatients } from '@/contexts/patientContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { CollaboratorFiltersSchema, collaboratorFiltersSchema, useCollaborator } from '@/contexts/collaboratorContext'
import { Scale } from '@/contexts/scaleContext'
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { eachDayOfInterval, format } from 'date-fns'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'

export const CreateMultiScheduleTable = ({ isAdmin }: { isAdmin: string }) => {
    const { patientsNotPaginated, fetchPatientsNotPaginated } = usePatients();
    const { collaboratorsNotPaginated, fetchCollaboratorNotPaginated } = useCollaborator();
    const [completedSchedules, setCompletedSchedules] = useState<Scale[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [collaboratorSearchValue, setCollaboratorSearchValue] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [selectedData, setSelectedData] = useState<DateRange>();
    const [selectedCollaborators, setSelectedCollaborators] = useState<any[]>([]);
    const [filteredCollaborators, setFilteredCollaborators] = useState<any[]>([]);
    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);

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

    const handleDateSelection = (range: DateRange | undefined) => {
        if (!range?.from && !range?.to) {
            setSelectedData(undefined);
        } else {
            setSelectedData(range);
        }
    };

    const handlePatientSelection = async (patientId: string) => {
        try {
            const selectedPatientData = patientsNotPaginated.find(patient => patient.paciente_id === patientId);
            setValue('paciente_id', patientId);

            if (selectedPatientData) {
                setValue('valor_recebido', selectedPatientData.pagamento_dia!);
                setValue('valor_pago', selectedPatientData.pagamento_a_profissional!);

                let filteredCollaborators = collaboratorsNotPaginated.filter(
                    collaborator => collaborator.cidade === selectedPatientData.cidade
                );

                const { data: patientSpecialties, error: specialtiesError } = await supabase
                    .from('paciente_especialidades')
                    .select('especialidade_id')
                    .eq('paciente_id', patientId);

                if (specialtiesError) {
                    console.error('Erro ao buscar especialidades do paciente:', specialtiesError);
                    toast.error('Erro ao buscar especialidades do paciente.');
                    setFilteredCollaborators(filteredCollaborators); // Continua apenas com o filtro por cidade
                    return;
                }

                if (patientSpecialties && patientSpecialties.length > 0) {
                    const specialtyIds = patientSpecialties.map(specialty => specialty.especialidade_id);

                    const { data: matchingCollaborators, error: collaboratorsError } = await supabase
                        .from('funcionario_especialidade')
                        .select('funcionario_id')
                        .in('especialidade_id', specialtyIds);

                    if (collaboratorsError) {
                        console.error('Erro ao buscar colaboradores:', collaboratorsError);
                        toast.error('Erro ao buscar colaboradores.');
                    } else if (matchingCollaborators && matchingCollaborators.length > 0) {
                        const matchingCollaboratorIds = matchingCollaborators.map(c => c.funcionario_id);

                        filteredCollaborators = filteredCollaborators.filter(collaborator =>
                            matchingCollaboratorIds.includes(collaborator.funcionario_id)
                        );
                    } else {
                        toast.error('Nenhum colaborador encontrado com as especialidades do paciente.');
                        filteredCollaborators = [];
                    }
                }

                setFilteredCollaborators(filteredCollaborators);
            }
        } catch (error) {
            console.error('Erro ao processar seleção do paciente:', error);
            toast.error('Erro inesperado ao processar seleção do paciente.');
        }
    };

    const generateRotatedSchedules = () => {
        if (!selectedData || !selectedData.from || !selectedData.to || selectedCollaborators.length === 0) return;

        const dateRange = eachDayOfInterval({ start: selectedData.from, end: selectedData.to });
        const newSchedules: Scale[] = [];

        if (selectedServiceType === "P") {
            dateRange.forEach((date, index) => {
                const collaborator = selectedCollaborators[index % selectedCollaborators.length];

                newSchedules.push({
                    data: format(date, 'yyyy-MM-dd'),
                    paciente_id: watch('paciente_id'),
                    funcionario_id: collaborator.funcionario_id,
                    valor_recebido: watch('valor_recebido'),
                    valor_pago: collaborator.valor_pago,
                    tipo_servico: selectedServiceType,
                    pagamentoAR_AV: collaborator.pagamentoAR_AV,
                    horario_gerenciamento: collaborator.horario_gerenciamento,
                });
            });
        } else if (selectedServiceType === "SD" || selectedServiceType === "SN") {
            dateRange.forEach((date, index) => {
                const collaborator1 = selectedCollaborators[index % selectedCollaborators.length];
                const collaborator2 = selectedCollaborators[(index + 1) % selectedCollaborators.length];

                const initialShift = index % 2 === 0 ? "SD" : "SN";
                const secondaryShift = initialShift === "SD" ? "SN" : "SD";

                newSchedules.push({
                    data: format(date, 'yyyy-MM-dd'),
                    paciente_id: watch('paciente_id'),
                    funcionario_id: collaborator1.funcionario_id,
                    valor_recebido: watch('valor_recebido'),
                    valor_pago: collaborator1.valor_pago,
                    tipo_servico: initialShift,
                    pagamentoAR_AV: collaborator1.pagamentoAR_AV,
                    horario_gerenciamento: collaborator1.horario_gerenciamento,
                });

                newSchedules.push({
                    data: format(date, 'yyyy-MM-dd'),
                    paciente_id: watch('paciente_id'),
                    funcionario_id: collaborator2.funcionario_id,
                    valor_recebido: watch('valor_recebido'),
                    valor_pago: collaborator2.valor_pago,
                    tipo_servico: secondaryShift,
                    pagamentoAR_AV: collaborator2.pagamentoAR_AV,
                    horario_gerenciamento: collaborator2.horario_gerenciamento,
                });
            });
        }

        setCompletedSchedules((prev) => {
            const existingDates = dateRange.map(date => format(date, 'yyyy-MM-dd'));
            const filteredSchedules = prev.filter(schedule => !existingDates.includes(schedule.data));
            return [...filteredSchedules, ...newSchedules];
        });
    };

    const handleComplete = () => {
        try {
            if (selectedCollaboratorId) {
                const selectedCollaborator = collaboratorsNotPaginated.find(c => c.funcionario_id === selectedCollaboratorId);
                if (selectedCollaborator) {
                    const newCollaborator = {
                        ...selectedCollaborator,
                        valor_pago: Number(watch('valor_pago')),
                        tipo_servico: selectedServiceType,
                        horario_gerenciamento: selectedServiceType === 'GR' ? watch('horario_gerenciamento') : null,
                        pagamentoAR_AV: watch('pagamentoAR_AV'),
                    };

                    setSelectedCollaborators(prev => {
                        if (!prev.some(c => c.funcionario_id === newCollaborator.funcionario_id)) {
                            return [...prev, newCollaborator];
                        }
                        return prev;
                    });
                    toast.success("Colaborador adicionado com sucesso!");
                }
            }
            generateRotatedSchedules();
        } catch (error) {
            console.error(error);
            toast.error("Ocorreu um erro ao adicionar o colaborador. Tente novamente.");
        }
    };

    const sendSchedulesToDatabase = async () => {
        try {
            if (completedSchedules.length === 0) {
                toast.error("Nenhuma escala foi gerada para salvar.");
                return;
            }

            const { error } = await supabase
                .from("escala")
                .insert(completedSchedules);

            if (error) {
                console.error(error);
                toast.error("Erro ao salvar escalas no banco de dados. Tente novamente.");
                return;
            }

            toast.success("Escalas salvas com sucesso!");
            setCompletedSchedules([]);
        } catch (error) {
            console.error("Erro ao salvar escalas:", error);
            toast.error("Ocorreu um erro inesperado. Tente novamente.");
        }
    };

    useEffect(() => {
        if (selectedCollaborators.length > 0 && selectedData && selectedData.from && selectedData.to) {
            generateRotatedSchedules();
        }
    }, [selectedCollaborators, selectedData]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPatientsNotPaginated({ patientName: searchValue });
            fetchCollaboratorNotPaginated({ collaboratorName: collaboratorSearchValue });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchValue, fetchPatientsNotPaginated, collaboratorSearchValue, fetchCollaboratorNotPaginated]);

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
                                mode="range"
                                selected={selectedData}
                                onSelect={handleDateSelection}
                                classNames={{
                                    range_start: `bg-primary border-none rounded-full text-black`,
                                    range_middle: `bg-emerald-100 border-none`,
                                    range_end: `bg-primary rounded-full`,
                                    chevron: `text-primary`,
                                    day_button: `border-none`,
                                }}
                            />
                        </TableCell>
                    </TableRow>

                    {/* Nome Do Paciente */}
                    <TableRow className='col-span-2'>
                        <TableCell className="font-semibold">Nome do Paciente:</TableCell>
                        <TableCell className="flex justify-start -mt-2">
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

                                    {patientsNotPaginated.map((patient) => (
                                        <SelectItem {...register('paciente_id')} key={patient.paciente_id} value={patient.paciente_id}>
                                            {patient.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    {/* <SelectItem value="M">M</SelectItem>
                                    <SelectItem value="T">T</SelectItem>
                                    <SelectItem value="GR">GR</SelectItem> */}
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
                                variant='outline'
                                className="mt-4  px-4 py-2 rounded"
                            >
                                Adicionar Colaborador
                            </Button>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className="font-semibold text-end">
                            Colaboradores Adicionados:
                        </TableCell>
                    </TableRow>

                    <TableRow className='col-span-2'>
                        {selectedCollaborators.map((collaborator, index) => (
                            <TableCell key={collaborator.funcionario_id} className="flex items-center justify-between">
                                <p>{collaborator.nome}</p>

                                < Button
                                    type="button"
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => {
                                        setSelectedCollaborators((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        );
                                        toast.success("Colaborador removido com sucesso!");
                                    }}
                                >
                                    Remover
                                </Button>
                            </TableCell>
                        ))}
                    </TableRow>

                    <TableRow className='col-span-4 flex items-center justify-center'>
                        <TableCell>
                            <Button
                                type="button"
                                className="mt-4 m-auto px-4 py-2 rounded"
                                onClick={sendSchedulesToDatabase}
                            >
                                Finalizar Escala
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>

            </Table >

        </form >
    );
};

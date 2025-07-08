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

export const CreateAvulseScheduleTable = ({ isAdmin }: { isAdmin: string }) => {
    const { patientsNotPaginated, fetchPatientsNotPaginated } = usePatients();
    const { collaboratorsNotPaginated, fetchCollaboratorNotPaginated } = useCollaborator();
    const [searchValue, setSearchValue] = useState('');
    const [collaboratorSearchValue, setCollaboratorSearchValue] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [selectedData, setSelectedData] = useState<Date[]>([]);
    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
    const [completedSchedules, setCompletedSchedules] = useState<Scale[]>([])

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

    const handlePatientSelection = async (patientId: string) => {
        try {
            const selectedPatientData = patientsNotPaginated.find(patient => patient.paciente_id === patientId);
            setValue('paciente_id', patientId);

            if (selectedPatientData) {
                setValue('valor_recebido', selectedPatientData.pagamento_dia!);
                setValue('valor_pago', selectedPatientData.pagamento_a_profissional!);
            }

        } catch (error) {
            console.error('Erro ao processar seleção do paciente:', error);
            toast.error('Erro inesperado ao processar seleção do paciente.');
        }
    };

    const generateSingleSchedule = async () => {
        if (selectedData.length === 0 || !selectedServiceType || !selectedCollaboratorId || !watch('paciente_id')) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const pagamentoAR_AV = watch("pagamentoAR_AV");
        if (!pagamentoAR_AV) {
            toast.error("Por favor, selecione o tipo de pagamento (À Vista ou À Receber).");
            return;
        }

        // Criar escalas para todas as datas selecionadas
        for (const date of selectedData) {
            const newSchedule: Scale = {
                data: format(date, 'yyyy-MM-dd'),
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

            if (isDuplicate && selectedServiceType !== "GR") {
                toast.error(`Já existe uma escala para este colaborador na data ${format(date, 'dd/MM/yyyy')}.`);
                continue;
            }

            try {
                // Salvar no banco de dados
                const { error } = await supabase
                    .from('escala')
                    .insert(newSchedule);

                if (error) {
                    console.error(error);
                    toast.error(`Erro ao salvar a escala para ${format(date, 'dd/MM/yyyy')} no banco de dados.`);
                    continue;
                }

                // Atualizar a lista local após sucesso
                setCompletedSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
            } catch (err) {
                console.error(err);
                toast.error(`Erro ao processar a escala para ${format(date, 'dd/MM/yyyy')}.`);
            }
        }

        // Feedback de sucesso
        toast.success(`Escalas criadas com sucesso para ${selectedData.length} data(s)!`);
        
        // Limpar as datas selecionadas após criar as escalas
        setSelectedData([]);
    };

    const handleComplete = () => {
        generateSingleSchedule();
    };

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
                        <TableCell className="flex flex-col justify-start -mt-2">
                            <DayPicker
                                locale={ptBR}
                                mode="multiple"
                                selected={selectedData}
                                onSelect={(dates) => setSelectedData(dates || [])}
                                classNames={{
                                    selected: `bg-primary rounded-full font-bold`,
                                    chevron: `text-primary`,
                                    day_button: `border-none`,
                                }}
                            />
                            <div className="mt-2 space-y-2">
                                <div className="flex flex-wrap gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const evenDays = [];
                                            for (let day = 2; day <= daysInMonth; day += 2) {
                                                evenDays.push(new Date(currentYear, currentMonth, day));
                                            }
                                            setSelectedData(evenDays);
                                        }}
                                        className="text-xs"
                                    >
                                        Dias Pares
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const oddDays = [];
                                            for (let day = 1; day <= daysInMonth; day += 2) {
                                                oddDays.push(new Date(currentYear, currentMonth, day));
                                            }
                                            setSelectedData(oddDays);
                                        }}
                                        className="text-xs"
                                    >
                                        Dias Ímpares
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const weekdays = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() >= 1 && date.getDay() <= 5) { // Segunda a Sexta
                                                    weekdays.push(date);
                                                }
                                            }
                                            setSelectedData(weekdays);
                                        }}
                                        className="text-xs"
                                    >
                                        Dias Úteis
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const weekends = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 0 || date.getDay() === 6) { // Sábado e Domingo
                                                    weekends.push(date);
                                                }
                                            }
                                            setSelectedData(weekends);
                                        }}
                                        className="text-xs"
                                    >
                                        Fins de Semana
                                    </Button>

                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const mondays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 1) { // Segunda-feira
                                                    mondays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                // Verifica se todas as segundas já estão selecionadas
                                                const allMondaysSelected = mondays.every(monday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === monday.getTime()
                                                    )
                                                );
                                                
                                                if (allMondaysSelected) {
                                                    // Se todas estão selecionadas, remove todas as segundas
                                                    return prev.filter(date => 
                                                        !mondays.some(monday => 
                                                            monday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    // Se não estão todas selecionadas, adiciona as que faltam
                                                    const mondaysToAdd = mondays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...mondaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Segunda
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const tuesdays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 2) { // Terça-feira
                                                    tuesdays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                // Verifica se todas as terças já estão selecionadas
                                                const allTuesdaysSelected = tuesdays.every(tuesday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === tuesday.getTime()
                                                    )
                                                );
                                                
                                                if (allTuesdaysSelected) {
                                                    // Se todas estão selecionadas, remove todas as terças
                                                    return prev.filter(date => 
                                                        !tuesdays.some(tuesday => 
                                                            tuesday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    // Se não estão todas selecionadas, adiciona as que faltam
                                                    const tuesdaysToAdd = tuesdays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...tuesdaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Terça
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const wednesdays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 3) { // Quarta-feira
                                                    wednesdays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                const allWednesdaysSelected = wednesdays.every(wednesday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === wednesday.getTime()
                                                    )
                                                );
                                                
                                                if (allWednesdaysSelected) {
                                                    return prev.filter(date => 
                                                        !wednesdays.some(wednesday => 
                                                            wednesday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    const wednesdaysToAdd = wednesdays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...wednesdaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Quarta
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const thursdays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 4) { // Quinta-feira
                                                    thursdays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                const allThursdaysSelected = thursdays.every(thursday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === thursday.getTime()
                                                    )
                                                );
                                                
                                                if (allThursdaysSelected) {
                                                    return prev.filter(date => 
                                                        !thursdays.some(thursday => 
                                                            thursday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    const thursdaysToAdd = thursdays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...thursdaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Quinta
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const fridays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 5) { // Sexta-feira
                                                    fridays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                const allFridaysSelected = fridays.every(friday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === friday.getTime()
                                                    )
                                                );
                                                
                                                if (allFridaysSelected) {
                                                    return prev.filter(date => 
                                                        !fridays.some(friday => 
                                                            friday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    const fridaysToAdd = fridays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...fridaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Sexta
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const saturdays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 6) { // Sábado
                                                    saturdays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                const allSaturdaysSelected = saturdays.every(saturday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === saturday.getTime()
                                                    )
                                                );
                                                
                                                if (allSaturdaysSelected) {
                                                    return prev.filter(date => 
                                                        !saturdays.some(saturday => 
                                                            saturday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    const saturdaysToAdd = saturdays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...saturdaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Sábado
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();
                                            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                            
                                            const sundays: Date[] = [];
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const date = new Date(currentYear, currentMonth, day);
                                                if (date.getDay() === 0) { // Domingo
                                                    sundays.push(date);
                                                }
                                            }
                                            setSelectedData(prev => {
                                                const allSundaysSelected = sundays.every(sunday => 
                                                    prev.some(existingDate => 
                                                        existingDate.getTime() === sunday.getTime()
                                                    )
                                                );
                                                
                                                if (allSundaysSelected) {
                                                    return prev.filter(date => 
                                                        !sundays.some(sunday => 
                                                            sunday.getTime() === date.getTime()
                                                        )
                                                    );
                                                } else {
                                                    const sundaysToAdd = sundays.filter(date => 
                                                        !prev.some(existingDate => 
                                                            existingDate.getTime() === date.getTime()
                                                        )
                                                    );
                                                    return [...prev, ...sundaysToAdd];
                                                }
                                            });
                                        }}
                                        className="text-xs"
                                    >
                                        Domingo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setSelectedData([])}
                                        className="text-xs"
                                    >
                                        Limpar
                                    </Button>
                                </div>
                                {selectedData.length > 0 && (
                                    <div className="p-2 bg-gray-50 rounded-md">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Datas selecionadas:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedData.map((date, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-1 text-xs bg-primary text-white rounded-md"
                                                >
                                                    {format(date, 'dd/MM/yyyy')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                    {collaboratorsNotPaginated.map((collaborator) => (
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
                                    <SelectItem value="PT">PT</SelectItem>
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
                                Criar Escala{selectedData.length > 1 ? 's' : ''}
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table >
        </form >
    )
}

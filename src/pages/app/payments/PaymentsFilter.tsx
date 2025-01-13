import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { PaymentFilters, paymentFiltersSchema, usePayment } from '@/contexts/paymentContext'

interface PaymentFilterProps {
    setSelectedMonth: (month: string) => void;
}
export function PaymentFilter({ setSelectedMonth }: PaymentFilterProps) {
    const { fetchPayments } = usePayment();

    const { register, handleSubmit, control, reset } = useForm<PaymentFilters>({
        resolver: zodResolver(paymentFiltersSchema),
        defaultValues: {
            collaboratorName: '',
            role: 'all',
            month: new Date().toISOString().slice(0, 7),
        },
    });

    async function handleFilter(data: PaymentFilters) {
        await fetchPayments(data);
        setSelectedMonth(data.month!);
    }

    function handleClearFilters() {
        const defaultFilters = {
            collaboratorName: '',
            role: 'all',
            month: new Date().toISOString().slice(0, 7),
        };

        reset(defaultFilters);
        fetchPayments(defaultFilters);
    }
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = parseInt(currentMonth.split("-")[0], 10);

    return (
        <div className='flex justify-between'>
            <form
                onSubmit={handleSubmit(handleFilter)}
                className="flex items-center gap-2"
            >
                <span className="text-sm font-semibold">Filtros:</span>
                <Input
                    placeholder="Nome do colaborador"
                    className="h-8 w-[17rem]"
                    {...register('collaboratorName')}
                />
                <span className="text-sm font-semibold">Ordenar por data:</span>
                <Controller
                    name="month"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => (
                        <Select
                            name={name}
                            onValueChange={onChange}
                            defaultValue={currentMonth}
                            value={value}
                            disabled={disabled}
                        >
                            <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-01`}>Janeiro</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-02`}>Fevereiro</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-03`}>Março</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-04`}>Abril</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-05`}>Maio</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-06`}>Junho</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-07`}>Julho</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-08`}>Agosto</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-09`}>Setembro</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-10`}>Outubro</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-11`}>Novembro</SelectItem>
                                <SelectItem className="cursor-pointer" value={`${currentYear}-12`}>Dezembro</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                ></Controller>
                <Controller
                    name="role"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => {
                        return (
                            <Select
                                defaultValue="all"
                                name={name}
                                onValueChange={onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="all">Todos cargos</SelectItem>
                                    <SelectItem className="cursor-pointer" value="nutricionista">Nutricionista</SelectItem>
                                    <SelectItem className="cursor-pointer" value="fisioterapeuta">Fisioterapeuta</SelectItem>
                                    <SelectItem className="cursor-pointer" value="enfermeiro">Enfermeiro</SelectItem>
                                    <SelectItem className="cursor-pointer" value="técnico de enfermagem">Técnico de Enfermagem</SelectItem>
                                    <SelectItem className="cursor-pointer" value="fonoaudiólogo">Fonoaudiólogo</SelectItem>
                                    <SelectItem className="cursor-pointer" value="psicólogo">Psicólogo</SelectItem>
                                    <SelectItem className="cursor-pointer" value="dentista">Dentista</SelectItem>
                                </SelectContent>
                            </Select>
                        )
                    }}
                ></Controller>
                <Button variant="default" size="xs" type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    Filtrar resultados
                </Button>
                <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="xs"
                    type="button"
                >
                    <X className="mr-2 h-4 w-4" />
                    Remover filtros
                </Button>
            </form>
        </div>
    )
}
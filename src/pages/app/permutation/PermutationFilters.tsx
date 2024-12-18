import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { serviceExchangeFiltersSchema, ServiceExchangeFiltersSchema, useScale } from '@/contexts/scaleContext'

export function PermutationFilters() {
    const { fetchServiceExchanges } = useScale();


    const { control, handleSubmit, reset } = useForm<ServiceExchangeFiltersSchema>({
        resolver: zodResolver(serviceExchangeFiltersSchema),
        defaultValues: {
            dataDestino: '',
            dataOrigem: '',
            servicoOrigem: '',
            servicoDestino: '',
        },
    });

    async function handleFilter(data: ServiceExchangeFiltersSchema) {
        await fetchServiceExchanges({
            ...data, 
        });
    }

    function handleClearFilters() {
        reset({
            servicoOrigem: '',
            servicoDestino: '',
        });

        fetchServiceExchanges({
            servicoOrigem: '',
            servicoDestino: '',
        });
    }
    return (
        <div className='flex justify-between'>
            <form onSubmit={handleSubmit(handleFilter)} className="flex items-center gap-2">
                <span className="text-sm font-semibold">Filtros:</span>

                <Controller
                    name="servicoOrigem"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => {
                        return (
                            <Select
                                name={name}
                                onValueChange={onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue placeholder="Serviço Origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SD">SD</SelectItem>
                                    <SelectItem value="SN">SN</SelectItem>
                                    <SelectItem value="PT">PT</SelectItem>
                                    <SelectItem value="GR">GR</SelectItem>
                                </SelectContent>
                            </Select>
                        )
                    }}
                />

                <Controller
                    name="servicoDestino"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => {
                        return (
                            <Select
                                name={name}
                                onValueChange={onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue placeholder="Seriço Destino"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SD">SD</SelectItem>
                                    <SelectItem value="SN">SN</SelectItem>
                                    <SelectItem value="PT">PT</SelectItem>
                                    <SelectItem value="GR">GR</SelectItem>
                                </SelectContent>
                            </Select>
                        )
                    }}
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => {
                        return (
                            <Select
                                name={name}
                                onValueChange={onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue placeholder="Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                                </SelectContent>
                            </Select>
                        )
                    }}
                />



                <Button variant="default" size="xs" type="submit">
                    Filtrar
                </Button>
                <Button onClick={handleClearFilters} variant="outline" size="xs" type="button">
                    Remover filtros
                </Button>
            </form>
        </div>
    )
}

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProdutividadeFilter, produtividadeFilterSchema, useProdutividade } from "@/contexts/produtividadeContex"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

interface ProdutividadFilterProps {
    setSelectedCidade: (cidade: string) => void;
    setSelectedMonth: (month: string) => void;
}


export const ProdutividadeFiltert = ({ setSelectedCidade, setSelectedMonth }: ProdutividadFilterProps) => {
    const { fetchProdutividade, cidadesData } = useProdutividade();

    const { register, handleSubmit, control, reset } = useForm<ProdutividadeFilter>({
        resolver: zodResolver(produtividadeFilterSchema),
        defaultValues: {
            pacienteName: '',
            contratante: '',
            cidade: '',
            month: new Date().toISOString().slice(0, 7),
        },
    });

    async function handleFilter(data: ProdutividadeFilter) {
        await fetchProdutividade(data);
        setSelectedMonth(data.month!);
        setSelectedCidade(data.cidade!);
    }

    function handleClearFilters() {
        const defaultFilters = {
            pacienteName: '',
            contratante: '',
            cidade: "",
            month: new Date().toISOString().slice(0, 7),
        };

        reset(defaultFilters);
        fetchProdutividade(defaultFilters);
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
                    placeholder="Nome do Contratante"
                    className="h-8 w-[12rem]"
                    {...register('contratante')}
                />
                   <Input
                    placeholder="Nome do Paciente"
                    className="h-8 w-[12rem]"
                    {...register('pacienteName')}
                />
                <span className="text-sm font-semibold">Ordenar por:</span>
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
                                <SelectValue placeholder="Ordenar Por Mes" />
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
                    name="cidade"
                    control={control}
                    render={({ field: { name, onChange, value, disabled } }) => {
                        return (
                            <Select
                                defaultValue=""
                                name={name}
                                onValueChange={onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue  placeholder="Ordenar Por Cidade"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {cidadesData && cidadesData.map((cidade) => (
                                        <SelectItem key={cidade.id} value={cidade.cidade}>
                                            {cidade.cidade}
                                        </SelectItem>
                                    ))}
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
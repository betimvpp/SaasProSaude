import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Controller } from "react-hook-form"

export const ProdutividadeFilter =() =>{


    return (
        <div className='flex justify-between'>
            <form
                //onSubmit={handleSubmit(handleFilter)}
                className="flex items-center gap-2"
            >
                <span className="text-sm font-semibold">Filtros:</span>
                <Input
                    placeholder="Nome do colaborador"
                    className="h-8 w-[17rem]"
                  //  {...register('collaboratorName')}
                />
                <span className="text-sm font-semibold">Ordenar por data:</span>
                <Controller
                    name="month"
                  //  control={control}
                    render={({ field: { name, onChange, value, disabled } }) => (
                        <Select
                            name={name}
                            onValueChange={onChange}
                           // defaultValue={currentMonth}
                            value={value}
                            disabled={disabled}
                        >
                            <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value={""}>Janeiro</SelectItem>

                            </SelectContent>
                        </Select>
                    )}
                ></Controller>
                <Controller
                    name="role"
                    //control={control}
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
                   // onClick={handleClearFilters}
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
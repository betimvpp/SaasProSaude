import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { collaboratorFiltersSchema, CollaboratorFiltersSchema, useCollaborator } from '@/contexts/collaboratorContext'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { CollaboratorAdditioner } from './CollaboratorAdditioner'
import { useState } from 'react'
import { CityAdditioner } from './CityAdditioner'



export function CollaboratorFilters() {
  const { fetchCollaborator } = useCollaborator();
  const [isAdditionerOpen, setIsAdditionerOpen] = useState(false);
  const [isCityAdditionerOpen, setIsCityAdditionerOpen] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<CollaboratorFiltersSchema>({
    resolver: zodResolver(collaboratorFiltersSchema),
    defaultValues: {
      collaboratorName: '',
      role: 'all',
    },
  });

  async function handleFilter(data: CollaboratorFiltersSchema) {
    await fetchCollaborator(data);
  }

  function handleClearFilters() {
    reset({
      collaboratorName: '',
      role: 'all',
    });

    fetchCollaborator({ collaboratorName: '', role: 'all' });
  }


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

      <span className='flex gap-4'>
        <Dialog open={isCityAdditionerOpen} onOpenChange={setIsCityAdditionerOpen}>
          <DialogTrigger asChild>
            <Button variant={'outline'} size={"xs"} className='border-primary text-primary'>
              Adcionar Cidade
            </Button>
          </DialogTrigger>
          <CityAdditioner />
        </Dialog>

        <Dialog open={isAdditionerOpen} onOpenChange={setIsAdditionerOpen}>
          <DialogTrigger asChild>
            <Button variant={'secondary'} size={"xs"}>
              Adcionar Colaborador
            </Button>
          </DialogTrigger>
          <CollaboratorAdditioner />
        </Dialog>
      </span>
    </div>
  )
}

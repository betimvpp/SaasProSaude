import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { humanResourcesFiltersSchema, HumanResourcesFiltersSchema, useHumanResources } from '@/contexts/rhContext'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { HumanResourceAdditioner } from './HumanResourceAdditioner'
import { useState } from 'react'

export function HumanResourcesFilters() {
  const { fetchHumanResources } = useHumanResources();
  const [isAdditionerOpen, setIsAdditionerOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<HumanResourcesFiltersSchema>({
    resolver: zodResolver(humanResourcesFiltersSchema),
    defaultValues: {
      humanResourcesId: '',
      humanResourcesName: '',
    },
  });

  async function handleFilter(data: HumanResourcesFiltersSchema) {
    await fetchHumanResources(data);
  }

  function handleClearFilters() {
    reset({
      humanResourcesId: '',
      humanResourcesName: '',
    });

    fetchHumanResources({ humanResourcesId: '', humanResourcesName: '' });
  }
  return (
    <div className='flex justify-between'>
      <form
        onSubmit={handleSubmit(handleFilter)}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-semibold">Filtros:</span>
        <Input
          placeholder="Nome do Gestor"
          className="h-8 w-[320px]"
          {...register('humanResourcesName')}
        />

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

      <Dialog open={isAdditionerOpen} onOpenChange={setIsAdditionerOpen}>
        <DialogTrigger asChild>
          <Button variant={'secondary'} size={"xs"}>
            Adcionar Gestor
          </Button>
        </DialogTrigger>
        <HumanResourceAdditioner />
      </Dialog>
    </div>
  )
}

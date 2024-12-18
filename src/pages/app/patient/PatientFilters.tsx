import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { patientFiltersSchema, PatientFiltersSchema, usePatients } from '@/contexts/patientContext';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PatientAdditioner } from './PatientAdditioner';
import { useState } from 'react';
import { PatientSpecialtyAdditioner } from './PatientSpecialtyAdditioner';

export function PatientFilters() {
  const { fetchPatients } = usePatients();
  const [isAdditionerOpen, setIsAdditionerOpen] = useState(false);
  const [isSpecialtyAdditionerOpen, setIsSpecialtyAdditionerOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<PatientFiltersSchema>({
    resolver: zodResolver(patientFiltersSchema),
    defaultValues: {
      patientId: '',
      patientName: '',
    },
  });

  async function handleFilter(data: PatientFiltersSchema) {
    await fetchPatients(data);
  }

  function handleClearFilters() {
    reset({
      patientId: '',
      patientName: '',
    });

    fetchPatients({ patientId: '', patientName: '' });
  }

  return (
    <div className='flex justify-between'>
      <form
        onSubmit={handleSubmit(handleFilter)}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-semibold">Filtros:</span>
        {/* <Input
          placeholder="ID do Paciente"
          className="h-8 w-auto"
          {...register('patientId')}
        /> */}
        <Input
          placeholder="Nome do Paciente"
          className="h-8 w-[320px]"
          {...register('patientName')}
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

      <div className='flex  gap-2'>
        <Dialog open={isSpecialtyAdditionerOpen} onOpenChange={setIsSpecialtyAdditionerOpen}>
          <DialogTrigger asChild>
            <Button variant={'outline'} size={"xs"}  className='border-primary text-primary'>
              Adcionar Especialidade
            </Button>
          </DialogTrigger>
          <PatientSpecialtyAdditioner />
        </Dialog>

        <Dialog open={isAdditionerOpen} onOpenChange={setIsAdditionerOpen}>
          <DialogTrigger asChild>
            <Button variant={'secondary'} size={"xs"}>
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <PatientAdditioner />
        </Dialog>
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Patient } from '@/contexts/patientContext'
import { Search } from 'lucide-react'
import { PatientTabs } from './PatientTabs'
import { useState } from 'react'

export const PatientRow = ({ patient, isAdmin, isLoading }: { patient: Patient; isAdmin: string; isLoading: boolean; }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell>
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="xs">
                                <Search className="h-3 w-3" />
                                <span className="sr-only">Detalhes do RH</span>
                            </Button>
                        </DialogTrigger>
                        <PatientTabs patient={patient} open={isDetailsOpen} />
                    </Dialog>
                </TableCell>

                <TableCell className="text-center">
                    {patient?.nome ? patient.nome : "N/A"}
                </TableCell>

                <TableCell className="text-center">
                    {patient?.cpf ? patient.cpf : "N/A"}
                </TableCell >

                <TableCell className="text-center">
                    {patient?.telefone ? patient.telefone : "N/A"}
                </TableCell>

                <TableCell className="text-center">
                    {patient?.plano_saude ? patient.plano_saude : "N/A"}
                </TableCell>

                {isLoading ? null : isAdmin === 'admin' && (
                    <TableCell className="text-center">
                        {patient?.pagamento_dia ? patient.pagamento_dia : "N/A"}
                    </TableCell>
                )}

                <TableCell className="text-center">
                    {patient?.pagamento_a_profissional ? patient.pagamento_a_profissional : "N/A"}
                </TableCell>

                {isLoading ? null : isAdmin !== 'admin' && (
                    <>
                        <TableCell className="text-center"> {patient?.cidade ? patient.cidade : "N/A"}</TableCell>
                        <TableCell className="text-center"> {patient?.rua ? patient.rua : "N/A"}</TableCell>
                    </>
                )}

            </TableRow >
        </>
    )
}

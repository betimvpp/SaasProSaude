import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Patient } from '@/contexts/patientContext'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/authContext'
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext'
import { PatientTabs } from './PatientTabs'

export const PatientRow = ({ patient }: { patient: Patient }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
                .finally(() => setIsLoading(false));
        }
    }, [user, getCollaboratorById]);

    return (
        <>
            {!isLoading && collaboratorData?.role === 'admin' ? (
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

                    <TableCell className="text-center">
                        {patient?.pagamento_dia ? patient.pagamento_dia : "N/A"}
                    </TableCell>

                    <TableCell className="text-center">
                        {patient?.pagamento_a_profissional ? patient.pagamento_a_profissional : "N/A"}
                    </TableCell>
                </TableRow >
            ) : (
                <TableRow>
                    <TableCell>
                        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="xs">
                                    <Search className="h-3 w-3" />
                                    <span className="sr-only">Detalhes do RH</span>
                                </Button>
                            </DialogTrigger>
                            <PatientTabs open={isDetailsOpen} patient={patient} />
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

                    <TableCell className="text-center">
                        {patient?.pagamento_dia ? patient.pagamento_dia : "N/A"}
                    </TableCell>

                    <TableCell className="text-center">
                        {patient?.cidade ? patient.cidade : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                        {patient?.rua ? patient.rua : "N/A"}
                    </TableCell>
                </TableRow >
            )
            }
        </>
    )
}

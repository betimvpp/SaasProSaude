import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'
import { useState } from 'react'
// import { ComplaintsDetails } from './ComplaintsDetails'
import { Complaint, useComplaints } from '@/contexts/complaintsContext'
import { ComplaintsDetails } from './ComplaintsDetails'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const ComplaintsRow = ({ complaint }: { complaint: Complaint }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { handleResolve } = useComplaints();

    return (
        <TableRow>
            <TableCell>
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-3 w-3" />
                            <span className="sr-only">Detalhes do Complainto</span>
                        </Button>
                    </DialogTrigger>
                    <ComplaintsDetails complaint={complaint} />
                </Dialog>
            </TableCell>

            <TableCell className="text-center">{complaint?.id}</TableCell>
            <TableCell className="text-center">{complaint?.colaborador_id}</TableCell>
            <TableCell className="text-center">{complaint?.nomeFuncionario}</TableCell>
            <TableCell className="text-center">{complaint?.telefoneFuncionario}</TableCell>
            <TableCell className="text-center">{complaint ? capitalizeFirstLetter(complaint?.roleFuncionario!) : ''}</TableCell>
            <TableCell className="text-center">{complaint?.resolvido ? 'Resolvido' : 'Pendente'}</TableCell>
            <TableCell>
                <Button
                    variant={complaint.resolvido ? "outline" : "default"}
                    size="xs"
                    onClick={() => handleResolve(complaint.id)}
                    disabled={complaint.resolvido}
                >
                    {complaint.resolvido ? 'Resolvido' : 'Resolver'}
                </Button>
            </TableCell>
        </TableRow >
    )
}

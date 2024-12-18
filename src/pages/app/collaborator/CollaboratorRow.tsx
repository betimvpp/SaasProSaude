import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Collaborator } from '@/contexts/collaboratorContext'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { CollaboratorTabs } from './CollaboratorTabs'

export const CollaboratorRow = ({ collaborator }: { collaborator: Collaborator }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <TableRow className=''>
            <TableCell>
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-2 w-2" />
                            <span className="sr-only">Detalhes do Colaborador</span>
                        </Button>
                    </DialogTrigger>
                    <CollaboratorTabs open={isDetailsOpen} collaborator={collaborator} />
                </Dialog>
            </TableCell>

            <TableCell className="text-center">
                {collaborator?.email ? collaborator?.email : "N/A"}
            </TableCell>

            <TableCell className="text-center">
                {collaborator?.nome ? collaborator?.nome : "N/A"}
            </TableCell>

            <TableCell className="text-center">
                {collaborator?.cpf ? collaborator?.cpf : "N/A"}
            </TableCell >

            <TableCell className="text-center">
                {collaborator?.telefone ? collaborator.telefone : "N/A"}
            </TableCell>

            <TableCell className="text-center overflow-hidden">
                {collaborator?.chave_pix ? collaborator?.chave_pix : "N/A"}
            </TableCell>

            <TableCell className="text-center">
                {collaborator?.role ? collaborator?.role : "N/A"}
            </TableCell>
        </TableRow >
    )
}

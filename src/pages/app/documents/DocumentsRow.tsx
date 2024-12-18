import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Document } from '@/contexts/docsContext'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { DocumentsDetails } from './DocumentsDetails'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const DocumentsRow = ({ document }: { document: Document }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <TableRow>
            <TableCell>
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-3 w-3" />
                            <span className="sr-only">Detalhes do Documento</span>
                        </Button>
                    </DialogTrigger>
                    <DocumentsDetails open={isDetailsOpen} document={document} />
                </Dialog>
            </TableCell>

            <TableCell className="text-center">{document?.id}</TableCell>
            <TableCell className="text-center">{document?.colaborador_id}</TableCell>
            <TableCell className="text-center">{document?.nomeFuncionario}</TableCell>
            <TableCell className="text-center">{document ? capitalizeFirstLetter(document?.roleFuncionario!) : ''}</TableCell>
            <TableCell className="text-center">{document ? capitalizeFirstLetter(document?.tipo_doc!) : ''}</TableCell>
        </TableRow >
    )
}

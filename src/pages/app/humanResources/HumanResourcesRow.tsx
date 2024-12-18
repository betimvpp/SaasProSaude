import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { HumanResource } from '@/contexts/rhContext'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { HumanResourceDetails } from './HumanResourceDetails'

export const HumanResourcesRow = ({ humanResource }: { humanResource: HumanResource }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <TableRow>
            <TableCell>
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-3 w-3" />
                            <span className="sr-only">Detalhes do RH</span>
                        </Button>
                    </DialogTrigger>
                    <HumanResourceDetails open={isDetailsOpen} humanResource={humanResource} />
                </Dialog>
            </TableCell>

            <TableCell className="text-center">{humanResource?.email}</TableCell>
            <TableCell className="text-center">{humanResource?.nome}</TableCell>
            <TableCell className="text-center">{humanResource?.cpf}</TableCell>
            <TableCell className="text-center">{humanResource?.telefone}</TableCell>
            <TableCell className="text-center">{humanResource?.rua}</TableCell>
            <TableCell className="text-center">{humanResource?.cidade}</TableCell>
            <TableCell className="text-center">{humanResource?.chave_pix}</TableCell>
        </TableRow >
    )
}

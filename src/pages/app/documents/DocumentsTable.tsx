import { TableSkeleton } from '@/components/table-skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDocuments } from '@/contexts/docsContext'
import { DocumentsRow } from './DocumentsRow';

export const DocumentsTable = () => {
    const { documents, loading } = useDocuments();

    return (
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center w-4">ID</TableHead>
                    <TableHead className="text-center">ID do Colaborador</TableHead>
                    <TableHead className="text-center">Nome do Colaborador</TableHead>
                    <TableHead className="text-center">Cargo do Colaborador</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {documents && documents.map((document) => (
                    <DocumentsRow key={document?.id} document={document} />
                ))}
            </TableBody>
            {loading === true && documents.length <= 0 && <TableSkeleton />}
        </Table>
    )
}

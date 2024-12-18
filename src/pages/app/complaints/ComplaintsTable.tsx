import { TableSkeleton } from '@/components/table-skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useComplaints } from '@/contexts/complaintsContext';
import { ComplaintsRow } from './ComplaintsRow';

export const ComplaintsTable = () => {
    const { complaints, loading } = useComplaints();

    return (
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center w-4">ID</TableHead>
                    <TableHead className="text-center">ID do Colaborador</TableHead>
                    <TableHead className="text-center">Nome do Colaborador</TableHead>
                    <TableHead className="text-center">Telefone do Colaborador</TableHead>
                    <TableHead className="text-center">Cargo do Colaborador</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {complaints && complaints.map((complaint) => (
                    <ComplaintsRow key={complaint?.id} complaint={complaint} />
                ))}
            </TableBody>
            {loading === true && complaints.length <= 0 && <TableSkeleton />}
        </Table>
    )
}

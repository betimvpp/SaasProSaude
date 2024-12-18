import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePayment } from '@/contexts/paymentContext';
import { PaymentRow } from './PaymentRow';
import { useAuth } from '@/contexts/authContext';
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '@/components/table-skeleton';


export const PaymentTable = () => {
    const { paymentData, loading } = usePayment();
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
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center">Nome do Colaborador</TableHead>
                    <TableHead className="text-center">Telefone do Colaborador</TableHead>
                    <TableHead className="text-center">Cargo do Colaborador</TableHead>
                    {!isLoading && collaboratorData?.role === 'admin' ? <TableHead className="text-center">Valor/Recebido</TableHead> : <></>}
                    <TableHead className="text-center">Valor/Pago</TableHead>
                    <TableHead className="text-center">Chave Pix</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paymentData && paymentData.map((payment) => (
                    <PaymentRow loading={isLoading} isAdmin={collaboratorData?.role!} key={payment.funcionario_id} payment={payment} />
                ))}
            </TableBody>
            {loading === true && paymentData.length <= 0 && <TableSkeleton />}
        </Table>
    )
}

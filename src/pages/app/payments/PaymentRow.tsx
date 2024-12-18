import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table'
import { PaymentInfo } from '@/contexts/paymentContext'
import { Search } from 'lucide-react';
import { PaymentDetails } from './PaymentDetails';
import { useState } from 'react';

export const PaymentRow = ({ payment, isAdmin, loading }: { payment: PaymentInfo; isAdmin: string; loading: boolean; }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    return (
        <TableRow key={payment.funcionario_id}>
            <TableCell>
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-3 w-3" />
                            <span className="sr-only">Detalhes do RH</span>
                        </Button>
                    </DialogTrigger>
                    <PaymentDetails open={isDetailsOpen} payment={payment} isAdmin={isAdmin} loading={loading} />
                </Dialog>
            </TableCell>
            <TableCell className="text-center">{payment.nome}</TableCell>
            <TableCell className='text-center'>{payment.telefone ? payment.telefone : "Telefone não definido"}</TableCell>
            <TableCell className="text-center">{payment.cargo}</TableCell>
            {!loading && isAdmin === 'admin' ? <TableCell className="text-center">{payment.valor_recebido}</TableCell> : <></>}
            <TableCell className="text-center">{payment.valor_pago}</TableCell>
            <TableCell className='text-center'>{payment.chave_pix ? payment.chave_pix : "Chave Pix não Informada"}</TableCell>
        </TableRow>
    )
}
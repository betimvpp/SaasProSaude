import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePayment } from '@/contexts/paymentContext';
import { PaymentRow } from './PaymentRow';
import { useAuth } from '@/contexts/authContext';
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '@/components/table-skeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PaymentTableProps {
    selectedMonth: string;
}
export const PaymentTable = ({ selectedMonth }: PaymentTableProps) => {
    const { paymentData, paymentDataNotPaginated, loading } = usePayment();
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

    const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = currentMonth.split('-').map(Number);
    const monthDate = new Date(year, month - 1);
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(monthDate);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(12);
        doc.text(`Relatório de Pagamentos\nMês: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, 14, 10);

        const tableData = paymentDataNotPaginated.map((payment) => ([
            payment.nome,
            payment.telefone,
            payment.cargo,
            payment.cidade,
            collaboratorData?.role === 'admin' ? payment.valor_recebido : '---',
            payment.valor_pago,
            payment.chave_pix,
        ]));

        doc.autoTable({
            head: [[
                'Nome do Colaborador',
                'Telefone',
                'Cargo',
                'Cidade',
                'Valor Recebido',
                'Valor Pago',
                'Chave Pix',
            ]],
            body: tableData,
            startY: 20,
        });

        doc.save('relatorio_pagamentos.pdf');
    };

    return (
        <>
            {!isLoading ?
                <Table>
                    <TableHeader>
                        <TableRow className="text-center">
                            <TableHead className="w-4"></TableHead>
                            <TableHead className="text-center">Nome do Colaborador</TableHead>
                            <TableHead className="text-center">Telefone do Colaborador</TableHead>
                            <TableHead className="text-center">Cargo do Colaborador</TableHead>
                            {!isLoading && collaboratorData?.role === 'admin' &&
                                <TableHead className="text-center">Valor/Recebido</TableHead>
                            }
                            <TableHead className="text-center">Valor/Pago</TableHead>
                            <TableHead className="text-center">Chave Pix</TableHead>
                            <TableHead className="text-center">
                                <button
                                    onClick={generatePDF}
                                    className="px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
                                >
                                    Gerar Fatura
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentData &&
                            paymentData.map((payment) => (
                                <PaymentRow
                                    loading={isLoading}
                                    isAdmin={collaboratorData?.role!}
                                    key={payment.funcionario_id}
                                    payment={payment}
                                />
                            ))}
                    </TableBody>
                    {loading === true && paymentData.length <= 0 && <TableSkeleton />}
                </Table> :
                <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                    Carregando dados...
                </div>
            }
        </>
    );
};

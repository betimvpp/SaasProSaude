import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProdutivity } from "@/contexts/produtivityContext";
import { useEffect } from "react";
import { TableSkeleton } from "@/components/table-skeleton";
import { ProdutivityRow } from "./ProditivityRow";
import jsPDF from "jspdf";
interface PaymentTableProps {
    selectedMonth: string;
}

export const ProdutivityTable = ({ selectedMonth }: PaymentTableProps) => {
    const { produtivityData, loading, paymentDataNotPaginated } = useProdutivity();


    useEffect(() => { }, []);

    const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = currentMonth.split('-').map(Number);
    const monthDate = new Date(year, month - 1);
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(monthDate);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(12);
        doc.text(`Relatório de Produtividade\nMês: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} \nTotal de Pacientes: ${paymentDataNotPaginated.length}`, 14, 10);

        const tableData = paymentDataNotPaginated.map((produtividade) => ([
            produtividade.nome_paciente,
            produtividade.cidade,
            produtividade.plano_saude,
            produtividade.M,
            produtividade.T,
            produtividade.SD,
            produtividade.SN,
            produtividade.P,
            produtividade.G,

        ]));

        doc.autoTable({
            head: [[
                'Nome do Paciente',
                'Cidade',
                'Contratante',
                'M',
                'T',
                'SD',
                'SN',
                'P',
                'G',

            ]],
            body: tableData,
            startY: 20,
        });

        doc.save('relatorio_pagamentos.pdf');
    };

    return (
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center">Nome do Paciente</TableHead>
                    <TableHead className="text-center">Cidade</TableHead>
                    <TableHead className="text-center">Contratante</TableHead>
                    <TableHead className="text-center">M</TableHead>
                    <TableHead className="text-center">T</TableHead>
                    <TableHead className="text-center">SD</TableHead>
                    <TableHead className="text-center">SN</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">G</TableHead>
                    <TableHead className="text-center">
                        <button
                            onClick={generatePDF}
                            className="px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
                        >
                            Gerar Produtividade
                        </button>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {produtivityData && produtivityData.map((produtividade) => (
                    <ProdutivityRow key={produtividade.paciente_id} produtividade={produtividade} moth={currentMonth}  />
                ))}
            </TableBody>
            {loading === true && produtivityData.length <= 0 && <TableSkeleton />}
        </Table>
    );

}
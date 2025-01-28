import { Pagination } from "@/components/pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { produtividadeInfor, useProdutividade } from "@/contexts/produtividadeContex";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";


declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}
export const ProdutividadeDetails = ({ produtividade, loading, month, open }: { produtividade: produtividadeInfor; loading: boolean; open: boolean, month: string }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const { fetachEscapaByPacienteId, pacienteTotalCont, loading: loadingScales, protutividadeByPacienteID, ProdutividadePacienteDataNotPaginated } = useProdutividade();
    const isFirstRender = useRef(true);

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    const getMonthName = (month: string) => {
        if (!/^\d{4}-\d{2}$/.test(month)) return 'Data inválida';
        const [year, monthNumber] = month.split('-');
        const date = new Date(Number(year), Number(monthNumber) - 1);
        const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };
    const generatePDF = () => {
        const doc = new jsPDF();
        const header = `Paciente: ${produtividade.nome_paciente}\nContratante: ${produtividade.plano_saude || 'Não informado '} \n Total de:${ProdutividadePacienteDataNotPaginated.length}`;

        // Cabeçalho
        doc.setFontSize(12);
        doc.text(header, 10, 10);

        // Corpo da tabela
        const tableData = ProdutividadePacienteDataNotPaginated.map(scale => [
            scale.funcionario.nome,
            scale.funcionario.role,
            scale.tipo_servico,
            scale?.data,
            scale.valor_pago,
            scale.pagamentoAR_AV
        ]);

        doc.autoTable({
            head: [['Atendido Por', 'Cargo', 'Tipo De Serviço', 'Data', 'Valor Pago', 'Pagamento']],
            body: tableData,
            startY: 30,
        });

        // Salva o PDF
        doc.save(`Escalas_${produtividade.nome_paciente}.pdf`);
    };


    useEffect(() => {
        if (!open && produtividade?.paciente_id && month && !isFirstRender.current) {
            fetachEscapaByPacienteId(produtividade.paciente_id, month, pageIndex);
        } else {
            isFirstRender.current = false;
        }

    }, [produtividade?.paciente_id, fetachEscapaByPacienteId, pageIndex]);

    return (
        <DialogContent className='min-w-[90vw] h-[90vh] flex flex-col overflow-y-scroll'>
            <DialogHeader>
                <DialogTitle>Escalas do Colaborador: {
                    produtividade.nome_paciente
                }</DialogTitle>
                <DialogDescription>
                    Mês: {getMonthName("2022-01")
                    }
                    <button
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={generatePDF}
                    >
                        Gerar Produtividade
                    </button>
                </DialogDescription>
            </DialogHeader>
            <div className='h-full w-full max-h-[700px] shadow-lg border rounded- overflow-hidden'>
                <Table className='h-full w-full'>
                    <TableHeader>
                        <TableRow className="text-center">
                            <TableHead className="text-center">Atendido Por</TableHead>
                            <TableHead className="text-center">Cargo do Profissional</TableHead>
                            <TableHead className="text-center">Tipo De Serviço</TableHead>
                            <TableHead className="text-center">data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='h-full w-full'>
                        {protutividadeByPacienteID.map((scale, index) => (
                            <TableRow className='text-center' key={index}>
                                <TableCell>{scale.funcionario.nome}</TableCell>
                                <TableCell>{scale.funcionario.role}</TableCell>
                                <TableCell>{scale.tipo_servico}</TableCell>
                                <TableCell>{scale.data}</TableCell>


                            </TableRow>
                        ))}
                    </TableBody>
                    {loadingScales && <TableSkeleton />}
                </Table>
                {!loading && protutividadeByPacienteID.length <= 0 && (
                    <div className="w-full h-[90%] m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">
                        Nenhum paciente encontrado!
                    </div>
                )}
            </div>
            <Pagination
                pageIndex={pageIndex}
                totalCount={pacienteTotalCont}
                perPage={10}
                onPageChange={handlePageChange}
            />
        </DialogContent>
    );
}
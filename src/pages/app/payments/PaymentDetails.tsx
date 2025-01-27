import { Pagination } from '@/components/pagination';
import { TableSkeleton } from '@/components/table-skeleton';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaymentInfo } from '@/contexts/paymentContext';
import { usePayment } from '@/contexts/paymentContext';
import { Scale } from '@/contexts/scaleContext';
import supabase from '@/lib/supabase';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCallback, useEffect, useRef, useState } from 'react';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export const PaymentDetails = ({ payment, isAdmin, loading }: { payment: PaymentInfo; isAdmin: string; loading: boolean; open: boolean }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const { collaboratorScalesData, loading: loadingScales } = usePayment();
    const isFirstRender = useRef(true);

    const [scales, setCollaboratorScalesData] = useState<Scale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalScalesCount] = useState(0);

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

    const getServiceTime = (tipoServico: string, defaultHorario: string) => {
        switch (tipoServico) {
            case 'SD':
                return '7:00 às 19:00';
            case 'SN':
                return '19:00 às 7:00';
            case 'P':
                return '7:00 às 7:00';
            case 'M':
                return '7:00 às 13:00';
            case 'T':
                return '13:00 às 19:00';
            default:
                return defaultHorario;
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const header = `Colaborador: ${payment.nome}\nChave PIX: ${payment.chave_pix || 'Não informado'}\nTotal (AR): ${collaboratorScalesData
            .filter(scale => scale.pagamentoAR_AV === 'AR')
            .reduce((total, scale) => total + (scale.valor_pago || 0), 0)
            }`;

        // Cabeçalho
        doc.setFontSize(12);
        doc.text(header, 10, 10);

        // Corpo da tabela
        const tableData = collaboratorScalesData.map(scale => [
            scale.paciente_nome,
            scale.chave_pix || 'Chave Pix Não Definida',
            scale.tipo_servico,
            getServiceTime(scale.tipo_servico!, 'Horário não definido'),
            scale?.data && !isNaN(new Date(scale.data).getTime()) ? format(new Date(scale.data), 'dd/MM/yyyy') : 'Data inválida',
            scale.valor_pago,
            scale.pagamentoAR_AV
        ]);

        doc.autoTable({
            head: [['Paciente', 'Telefone', 'Serviço', 'Horário', 'Data', 'Valor Pago', 'Pagamento']],
            body: tableData,
            startY: 30,
        });

        // Salva o PDF
        doc.save(`Escalas_${payment.nome}.pdf`);
    };

    const fetchCollaboratorScales = useCallback(async (funcionario_id: string, month: string, pageIndex: number = 0) => {
        try {
            setIsLoading(true);
            const perPage = 10;
            const offset = pageIndex * perPage;

            const year = parseInt(month.split("-")[0], 10);
            const monthNumber = parseInt(month.split("-")[1], 10);
            const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();

            const { count: totalScalesCount, error: totalError } = await supabase
                .from("escala")
                .select("*", { count: "exact", head: true })
                .eq("funcionario_id", funcionario_id)
                .gte("data", `${month}-01`)
                .lte("data", `${month}-${lastDayOfMonth}`);

            if (totalError) {
                console.error("Erro ao buscar contagem de escalas:", totalError);
                return;
            }

            const { data: allScales, error: scalesError } = await supabase
                .from("escala")
                .select(`escala_id, paciente_id, funcionario_id, data, tipo_servico, valor_recebido, valor_pago, pagamentoAR_AV`)
                .eq("funcionario_id", funcionario_id)
                .order("data", { ascending: false })
                .gte("data", `${month}-01`)
                .lte("data", `${month}-${lastDayOfMonth}`)
                .range(offset, offset + perPage - 1);

            if (scalesError) {
                console.error("Erro ao buscar escalas:", scalesError);
                setCollaboratorScalesData([]);
                return;
            }

            const patientPromises = allScales.map(async (scale): Promise<Scale | null> => {
                const { data: patientData, error: patientError } = await supabase
                    .from("paciente")
                    .select("nome, cpf, telefone")
                    .eq("paciente_id", scale.paciente_id)
                    .single();

                if (patientError) {
                    console.error("Erro ao buscar paciente:", patientError);
                    return null;
                }

                return {
                    ...scale,
                    nomePaciente: patientData?.nome,
                    telefonePaciente: patientData?.telefone
                };
            });

            const scalesWithPatients = await Promise.all(patientPromises);
            const validScales = scalesWithPatients.filter((scale): scale is Scale => scale !== null);

            setCollaboratorScalesData(validScales);
            setTotalScalesCount(totalScalesCount || 0);
        } catch (error) {
            console.error("Erro ao buscar escalas do colaborador:", error);
            setCollaboratorScalesData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (payment?.funcionario_id && payment?.mes && !isFirstRender.current) {
            fetchCollaboratorScales(payment.funcionario_id, payment.mes, pageIndex);
        } else {
            isFirstRender.current = false;
        }
    }, [payment, fetchCollaboratorScales, pageIndex]);

    return (
        <DialogContent className='min-w-[90vw] h-[90vh] flex flex-col overflow-y-scroll'>
            <DialogHeader>
                <DialogTitle>Escalas do Colaborador: {payment.nome}</DialogTitle>
                <DialogDescription>
                    Mês: {getMonthName(payment.mes!)}
                    <button
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={generatePDF}
                    >
                        Gerar Fatura
                    </button>
                </DialogDescription>
            </DialogHeader>
            <div className='h-full w-full max-h-[700px] shadow-lg border rounded- overflow-hidden'>
                <Table className='h-full w-full'>
                    <TableHeader>
                        <TableRow className="text-center">
                            <TableHead className="text-center">Nome do Paciente</TableHead>
                            <TableHead className="text-center">Telefone do Paciente</TableHead>
                            <TableHead className="text-center">Tipo De Serviço</TableHead>
                            <TableHead className="text-center">Horário</TableHead>
                            <TableHead className="text-center">Data</TableHead>
                            {!loading && isAdmin === 'admin' ? <TableHead className="text-center">Valor/Recebido</TableHead> : <></>}
                            <TableHead className="text-center">Valor/Pago</TableHead>
                            <TableHead className="text-center">Pagamento AR/AV</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='h-full w-full'>
                        {scales.map((scale, index) => (
                            <TableRow className='text-center' key={index}>
                                <TableCell>{scale.nomePaciente}</TableCell>
                                <TableCell>{scale.telefonePaciente || "Telefone não definido"}</TableCell>
                                <TableCell>{scale.tipo_servico}</TableCell>
                                <TableCell>{getServiceTime(scale.tipo_servico!, "Horário não definido")}</TableCell>
                                <TableCell>{scale?.data?.toLocaleString()}</TableCell>
                                {loading ? null : isAdmin === 'admin' && (
                                    <TableCell className="text-center">
                                        {scale?.valor_recebido ? scale.valor_recebido : "N/A"}
                                    </TableCell>
                                )}
                                <TableCell>{scale.valor_pago}</TableCell>
                                <TableCell>{scale.pagamentoAR_AV}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    {loadingScales && <TableSkeleton />}
                </Table>
                {!isLoading && scales.length <= 0 && (
                    <div className="w-full h-[90%] m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">
                        Nenhum paciente encontrado!
                    </div>
                )}
            </div>
            <Pagination
                pageIndex={pageIndex}
                totalCount={totalCount}
                perPage={10}
                onPageChange={handlePageChange}
            />
        </DialogContent>
    );
};

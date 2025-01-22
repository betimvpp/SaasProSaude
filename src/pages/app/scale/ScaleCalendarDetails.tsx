import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Scale } from "@/contexts/scaleContext";
import dayjs from "dayjs";
import { ScaleCalendarDetailsRow } from "./ScaleCalendarDetailsRow";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useAuth } from "@/contexts/authContext";

interface ScaleCalendarDetailsProps {
    date: dayjs.Dayjs;
    scales: Scale[];
    loading: boolean;
}

export const ScaleCalendarDetails = ({ date, scales, loading }: ScaleCalendarDetailsProps) => {
    const selectedDateScales = scales.filter((scale) => scale.data === date.format("YYYY-MM-DD"));

    const [pageIndex, setPageIndex] = useState(0);
    const totalCount = selectedDateScales?.length || 0;

    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);

    useEffect(() => {
        if (user) {
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
        }
    }, [user, getCollaboratorById]);

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    return (
        <DialogContent className="min-w-[90vw] h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Escalas para {date.format("DD/MM/YYYY")}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full shadow-lg border rounded-md">
                {loading ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="text-center">
                                    <TableHead className="text-center font-semibold">Tipo de Serviço</TableHead>
                                    <TableHead className="text-center font-semibold">Nome do Funcionário</TableHead>
                                    <TableHead className="text-center font-semibold">Nome do Paciente</TableHead>
                                    <TableHead className="text-center font-semibold">Data</TableHead>
                                    {collaboratorData?.role === 'admin' ? <TableHead className="text-center font-semibold">Valor Recebido</TableHead> : <></>}
                                    <TableHead className="text-center font-semibold">Valor Pago</TableHead>
                                    <TableHead className="text-center font-semibold">Forma de Pagamento</TableHead>
                                    <TableHead className="text-center font-semibold">Horário</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                        <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Carregando Usuários...</div>
                    </>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="text-center">
                                <TableHead className="text-center font-semibold">Tipo de Serviço</TableHead>
                                <TableHead className="text-center font-semibold">Nome do Funcionário</TableHead>
                                <TableHead className="text-center font-semibold">Nome do Paciente</TableHead>
                                <TableHead className="text-center font-semibold">Data</TableHead>
                                {collaboratorData?.role === 'admin' ?
                                    <TableHead className="text-center font-semibold">Valor Recebido</TableHead> : <></>}
                                <TableHead className="text-center font-semibold">Valor Pago</TableHead>
                                <TableHead className="text-center font-semibold">Forma de Pagamento</TableHead>
                                <TableHead className="text-center font-semibold">Horário</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scales && scales.map((scale) => (
                                <ScaleCalendarDetailsRow key={scale.escala_id} scale={scale} />
                            ))}
                        </TableBody>
                    </Table>
                )}
                {scales?.length === 0 && loading === false &&
                    <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhuma Escala encontrado!</div>
                }
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

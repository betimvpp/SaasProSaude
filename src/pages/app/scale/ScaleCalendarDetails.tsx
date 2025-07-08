import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Scale, useScale } from "@/contexts/scaleContext";
import dayjs from "dayjs";
import { ScaleCalendarDetailsRow } from "./ScaleCalendarDetailsRow";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { useCollaborator } from "@/contexts/collaboratorContext";
import { useAuth } from "@/contexts/authContext";

interface ScaleCalendarDetailsProps {
    date: dayjs.Dayjs;
    loading: boolean;
}

export const ScaleCalendarDetails = ({ date, loading }: ScaleCalendarDetailsProps) => {
    const { fetchScales, scalesNotPaginated } = useScale();

    const selectedDateScales = scalesNotPaginated.filter((scale: Scale) => scale.data === date.format("YYYY-MM-DD"));
    const perPage = 10;
    const [pageIndex, setPageIndex] = useState(0);
    const totalCount = selectedDateScales?.length || 0;
    const paginatedScales = selectedDateScales.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();


    useEffect(() => {
        if (user) {
            getCollaboratorById(user.id).then(data => {
                setIsAdmin(data?.role === 'admin');
            });
        }
    }, [user, getCollaboratorById]);

    useEffect(() => {
        fetchScales({}, pageIndex);
    }, [pageIndex, fetchScales]);

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
        fetchScales({}, newPageIndex);
    };

    return (
        <DialogContent className="min-w-[90vw] min-h-[75vh] max-h-[95vh] flex flex-col overflow-y-scroll">
            <DialogHeader>
                <DialogTitle>Escalas para {date.format("DD/MM/YYYY")}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full min-h-[580px] shadow-lg border rounded-md">
                {loading ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="text-center">
                                    <TableHead className="text-center font-semibold">Tipo de Serviço</TableHead>
                                    <TableHead className="text-center font-semibold">Nome do Funcionário</TableHead>
                                    <TableHead className="text-center font-semibold">Nome do Paciente</TableHead>
                                    <TableHead className="text-center font-semibold">Data</TableHead>
                                    {isAdmin && <TableHead className="text-center font-semibold">Valor Recebido</TableHead>}
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
                                {isAdmin && <TableHead className="text-center font-semibold">Valor Recebido</TableHead>}
                                <TableHead className="text-center font-semibold">Valor Pago</TableHead>
                                <TableHead className="text-center font-semibold">Forma de Pagamento</TableHead>
                                <TableHead className="text-center font-semibold">Horário</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedScales && paginatedScales.map((scale: Scale) => (
                                <ScaleCalendarDetailsRow key={scale.escala_id} scale={scale} isAdmin={isAdmin}/>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {selectedDateScales?.length === 0 && loading === false &&
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

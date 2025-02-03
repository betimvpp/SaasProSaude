import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { TableHeader, TableRow, TableHead, TableBody, Table, TableCell, } from "@/components/ui/table";
import { Patient } from "@/contexts/patientContext";
import { Scale } from "@/contexts/scaleContext";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
];
export const PatientSchales = ({ patient, isAdmin, isLoading, }: { patient: Patient; isAdmin: string; isLoading: boolean; }) => {
    const [scales, setPatientScalesData] = useState<Scale[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalScalesCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedValues, setEditedValues] = useState<{ valor_pago: string; pagamentoAR_AV: string; valor_recebido: string; tipo_servico: string; }>({ valor_pago: "", pagamentoAR_AV: "", valor_recebido: "", tipo_servico: "" });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const fetchPatientScales = useCallback(async (paciente_id: string, pageIndex: number = 0, month: number) => {
        try {
            setLoading(true);
            const perPage = 10;
            const offset = pageIndex * perPage;

            const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1).toISOString().split("T")[0];
            const endOfMonth = new Date(new Date().getFullYear(), month, 0).toISOString().split("T")[0];

            const { count: totalScalesCount, error: totalError } = await supabase
                .from("escala")
                .select("*", { count: "exact", head: true })
                .eq("paciente_id", paciente_id)
                .gte("data", startOfMonth)
                .lte("data", endOfMonth);

            if (totalError) {
                console.error("Erro ao buscar contagem de escalas:", totalError);
                return;
            }

            const { data: allScales, error: scalesError } = await supabase
                .from("escala")
                .select(`escala_id, paciente_id, funcionario_id, data, tipo_servico, valor_recebido, valor_pago, pagamentoAR_AV`)
                .eq("paciente_id", paciente_id)
                .gte("data", startOfMonth)
                .lte("data", endOfMonth)
                .order("data", { ascending: false })
                .range(offset, offset + perPage - 1);

            if (scalesError) {
                console.error("Erro ao buscar escalas:", scalesError);
                setPatientScalesData([]);
                return;
            }

            const collaboratorPromises = allScales.map(async (scale): Promise<Scale | null> => {
                const { data: collaboratorData, error: collaboratorError } = await supabase
                    .from("funcionario")
                    .select("nome, cpf, telefone")
                    .eq("funcionario_id", scale.funcionario_id)
                    .single();

                if (collaboratorError) {
                    console.error("Erro ao buscar colaborador:", collaboratorError);
                    return null;
                }


                return {
                    ...scale,
                    nomeFuncionario: collaboratorData?.nome,
                };
            });

            const scalesWithCollaborators = await Promise.all(collaboratorPromises);
            const validScales = scalesWithCollaborators.filter((scale): scale is Scale => scale !== null);

            setPatientScalesData(validScales);
            setTotalScalesCount(totalScalesCount || 0);
        } catch (error) {
            console.error("Erro ao buscar escalas do paciente:", error);
            setPatientScalesData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (patient?.paciente_id) {
            fetchPatientScales(patient.paciente_id, pageIndex, selectedMonth);
        }
    }, [patient, pageIndex, selectedMonth]);

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(parseInt(value, 10));
        setPageIndex(0);
    };

    const handleEditClick = (escala_id: number, scale: Scale) => {
        setEditingRow(escala_id);
        setEditedValues({
            valor_pago: scale.valor_pago.toString(),
            pagamentoAR_AV: scale.pagamentoAR_AV || "",
            valor_recebido: scale.valor_recebido.toString(),
            tipo_servico: scale.tipo_servico || "",
        });
    };

    const handleSaveClick = async (escala_id: number) => {
        try {
            const { error } = await supabase
                .from("escala")
                .update({
                    valor_pago: parseFloat(editedValues.valor_pago),
                    pagamentoAR_AV: editedValues.pagamentoAR_AV,
                    valor_recebido: parseFloat(editedValues.valor_recebido),
                    tipo_servico: editedValues.tipo_servico,
                })
                .eq("escala_id", escala_id);

            if (error) throw error;

            setEditingRow(null);
            fetchPatientScales(patient.paciente_id, pageIndex, selectedMonth);
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
        }
    };

    const handleCancelClick = () => {
        setEditingRow(null);
    };

    const handleDeleteClick = async (escala_id: number) => {
        try {
            const { error } = await supabase.from("escala").delete().eq("escala_id", escala_id);

            if (error) throw error;

            fetchPatientScales(patient.paciente_id, pageIndex, selectedMonth);
        } catch (error) {
            console.error("Erro ao excluir escala:", error);
        }
    };

    const getServiceTime = (tipoServico: string, defaultHorario: string) => {
        switch (tipoServico) {
            case 'SD':
                return '7:00 às 19:00';
            case 'SN':
                return '19:00 às 7:00';
            case 'PT':
                return '7:00 às 7:00';
            case 'M':
                return '7:00 às 13:00';
            case 'T':
                return '13:00 às 19:00';
            default:
                return defaultHorario;
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Escalas do Paciente: {patient.nome}</DialogTitle>
                <DialogDescription>Status: {patient.status}</DialogDescription>
            </DialogHeader>
            <div className="flex items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold">Filtrar por mês:</h2>
                <Select onValueChange={handleMonthChange} defaultValue={selectedMonth.toString()}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value} className="cursor-pointer">
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full h-[625px] shadow-lg border rounded-md my-4 ">
                <Table>
                    <TableHeader className="text-center">
                        <TableRow className="text-center">
                            <TableHead className="text-center">Colaborador</TableHead>
                            <TableHead className="text-center">Data</TableHead>
                            {!isLoading && isAdmin === "admin" && <TableHead className="text-center">Valor Recebido</TableHead>}
                            <TableHead className="text-center">Valor Pago</TableHead>
                            <TableHead className="text-center">Pagamento</TableHead>
                            <TableHead className="text-center">Tipo/Serviço</TableHead>
                            <TableHead className="text-center">Horário</TableHead>
                            <TableHead className="w-4"></TableHead>
                            <TableHead className="w-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    {!loading &&
                        <TableBody className="text-center">
                            {scales && scales.map((scale: Scale) => (
                                <TableRow key={scale.escala_id}>
                                    <TableCell>{scale.nomeFuncionario}</TableCell>
                                    <TableCell>{scale.data}</TableCell>

                                    {!isLoading && isAdmin === "admin" && (
                                        <TableCell className="text-center">
                                            {editingRow === scale.escala_id ? (
                                                <Input
                                                    className="w-16 h-3 m-auto"
                                                    type="number"
                                                    value={editedValues.valor_recebido}
                                                    onChange={(e) =>
                                                        setEditedValues((prev) => ({
                                                            ...prev,
                                                            valor_recebido: e.target.value,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                scale.valor_recebido
                                            )}
                                        </TableCell>
                                    )}

                                    {editingRow === scale.escala_id ? (
                                        <TableCell className="text-center">
                                            <Input
                                                className="w-16 h-3 m-auto"
                                                type="number"
                                                value={editedValues.valor_pago}
                                                onChange={(e) =>
                                                    setEditedValues((prev) => ({
                                                        ...prev,
                                                        valor_pago: e.target.value,
                                                    }))
                                                }
                                            />
                                        </TableCell>
                                    ) : (
                                        <TableCell>{scale.valor_pago}</TableCell>
                                    )}
                                    {editingRow === scale.escala_id ? (
                                        <TableCell className="text-center ">
                                            <Select
                                                onValueChange={(value) =>
                                                    setEditedValues((prev) => ({
                                                        ...prev,
                                                        pagamentoAR_AV: value,
                                                    }))
                                                }
                                                defaultValue={editedValues.pagamentoAR_AV}
                                            >
                                                <SelectTrigger className="w-16 h-3 m-auto">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem className="cursor-pointer" value="AV">AV</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="AR">AR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    ) : (
                                        <TableCell>{scale.pagamentoAR_AV || "N/A"}</TableCell>
                                    )}

                                    <TableCell className="text-center">
                                        {editingRow === scale.escala_id ? (
                                            <Select
                                                onValueChange={(value) =>
                                                    setEditedValues((prev) => ({
                                                        ...prev,
                                                        tipo_servico: value,
                                                    }))
                                                }
                                                defaultValue={editedValues.tipo_servico}
                                            >
                                                <SelectTrigger className="w-16 h-3 m-auto">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem className="cursor-pointer" value="SD">SD</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="SN">SN</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="P">P</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="M">M</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="T">T</SelectItem>
                                                    <SelectItem className="cursor-pointer" value="GR">GR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            scale.tipo_servico
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {getServiceTime(scale?.tipo_servico, scale?.horario_gerenciamento!)}
                                    </TableCell>
                                    <TableCell>
                                        {editingRow === scale.escala_id ? (
                                            <span className=" flex gap-2">
                                                <Button className="h-6" size={"xs"} onClick={() => handleSaveClick(scale.escala_id!)}>
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            </span>
                                        ) : (
                                            <span className=" flex gap-2">
                                                <Button className="h-6" size={"xs"} onClick={() => handleEditClick(scale.escala_id!, scale)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingRow === scale.escala_id ? (
                                            <span className=" flex gap-2">
                                                <Button className="h-6" variant={"destructive"} size={"xs"} onClick={handleCancelClick}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </span>
                                        ) : (
                                            <span className=" flex gap-2">
                                                <Button className="h-6" variant={"destructive"} size={"xs"} onClick={() => handleDeleteClick(scale.escala_id!)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    }
                </Table>
                {loading && <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Carregando Escalas</div>}
                {!loading && scales.length <= 0 && <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhuma escala encontrado!</div>}

            </div>
            <Pagination
                pageIndex={pageIndex}
                totalCount={totalCount}
                perPage={10}
                onPageChange={handlePageChange}
            />
        </>
    );
};

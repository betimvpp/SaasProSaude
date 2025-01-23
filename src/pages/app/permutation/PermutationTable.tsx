import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useScale } from "@/contexts/scaleContext";
import { PermutationRow } from "./PermutationRow";

export const PermutationTable = () => {
    const { serviceExchangesNotPaginated } = useScale();

    return (
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="text-center">Funcionario Origem</TableHead>
                    <TableHead className="text-center">Funcionario Destino</TableHead>
                    <TableHead className="text-center">Paciente</TableHead>
                    <TableHead className="text-center">Data Origem</TableHead>
                    <TableHead className="text-center">Data Destino</TableHead>
                    <TableHead className="text-center">Serviço Origem</TableHead>
                    <TableHead className="text-center">Serviço Destino</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {serviceExchangesNotPaginated && serviceExchangesNotPaginated.map((serviceExchanged) => (
                    <PermutationRow key={serviceExchanged.troca_servico_id} scale={serviceExchanged} />
                ))}
            </TableBody>
        </Table>
    )
}

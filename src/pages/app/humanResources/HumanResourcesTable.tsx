import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HumanResourcesRow } from "./HumanResourcesRow"
import { useHumanResources } from "@/contexts/rhContext"
import { HumanResourcesTableSkeleton } from "./HumanResourcesTableSkeleton";

export const HumanResourcesTable = () => {
    const { humanResources, loading } = useHumanResources();

    return (
        <Table>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center">E-mail</TableHead>
                    <TableHead className="text-center">Nome Completo</TableHead>
                    <TableHead className="text-center">CPF</TableHead>
                    <TableHead className="text-center">Telefone</TableHead>
                    <TableHead className="text-center">Rua</TableHead>
                    <TableHead className="text-center">Cidade</TableHead>
                    <TableHead className="text-center">Chave Pix</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {humanResources && humanResources.map((humanResource) => (
                    <HumanResourcesRow key={humanResource.funcionario_id} humanResource={humanResource} />
                ))}
            </TableBody>
            {loading === true && humanResources.length <= 0 && <HumanResourcesTableSkeleton />}
        </Table>
    )
}

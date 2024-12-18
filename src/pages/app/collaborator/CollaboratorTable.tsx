import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CollaboratorRow } from "./CollaboratorRow"
import { useCollaborator } from "@/contexts/collaboratorContext";
import { CollaboratorTableSkeleton } from "./CollaboratorTableSkeleton";

export const CollaboratorTable = () => {
    const { collaborators, loading } = useCollaborator();

    return (
        <Table className="max-w-full">
            <TableHeader>
                <TableRow className="text-center ">
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="text-center">E-mail</TableHead>
                    <TableHead className="text-center">Nome Completo</TableHead>
                    <TableHead className="text-center">CPF</TableHead>
                    <TableHead className="text-center">Telefone</TableHead>
                    <TableHead className="text-center">Chave Pix</TableHead>
                    <TableHead className="text-center">Cargo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {collaborators && collaborators.map((collaborator) => (
                    <CollaboratorRow key={collaborator?.funcionario_id} collaborator={collaborator} />
                ))}
            </TableBody>
            {loading === true && collaborators.length <= 0 && <CollaboratorTableSkeleton />}

        </Table>
    )
}

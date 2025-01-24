import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProdutividade } from "@/contexts/produtividadeContex";

import { useAuth } from "@/contexts/authContext";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";
import { TableSkeleton } from "@/components/table-skeleton";
import { ProdutividadeRow } from "./proditividadeRow";

export const ProdutividadeTable = () => {
    const { produtividadeData, paymentDataNotPaginated, loading } = useProdutividade();
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
                            // onClick={generatePDF}
                            className="px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
                        >
                            Gerar Produtividade
                        </button>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {produtividadeData && produtividadeData.map((produtividade) => (
                    <ProdutividadeRow produtividade={produtividade}                    />
                ))}
            </TableBody>
            {loading === true && produtividadeData.length <= 0 && <TableSkeleton />}
        </Table>
    );

}
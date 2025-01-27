import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PatientRow } from "./PatientRow"
import { usePatients } from "@/contexts/patientContext";
import { useAuth } from "@/contexts/authContext";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const PatientTable = () => {
    const { patients } = usePatients();
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
            {!isLoading ?
                <>
                    <TableHeader>
                        <TableRow className="text-center">
                            <TableHead className="w-4"></TableHead>
                            <TableHead className="text-center">Nome Completo</TableHead>
                            <TableHead className="text-center">Nível</TableHead>
                            <TableHead className="text-center">Telefone</TableHead>
                            <TableHead className="text-center">Contratante</TableHead>
                            {isLoading ? null : collaboratorData?.role === 'admin' && (
                                <TableHead className="text-center">Pagamento/Dia</TableHead>
                            )}
                            <TableHead className="text-center">Pagamento/Profissional</TableHead>
                            {isLoading ? null : collaboratorData?.role !== 'admin' && (
                                <>
                                    <TableHead className="text-center">Cidade</TableHead>
                                    <TableHead className="text-center">Rua</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients && patients.map((patient) => (
                            <PatientRow key={patient.paciente_id} patient={patient} isAdmin={collaboratorData?.role!} isLoading={isLoading} />
                        ))}
                    </TableBody>
                </> :
                <>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Skeleton className="h-[80%] w-full" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="w-full h-full flex items-center">
                        <div className="w-fullw-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">
                            <p>Carregando Dados!</p>
                        </div>
                    </TableBody>
                </>}
        </Table>
    )
}

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PatientRow } from "./PatientRow"
import { usePatients } from "@/contexts/patientContext";
import { PatientTableSkeleton } from "./PatientTableSkeleton";
import { useAuth } from "@/contexts/authContext";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";

export const PatientTable = () => {
    const { patients, loading } = usePatients();
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
                    <TableHead className="text-center">Nome Completo</TableHead>
                    <TableHead className="text-center">CPF</TableHead>
                    <TableHead className="text-center">Telefone</TableHead>
                    <TableHead className="text-center">Contratante</TableHead>
                    {!isLoading && collaboratorData?.role === 'admin' ? <TableHead className="text-center">Pagamento/Dia</TableHead> : <></>}
                    <TableHead className="text-center">Pagamento/Profissional</TableHead>
                    {!isLoading && collaboratorData?.role !== 'admin' ? <TableHead className="text-center">Cidade</TableHead> : <></>}
                    {!isLoading && collaboratorData?.role !== 'admin' ? <TableHead className="text-center">Rua</TableHead> : <></>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {patients && patients.map((patient) => (
                    <PatientRow key={patient.paciente_id} patient={patient} />
                ))}
            </TableBody>
            {loading === true && patients.length <= 0 && <PatientTableSkeleton />}
        </Table>
    )
}

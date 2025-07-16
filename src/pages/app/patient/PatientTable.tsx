import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PatientRow } from "./PatientRow"
import { usePatients } from "@/contexts/patientContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollaboratorCache } from "@/lib/useCollaboratorCache";

export const PatientTable = () => {
    const { patients } = usePatients();
    const { collaboratorData, isLoading } = useCollaboratorCache();

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
                        <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">
                            <p>Carregando Dados!</p>
                        </div>
                    </TableBody>
                </>}
        </Table>
    )
}

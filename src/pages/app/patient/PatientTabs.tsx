import { DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Patient } from '@/contexts/patientContext';
import { PatientDetails } from './PatientDetails';
import { useAuth } from '@/contexts/authContext';
import { useCollaborator, Collaborator } from '@/contexts/collaboratorContext';
import { useState, useEffect } from 'react';
import { PatientSchales } from './PatientSchales';

export interface PatientDetailsProps {
    patient: Patient;
    open: boolean;
}

export const PatientTabs = ({ patient }: PatientDetailsProps) => {
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
        <DialogContent className="min-w-[90vw] h-[90vh] overflow-y-scroll">
            <Tabs defaultValue="details" className="flex flex-col items-center justify-center w-full h-full">
                <TabsList className="">
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="schedules">Escalas</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="w-full h-full">
                    <PatientDetails patient={patient} isAdmin={collaboratorData?.role!} isLoading={isLoading}  />
                </TabsContent>

                <TabsContent value="schedules" className="w-full h-full">
                    <PatientSchales patient={patient} isAdmin={collaboratorData?.role!} isLoading={isLoading} />
                </TabsContent>
            </Tabs>

        </DialogContent>
    )
}

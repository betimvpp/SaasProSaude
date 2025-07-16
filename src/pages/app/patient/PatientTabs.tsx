import { DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Patient } from '@/contexts/patientContext';
import { PatientDetails } from './PatientDetails';
import { useCollaboratorCache } from '@/lib/useCollaboratorCache';
import { PatientScales } from './PatientScales';

export interface PatientDetailsProps {
    patient: Patient;
    open: boolean;
}

export const PatientTabs = ({ patient }: PatientDetailsProps) => {
    const { collaboratorData, isLoading } = useCollaboratorCache();

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
                    <PatientScales patient={patient} isAdmin={collaboratorData?.role!} isLoading={isLoading} />
                </TabsContent>
            </Tabs>

        </DialogContent>
    )
}

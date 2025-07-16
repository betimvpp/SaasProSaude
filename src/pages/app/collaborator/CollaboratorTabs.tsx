import { DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collaborator } from '@/contexts/collaboratorContext';
import { CollaboratorDetails } from './CollaboratorDetails';
import { useCollaboratorCache } from '@/lib/useCollaboratorCache';
import { CollaboratorSchales } from './CollaboratorScales';


export interface CollaboratorDetailsProps {
    collaborator: Collaborator;
    open: boolean;
}

export const CollaboratorTabs = ({ collaborator }: CollaboratorDetailsProps) => {
    const { collaboratorData, isLoading } = useCollaboratorCache();

    return (
        <DialogContent className="min-w-[90vw] h-[90vh] overflow-y-scroll">
            <Tabs defaultValue="details" className="flex flex-col items-center justify-center w-full h-full">
                <TabsList>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="schedules">Escalas</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="w-full h-full">
                    <CollaboratorDetails collaborator={collaborator}  />
                </TabsContent>

                <TabsContent value="schedules" className="w-full h-full">
                    <CollaboratorSchales collaborator={collaborator} isAdmin={collaboratorData?.role!} isLoading={isLoading} />
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}

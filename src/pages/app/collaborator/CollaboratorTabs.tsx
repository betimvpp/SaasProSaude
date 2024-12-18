import { DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CollaboratorDetails } from './CollaboratorDetails';
import { useAuth } from '@/contexts/authContext';
import { useCollaborator, Collaborator } from '@/contexts/collaboratorContext';
import { useState, useEffect } from 'react';
import { CollaboratorSchales } from './CollaboratorScales';


export interface CollaboratorDetailsProps {
    collaborator: Collaborator;
    open: boolean;
}

export const CollaboratorTabs = ({ collaborator }: CollaboratorDetailsProps) => {
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
        <DialogContent className="min-w-[90vw] h-[90vh]">
            <Tabs defaultValue="details" className="flex flex-col items-center justify-center w-full h-full">
                <TabsList className="">
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

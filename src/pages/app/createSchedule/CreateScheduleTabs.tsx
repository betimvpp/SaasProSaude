import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateMultiScheduleTable } from './CreateMultiScheduleTable'
import { CreateSingleScheduleTable } from './CreateSingleScheduleTable'
import { useAuth } from '@/contexts/authContext';
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext';
import { useEffect, useState } from 'react';
import { CreateAvulseScheduleTable } from './CreateAvulseScheduleTable';
export const CreateScheduleTabs = () => {
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);


    useEffect(() => {
        if (user) {
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
                .finally();
        }
    }, [user, getCollaboratorById]);

    return (
        <Tabs defaultValue="simple" className="flex flex-col items-center justify-center w-full h-full">
            <TabsList className="">
                <TabsTrigger value="avulse">Avulsa</TabsTrigger>
                <TabsTrigger value="simple">Simples</TabsTrigger>
                <TabsTrigger value="multi">Corrida</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="w-full h-full">
                <CreateSingleScheduleTable isAdmin={collaboratorData?.role!} />
            </TabsContent>

            <TabsContent value="multi" className="w-full h-full">
                <CreateMultiScheduleTable isAdmin={collaboratorData?.role!} />
            </TabsContent>

            <TabsContent value="avulse" className="w-full h-full">
                <CreateAvulseScheduleTable isAdmin={collaboratorData?.role!} />
            </TabsContent>
        </Tabs>
    )
}

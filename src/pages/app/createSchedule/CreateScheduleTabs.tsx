import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateMultiScheduleTable } from './CreateMultiScheduleTable'
import { CreateSingleScheduleTable } from './CreateSingleScheduleTable'
export const CreateScheduleTabs = () => {
    return (
        <Tabs defaultValue="simple" className="flex flex-col items-center justify-center w-full h-full">
            <TabsList className="">
                <TabsTrigger value="simple">Simples</TabsTrigger>
                <TabsTrigger value="multi">Corrida</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="w-full h-full">
                <CreateSingleScheduleTable />
            </TabsContent>

            <TabsContent value="multi" className="w-full h-full">
                <CreateMultiScheduleTable />
            </TabsContent>
        </Tabs>
    )
}

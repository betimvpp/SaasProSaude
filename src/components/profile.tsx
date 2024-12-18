import { useAuth } from '@/contexts/authContext';
import { useCollaborator, Collaborator } from '@/contexts/collaboratorContext';
import { CircleUserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogTrigger } from './ui/dialog';
import { ProfileDetails } from './profileDetails';

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function Profile() {
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
                .finally(() => setIsLoading(false));
        }
    }, [user, getCollaboratorById]);

    return (
        <span className='flex flex-col items-center justify-center'>
            <CircleUserRound size={48} />
            {isLoading ? (
                <span className='flex flex-col items-center gap-1 mt-3'>
                    <Skeleton className='w-28 h-2' />
                    <Skeleton className='w-20 h-2' />
                </span>
            ) : (
                <>
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogTrigger asChild>
                            <p className='text-center text-sm font-semibold cursor-pointer'>{collaboratorData?.nome}</p>
                        </DialogTrigger>
                        <ProfileDetails open={isDetailsOpen} profile={collaboratorData!} />
                    </Dialog>

                    <p className='text-xs font-semibold text-center opacity-80'>
                        {collaboratorData?.role ? capitalizeFirstLetter(collaboratorData.role) : ''}
                    </p>
                </>
            )}
        </span>
    );
}

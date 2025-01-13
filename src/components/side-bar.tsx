import { NavLink } from './nav-link'
import { BadgeAlert, CalendarDays, ChartSplineIcon, Contact2, FileText, HandCoins, Speech, Stethoscope } from 'lucide-react'
import { Separator } from './ui/separator'
import { useAuth } from '@/contexts/authContext'
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext';
import { useEffect, useState } from 'react';

export function SideBar() {
    const { logout, user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const navigate = useNavigate();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);

    useEffect(() => {
        if (user) {
            getCollaboratorById(user.id).then(data => setCollaboratorData(data));
        }
    }, [user, getCollaboratorById]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const isAdmin = collaboratorData?.role === 'admin';
    const isRH = collaboratorData?.role === 'rh';
    const isRestricted = !isAdmin && !isRH;

    return (
        <div className='flex flex-col items-center'>
            <nav className='flex flex-col items-start mt-6 gap-3 break-words text-muted-foreground'>
                <NavLink to="/dashboard" disabled={!isAdmin}>
                    <ChartSplineIcon className='h-6 w-6' />
                    Dashboard
                </NavLink>

                <NavLink to="/escala">
                    <CalendarDays className='h-6 w-6' />
                    Escala
                </NavLink>

                <NavLink to="/pacientes" disabled={isRestricted}>
                    <Stethoscope className='h-6 w-6' />
                    Pacientes
                </NavLink>

                <NavLink to="/gestores" disabled={isRestricted}>
                    <Speech className='min-h-6 min-w-6' />
                    Gestores
                </NavLink>

                <NavLink to="/colaboradores" disabled={isRestricted}>
                    <Contact2 className='h-6 w-6' />
                    Colaboradores
                </NavLink>

                <NavLink to="/documentos" disabled={isRestricted}>
                    <FileText className='h-6 w-6' />
                    Documentos
                </NavLink>
                <NavLink to="/reclamacoes" disabled={isRestricted}>
                    <BadgeAlert className='h-6 w-6' />
                    Reclamações
                </NavLink>
                <NavLink to="/pagamentos" disabled={isRestricted}>
                    <HandCoins className='h-6 w-6' />
                    Pagamentos
                </NavLink>
            </nav>
            <Separator className='mt-6 mb-2 w-full' />
            <Button className='w-32' variant={'destructive'} onClick={handleLogout}>
                Sair
            </Button>
        </div>
    )
}

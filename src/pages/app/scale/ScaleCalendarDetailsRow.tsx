import { TableRow, TableCell } from '@/components/ui/table'
import { useAuth } from '@/contexts/authContext';
import { Collaborator, useCollaborator } from '@/contexts/collaboratorContext';
import { Scale } from '@/contexts/scaleContext'
import { useEffect, useState } from 'react';

export const ScaleCalendarDetailsRow = ({ scale }: { scale: Scale }) => {
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);

    useEffect(() => {
        if (user) {
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
        }
    }, [user, getCollaboratorById]);

    const getServiceTime = (tipoServico: string, defaultHorario: string) => {
        switch (tipoServico) {
            case 'SD':
                return '7:00 às 19:00';
            case 'SN':
                return '19:00 às 7:00';
            case 'P':
                return '7:00 às 7:00';
            case 'M':
                return '7:00 às 13:00';
            case 'T':
                return '13:00 às 19:00';
            default:
                return defaultHorario;
        }
    };

    return (
        <TableRow className='text-center' key={scale?.escala_id}>
            <TableCell>{scale?.tipo_servico}</TableCell>
            <TableCell>{scale?.nomeFuncionario}</TableCell>
            <TableCell>{scale?.nomePaciente}</TableCell>
            <TableCell>{scale?.data}</TableCell>
            {collaboratorData?.role === 'admin' ? <TableCell className="text-center font-semibold">{scale?.valor_recebido}</TableCell> : <></>}
            <TableCell className="text-center font-semibold">{scale?.valor_pago}</TableCell>
            <TableCell>{scale?.pagamentoAR_AV}</TableCell>
            <TableCell>
                {getServiceTime(scale?.tipo_servico, scale?.horario_gerenciamento!)}
            </TableCell>
        </TableRow>
    )
}

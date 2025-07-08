import { TableRow, TableCell } from '@/components/ui/table'
import { Scale } from '@/contexts/scaleContext'

interface ScaleCalendarDetailsRowProps {
    scale: Scale;
    isAdmin: boolean;
}
export const ScaleCalendarDetailsRow = ({ scale, isAdmin }: ScaleCalendarDetailsRowProps) => {

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
            {isAdmin && <TableCell>{scale?.valor_recebido}</TableCell>}
            <TableCell className="text-center font-semibold">{scale?.valor_pago}</TableCell>
            <TableCell>{scale?.pagamentoAR_AV}</TableCell>
            <TableCell>
                {getServiceTime(scale?.tipo_servico, scale?.horario_gerenciamento!)}
            </TableCell>
        </TableRow>
    )
}

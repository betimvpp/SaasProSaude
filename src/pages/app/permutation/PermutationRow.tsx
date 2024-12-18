import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ServiceExchange, useScale } from '@/contexts/scaleContext'

export const PermutationRow = ({ scale }: { scale: ServiceExchange }) => {
    const { handleApprove, handleReject } = useScale()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    const onApprove = async () => {
        handleApprove(scale);
    };

    const onReject = async () => {
        handleReject(scale);
    }
    return (
        <TableRow>
            <TableCell className="text-center">
                {scale?.nomeFuncionarioOrigem}
            </TableCell>

            <TableCell className="text-center">
                {scale?.nomeFuncionarioDestino}
            </TableCell>

            <TableCell className="text-center">
                {scale?.nomePaciente}
            </TableCell>

            <TableCell className="text-center">
                {scale?.data_servico_colaborador_origem ? formatDate(scale.data_servico_colaborador_origem) : 'N/A'}
            </TableCell>

            <TableCell className="text-center">
                {scale?.data_servico_destino ? formatDate(scale.data_servico_destino) : 'N/A'}
            </TableCell>

            <TableCell className="text-center">
                {scale?.servico_origem}
            </TableCell>

            <TableCell className="text-center">
                {scale?.servico_destino}
            </TableCell>

            <TableCell className="flex items-center justify-center gap-2">
                {scale?.status_func_destino === 'Pendente' && (
                    <Button size='xs' disabled variant='link'>
                        Pendente
                    </Button>
                )}

                {scale?.status_func_destino === 'Aprovado' && scale?.status_gestor === 'Aprovado' && (
                    <Button size='xs' disabled variant='outline' className='border-primary text-primary'>
                        Aprovado
                    </Button>
                )}

                {/* Status: Aprovado (gestor pendente) */}
                {scale?.status_func_destino === 'Aprovado' && scale?.status_gestor === 'Pendente' && (
                    <>
                        <Button size='xs' onClick={onApprove}>
                            Aprovar
                        </Button>
                        <Button size='xs' onClick={onReject} variant='destructive'>
                            X
                        </Button>
                    </>
                )}

                {/* Status: Aprovado (gestor rejeitado) */}
                {scale?.status_func_destino === 'Aprovado' && scale?.status_gestor === 'Rejeitado' && (
                    <Button size='xs' disabled variant='outline' className='border-destructive text-destructive'>
                        Rejeitado
                    </Button>
                )}

                {/* Status: Rejeitado (funcionario ou gestor) - Aparece uma vez */}
                {(scale?.status_func_destino === 'Rejeitado' || scale?.status_gestor === 'Rejeitado') && scale?.status_func_destino !== 'Aprovado' && scale?.status_gestor !== 'Aprovado' && (
                    <Button size='xs' disabled variant='outline' className='border-destructive text-destructive'>
                        Rejeitado
                    </Button>
                )}
            </TableCell>
        </TableRow >
    )
}
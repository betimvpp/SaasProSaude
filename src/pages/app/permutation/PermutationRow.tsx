import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ServiceExchange, useScale } from '@/contexts/scaleContext'
import { useState } from 'react'

export const PermutationRow = ({ scale }: { scale: ServiceExchange }) => {
    const { handleApprove, handleReject } = useScale()
    const [approvingLoading, setApprovingLoading] = useState(false);
    const [localScale, setLocalScale] = useState(scale)

    const onApprove = async () => {
        setApprovingLoading(true)
        try {
            await handleApprove(localScale) // Aprovar a permuta
            // Atualize o estado local após a aprovação
            setLocalScale((prevState) => ({
                ...prevState,
                status_func_destino: 'Aprovado',  // Atualize o status para 'Aprovado'
                status_gestor: 'Aprovado', // Caso necessário, também atualize o status do gestor
            }))
        } catch (error) {
            console.error('Erro ao aprovar permuta:', error)
        } finally {
            setApprovingLoading(false) // Desabilitar o loading
        }
    }

    const onReject = async () => {
        setApprovingLoading(true)
        try {
            await handleReject(localScale) // Rejeitar a permuta
            // Atualize o estado local após a rejeição
            setLocalScale((prevState) => ({
                ...prevState,
                status_func_destino: 'Rejeitado',
                status_gestor: 'Rejeitado',
            }))
        } catch (error) {
            console.error('Erro ao reprovar permuta:', error)
        } finally {
            setApprovingLoading(false) // Desabilitar o loading
        }
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
                {scale?.data_servico_colaborador_origem ? scale.data_servico_colaborador_origem : 'N/A'}
            </TableCell>

            <TableCell className="text-center">
                {scale?.data_servico_destino ? scale.data_servico_destino : 'N/A'}
            </TableCell>

            <TableCell className="text-center">
                {scale?.servico_origem}
            </TableCell>

            <TableCell className="text-center">
                {scale?.servico_destino}
            </TableCell>

            <TableCell className="flex items-center justify-center gap-2">
                {localScale?.status_func_destino === 'Pendente' && (
                    <Button size='xs' disabled variant='link'>
                        Pendente
                    </Button>
                )}

                {localScale?.status_func_destino === 'Aprovado' && localScale?.status_gestor === 'Aprovado' && (
                    <Button size='xs' disabled variant='outline' className='border-primary text-primary'>
                        Aprovado
                    </Button>
                )}

                {/* Status: Aprovado (gestor pendente) */}
                {localScale?.status_func_destino === 'Aprovado' && localScale?.status_gestor === 'Pendente' && (
                    <>
                        {approvingLoading ? (
                            <Button size='xs' disabled>
                                Aprovando
                            </Button>
                        ) : (
                            <Button size='xs' onClick={onApprove}>
                                Aprovar
                            </Button>
                        )}
                        {approvingLoading ? (
                            <Button size='xs' disabled variant='destructive'>
                                Reprovando
                            </Button>
                        ) : (
                            <Button size='xs' onClick={onReject} variant='destructive'>
                                Reprovar
                            </Button>
                        )}
                    </>
                )}

                {/* Status: Aprovado (gestor rejeitado) */}
                {localScale?.status_func_destino === 'Aprovado' && localScale?.status_gestor === 'Rejeitado' && (
                    <Button size='xs' disabled variant='outline' className='border-destructive text-destructive'>
                        Rejeitado
                    </Button>
                )}

                {/* Status: Rejeitado (funcionario ou gestor) */}
                {(localScale?.status_func_destino === 'Rejeitado' || localScale?.status_gestor === 'Rejeitado') && localScale?.status_func_destino !== 'Aprovado' && localScale?.status_gestor !== 'Aprovado' && (
                    <Button size='xs' disabled variant='outline' className='border-destructive text-destructive'>
                        Rejeitado
                    </Button>
                )}
            </TableCell>
        </TableRow >
    )
}
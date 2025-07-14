import { Button } from "@/components/ui/button"
import { Upload, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle, Send } from "lucide-react"
import { useRef, useState } from "react"
import { lerArquivoExcel, processarEscalasDoExcel } from "@/lib/excelReader"
import { EscalaData } from "@/lib/types"
import { handleCompararEscalasSupabase, ComparacaoEscala } from "@/lib/scaleComparison"
import { enviarEscalasImportadas } from "@/lib/scaleService"
import { toast } from "sonner"

export const CreateImportedScheduleTable = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedScales, setProcessedScales] = useState<EscalaData[]>([])
    const [comparacoes, setComparacoes] = useState<ComparacaoEscala[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isSending, setIsSending] = useState(false)
    const scalesPerPage = 10

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        setError("")

        if (file) {
            // Verificar se o arquivo é do tipo Excel
            const fileExtension = file.name.split('.').pop()?.toLowerCase()

            if (fileExtension !== 'xlsx') {
                setError("Por favor, selecione apenas arquivos Excel (.xlsx)")
                setSelectedFile(null)
                return
            }

            setSelectedFile(file)
        }
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleProcessFile = async () => {
        if (!selectedFile) return

        setIsProcessing(true)
        setError("")
        setCurrentPage(0) // Reset para primeira página

        try {
            // Ler o arquivo Excel
            const result = await lerArquivoExcel(selectedFile)

            if (!result.success || !result.data) {
                setError(result.error || "Erro ao processar o arquivo")
                return
            }

            // Processar as escalas (usando o mês atual como exemplo)
            const currentMonth = new Date().toISOString().slice(0, 7)
            const processResult = await processarEscalasDoExcel(result.data, currentMonth)

            if (!processResult.success || !processResult.escalas) {
                setError(processResult.error || "Erro ao processar as escalas")
                return
            }

            // Fazer comparação com o banco de dados
            const currentDate = new Date()
            const mes = currentDate.getMonth() + 1
            const ano = currentDate.getFullYear()

            const comparacoesResult = await handleCompararEscalasSupabase([result.data], mes, ano)
            setComparacoes(comparacoesResult)

            // Filtrar escalas que não existem no banco ou que têm diferenças
            const escalasFiltradas = processResult.escalas.filter(escala => {
                const comparacao = comparacoesResult.find(comp =>
                    comp.data === escala.data &&
                    comp.paciente_id === escala.paciente_id &&
                    comp.tecnico_id === escala.funcionario_id
                )

                // Incluir se não existe no banco ou se tem diferenças
                return !comparacao || comparacao.diferente
            })

            // Ordenar: escalas com diferenças primeiro, depois as novas, e por data
            const escalasOrdenadas = escalasFiltradas.sort((a, b) => {
                const comparacaoA = comparacoesResult.find(comp =>
                    comp.data === a.data &&
                    comp.paciente_id === a.paciente_id &&
                    comp.tecnico_id === a.funcionario_id
                )
                const comparacaoB = comparacoesResult.find(comp =>
                    comp.data === b.data &&
                    comp.paciente_id === b.paciente_id &&
                    comp.tecnico_id === b.funcionario_id
                )

                // Primeiro ordenar por diferenças
                if (comparacaoA?.diferente && !comparacaoB?.diferente) return -1
                if (comparacaoB?.diferente && !comparacaoA?.diferente) return 1
                
                // Depois ordenar por data
                return a.data.localeCompare(b.data)
            })

            setProcessedScales(escalasOrdenadas)
        } catch (err) {
            setError("Erro inesperado ao processar o arquivo")
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    // Calcular escalas para a página atual
    const totalPages = Math.ceil(processedScales.length / scalesPerPage) || 1
    const startIndex = currentPage * scalesPerPage
    const endIndex = startIndex + scalesPerPage
    const currentScales = processedScales.slice(startIndex, endIndex)

    const handlePageChange = (pageIndex: number) => {
        setCurrentPage(pageIndex)
    }

    const handleSendScales = async () => {
        if (processedScales.length === 0) return

        setIsSending(true)
        try {
            // Mapear EscalaData para o formato esperado pelo service
            const escalasParaEnviar = processedScales.map(escala => ({
                paciente_id: escala.paciente_id,
                funcionario_id: escala.funcionario_id,
                data: escala.data,
                tipo_servico: escala.tipo_servico,
                valor_recebido: escala.valor_recebido,
                valor_pago: escala.valor_pago,
                pagamentoAR_AV: escala.pagamentoAR_AV,
                horario_gerenciamento: escala.horario_gerenciamento || ''
            }))
            
            const resultado = await enviarEscalasImportadas(escalasParaEnviar)
            
            // Mostrar toast com resumo da operação
            if (resultado.sucessos > 0) {
                let mensagem = `✅ ${resultado.sucessos} escala(s) criada(s) com sucesso!`
                
                if (resultado.escalasExistentes > 0) {
                    mensagem += `\n⚠️ ${resultado.escalasExistentes} escala(s) já existiam e foram ignoradas.`
                }
                
                if (resultado.erros > 0) {
                    mensagem += `\n❌ ${resultado.erros} erro(s) encontrado(s).`
                }
                
                toast.success(mensagem)
            } else if (resultado.erros > 0) {
                toast.error(`❌ Erro ao enviar escalas: ${resultado.erros} erro(s) encontrado(s).`)
            } else if (resultado.escalasExistentes > 0) {
                toast.warning(`⚠️ Todas as ${resultado.escalasExistentes} escala(s) já existem no sistema.`)
            }
            
        } catch (error) {
            console.error('Erro ao enviar escalas:', error)
            toast.error('❌ Erro inesperado ao enviar escalas.')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="w-full h-full">
            {/* Overlay de loading com blur */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Processando arquivo Excel...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-start w-full h-full gap-4 p-4">
                <div className="flex flex-col lg:flex-row gap-6 w-full h-full">
                    {/* Primeira parte - Botão de importar */}
                    <div className="flex flex-col gap-4 lg:w-1/3">
                        <div className="p-6 border rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Importar Arquivo</h2>

                            {/* Input file oculto */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                className="w-full border"
                                size="lg"
                                variant="secondary"
                                onClick={handleButtonClick}
                                disabled={isProcessing}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Selecionar Arquivo Excel
                            </Button>

                            {selectedFile && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800 font-medium">
                                        Arquivo selecionado: {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <p className="text-sm text-muted-foreground mt-2">
                                Selecione um arquivo Excel (.xlsx) para importar as escalas
                            </p>

                            {/* Botão de processar */}
                            {selectedFile && (
                                <div className="w-full flex justify-center">
                                    <Button
                                        className="mt-4"
                                        size="lg"
                                        onClick={handleProcessFile}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            "Processar Escalas"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Segunda parte - Escalas importadas */}
                    <div className="flex flex-col gap-4 lg:w-2/3 min-h-[600px]">
                        <div className="p-6 border rounded-lg shadow-sm min-h-[600px] flex flex-col">
                            <h2 className="text-xl font-semibold mb-4">Escalas Importadas</h2>

                            <div className="flex-1 flex flex-col border rounded-md overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4">
                                    {processedScales.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-green-800">
                                                {processedScales.length} escala(s) processada(s) com sucesso!
                                            </p>
                                            <div className="space-y-1">
                                                {currentScales.map((escala, index) => {
                                                    const comparacao = comparacoes.find(comp =>
                                                        comp.data === escala.data &&
                                                        comp.paciente_id === escala.paciente_id &&
                                                        comp.tecnico_id === escala.funcionario_id
                                                    )

                                                    return (
                                                        <div key={startIndex + index} className="text-xs text-muted-foreground p-2 border rounded flex justify-between items-center">
                                                            <span>
                                                                Data: {escala.data} | Tipo: {escala.tipo_servico} | Pagamento: {escala.pagamentoAR_AV} | Colaborador: {escala.nome_colaborador}
                                                            </span>
                                                            {comparacao?.diferente && (
                                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : selectedFile ? (
                                        <div className="text-center text-muted-foreground">
                                            Arquivo "{selectedFile.name}" selecionado.
                                            Clique em "Processar" para importar as escalas.
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            Nenhuma escala importada ainda
                                        </div>
                                    )}
                                </div>

                                {/* Paginação */}
                                {processedScales.length > 0 && (
                                    <div className="flex items-center justify-between p-4 border-t">
                                        <span className="text-sm text-muted-foreground">
                                            Total de {processedScales.length} escala(s)
                                        </span>

                                        <div className="flex items-center gap-6 lg:gap-0">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handlePageChange(0)}
                                                    disabled={currentPage === 0}
                                                    variant='outline'
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                    <span className="sr-only">Voltar à primeira página</span>
                                                </Button>

                                                <Button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 0}
                                                    variant='outline'
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    <span className="sr-only">Voltar à página anterior</span>
                                                </Button>

                                                <div className="text-sm font-medium">
                                                    Página {currentPage + 1} de {totalPages}
                                                </div>

                                                <Button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={totalPages <= currentPage + 1}
                                                    variant='outline'
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                    <span className="sr-only">Avançar à próxima página</span>
                                                </Button>

                                                <Button
                                                    onClick={() => handlePageChange(totalPages - 1)}
                                                    disabled={totalPages <= currentPage + 1}
                                                    variant='outline'
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                    <span className="sr-only">Avançar à ultima página</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                        <div className="flex justify-end">      
                            {processedScales.length > 0 && (
                                <Button
                                    onClick={handleSendScales}
                                    disabled={isSending}
                                    size="lg"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Escalas
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
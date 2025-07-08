import { Helmet } from 'react-helmet-async'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

export const ContactPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-2">
            <Helmet title="Página de Contato" />
            <h1 className="text-4xl font-bold textslate mb-2">Página de Contato</h1>

            <div className="w-full flex flex-col mt-4">
                <h2 className="text-3xl font-semibold mb-2">E-Mail</h2>
                <h3>prosaudegestor@gmail.com</h3>
            </div>

            <div className="mt-8">
                <h2 className="text-3xl font-semibold mb-4">FAQ - Dúvidas Frequentes</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            Qual é o horário de funcionamento da cooperativa?
                        </AccordionTrigger>
                        <AccordionContent>
                            O horário de funcionamento é de segunda a sexta, das 8h às 18h.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            Como posso me associar à cooperativa de saúde?
                        </AccordionTrigger>
                        <AccordionContent>
                            Para se associar, preencha o formulário disponível em nosso site ou visite uma de nossas unidades.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger>
                            Quais são os benefícios de ser associado?
                        </AccordionTrigger>
                        <AccordionContent>
                            Os associados têm acesso a descontos em consultas, exames e procedimentos, além de atendimento personalizado.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger>
                            Como funciona o atendimento médico?
                        </AccordionTrigger>
                        <AccordionContent>
                            O atendimento é realizado por profissionais qualificados, com opções de consultas presenciais e telemedicina.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger>
                            Posso incluir meus dependentes na associação?
                        </AccordionTrigger>
                        <AccordionContent>
                            Sim, é possível incluir dependentes. Consulte as condições e custos adicionais para cada caso.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}

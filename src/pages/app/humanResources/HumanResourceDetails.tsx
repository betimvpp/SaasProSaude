import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { HumanResource, useHumanResources } from "@/contexts/rhContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export interface HumanResourceDetailsProps {
    humanResource: HumanResource;
    open: boolean;
}

export const HumanResourceDetails = ({ humanResource }: HumanResourceDetailsProps) => {
    const { register, handleSubmit, setValue } = useForm<HumanResource>({
        defaultValues: humanResource,
    });
    
    const { updateHumanResources } = useHumanResources()

    const handleUpdate = async (dataResp: HumanResource) => {
        if (!humanResource.funcionario_id) {
            console.error("ID do colaborador está indefinido");
            toast.error("Erro: colaborador ID indefinido.");
            return;
        }

        try {
            await updateHumanResources(dataResp, humanResource.funcionario_id);
            console.log("Dados enviados:", dataResp);
            toast.success("Colaborador atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar colaborador:", error);
            toast.error("Erro ao atualizar colaborador.");
        }
    };

    return (
        <DialogContent className="min-w-[90vw] overflow-y-scroll">
            <DialogHeader>
                <DialogTitle>Detalhes do Gestor: {humanResource.nome}</DialogTitle>
                <DialogDescription>Status: {humanResource.status}</DialogDescription>
            </DialogHeader>
            <form className="space-y-6" onSubmit={handleSubmit(handleUpdate)}>
                <Table >
                    <TableBody className="grid grid-cols-3">
                        <TableRow>
                            <TableCell className="font-semibold">Nome:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="nome" type="text" {...register("nome")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">E-mail:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="email" type="email" {...register("email")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">CPF:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="cpf" type="text" {...register("cpf")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Telefone:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="telefone" type="text" {...register("telefone")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Cidade:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="cidade" type="text" {...register("cidade")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Rua:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="rua" type="text" {...register("rua")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Banco:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="banco" type="text" {...register("banco")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Agencia:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="agencia" type="text" {...register("agencia")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Conta:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="conta" type="text" {...register("conta")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Chave Pix:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="conta" type="text" {...register("chave_pix")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Data  de Nascimento:</TableCell>

                            <TableCell className="flex justify-start -mt-2">
                                <Input id="conta" type="date" {...register("data_nascimento")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Status:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Select
                                    {...register("status")}
                                    defaultValue={humanResource.status}
                                    onValueChange={(value) => setValue("status", value)}
                                >
                                    <SelectTrigger >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="Ativo">Ativo</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Inativo">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <DialogFooter className="mt-2">
                    <Button type="submit">Editar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

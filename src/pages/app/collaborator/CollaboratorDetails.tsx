import { Button } from "@/components/ui/button";
import {  DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export interface CollaboratorDetailsProps {
    collaborator: Collaborator;
    open: boolean;
}

export const CollaboratorDetails = ({ collaborator, }: { collaborator: Collaborator; }) => {
    const { register, handleSubmit, setValue } = useForm<Collaborator>({
        defaultValues: collaborator,
    });
    
    const { updateCollaborator } = useCollaborator()

    const handleUpdate = async (dataResp: Collaborator) => {
        if (!collaborator.funcionario_id) {
            console.error("ID do colaborador está indefinido");
            toast.error("Erro: colaborador ID indefinido.");
            return;
        }

        try {
            await updateCollaborator(dataResp, collaborator.funcionario_id);
            toast.success("Colaborador atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar colaborador.");
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Detalhes do colaborador: {collaborator.nome}</DialogTitle>
                <DialogDescription>Status: {collaborator.status}</DialogDescription>
            </DialogHeader>
            <form action="" onSubmit={handleSubmit(handleUpdate)}>
                <div className="space-y-6">
                    <Table >
                        <TableBody className="grid grid-cols-3">
                            <TableRow>
                                <TableCell className="font-semibold">Nome:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="nome" type="text" {...register("nome")} required/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">E-mail:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="email" type="email" {...register("email")} required/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">CPF:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="cpf" type="text" {...register("cpf")} required/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">Telefone:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="telefone" type="text" {...register("cpf")} />
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
                                <TableCell className="font-semibold">Cargo:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Select
                                        {...register("role")} 
                                        defaultValue={collaborator.role}
                                        onValueChange={(value) => setValue("role", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="nutricionista">Nutricionista</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="fisioterapeuta">Fisioterapeuta</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="enfermeiro">Enfermeiro</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="técnico de enfermagem">Técnico de Enfermagem</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="fonoaudiólogo">Fonoaudiólogo</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="psicólogo">Psicólogo</SelectItem>
                                            <SelectItem className="cursor-pointer" {...register("role")} value="dentista">Dentista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">Status:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Select
                                        {...register("status")}
                                        defaultValue={collaborator.status}
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
                            <TableRow>
                                <TableCell >Chave Pix</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="chave_pix" type="text" {...register("chave_pix")} />
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </div>
                <DialogFooter className="mt-2">
                    <Button type="submit">Editar</Button>
                </DialogFooter>
            </form>
        </>
    )
}

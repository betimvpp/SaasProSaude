import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { HumanResource, useHumanResources } from "@/contexts/rhContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const HumanResourceAdditioner = () => {
    const { register, handleSubmit, setValue, reset } = useForm<HumanResource>({});
    const { addHumanResources } = useHumanResources();

    const handleAdd = async (dataResp: HumanResource) => {
        if (!dataResp.status) {
            toast.error("Status é obrigatório");
            return;
        }
        if (!dataResp.nome) {
            toast.error("Nome é obrigatório");
            return;
        }
        if (!dataResp.email) {
            toast.error("Email é obrigatório");
            return;
        }
        if (!dataResp.cpf) {
            toast.error("Cpf é obrigatório");
            return;
        }
        
        try {
            await addHumanResources(dataResp);
            reset();
        } catch (error) {
            console.error("Erro ao adicionar colaborador:", error);
        }
    };

    return (
        <DialogContent className="min-w-[1000px]">
            <DialogHeader>
                <DialogTitle>Adicionar RH:</DialogTitle>
            </DialogHeader>
            <form className="space-y-6" onSubmit={handleSubmit(handleAdd)}>
                <Table >
                    <TableBody className="grid grid-cols-3">
                        <TableRow>
                            <TableCell className="font-semibold">Nome:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="nome" type="text" placeholder="Ex: Pedro Silva" {...register("nome")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">E-mail:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="email" type="email" placeholder="Ex: exemplo@email.com" {...register("email")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">CPF:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="cpf" type="text" placeholder="Ex: 00011122233" required {...register("cpf")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Telefone:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="telefone" type="text" placeholder="Ex: 74988776655" {...register("telefone")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Cidade:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="cidade" type="text" placeholder="Ex: Alagoinhas" {...register("cidade")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Rua:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="rua" type="text" placeholder="Ex: Rua Silva Lopes" {...register("rua")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Banco:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="banco" type="text" placeholder="Ex: Banco do Brasil" {...register("banco")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Agencia:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="agencia" type="text" placeholder="Ex: 1111-1" {...register("agencia")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Conta:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="conta" type="text" placeholder="Ex: 111222333" {...register("conta")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Cargo:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <p>RH</p>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Status:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Select
                                    {...register("status")}
                                    onValueChange={(value) => setValue("status", value)}
                                    defaultValue="Ativo"
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
                            <TableCell ></TableCell>
                            <TableCell className="flex justify-start -mt-2">

                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <DialogFooter className="mt-2">
                    <Button type="submit">Adicionar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

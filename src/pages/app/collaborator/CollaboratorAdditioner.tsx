import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
export interface CollaboratorAdditionerProps {
    collaborator: Collaborator;
    open: boolean;
}

export const CollaboratorAdditioner = () => {
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Collaborator>({
        defaultValues: {
            role: "",
            status: "Ativo",
            cidade:"",
        },
        mode: "onSubmit",
    });
    const { addCollaborator } = useCollaborator();
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<string[]>([]);

    const handleAdd = async (dataResp: Collaborator) => {
        if (!dataResp.role) {
            toast.error("Cargo é obrigatório");
            return;
        }
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
        if (!dataResp.cidade) {
            toast.error("Cidade é obrigatório");
            return;
        }

        try {
            setLoading(true)
            await addCollaborator(dataResp);
            reset();
            setLoading(false)
        } catch (error) {
            console.error("Erro ao adicionar colaborador:", error);
        }
    };

    const fetchCities = async () => {
        try {
            const { data, error } = await supabase
                .from("cidade_de_atuacao")
                .select("cidade");

            if (error) throw error;
            setCities(data.map((city) => city.cidade)); // Atualize o estado com os nomes das cidades.
        } catch (error) {
            console.error("Erro ao buscar cidades:", error);
            toast.error("Não foi possível carregar as cidades.");
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    return (
        <DialogContent className="min-w-[1000px]">
            <DialogHeader>
                <DialogTitle>Adicione um colaborador: </DialogTitle>
            </DialogHeader>
            <form action="" className="space-y-6" onSubmit={handleSubmit(handleAdd)}>
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
                                <Select
                                    onValueChange={(value) => setValue("cidade", value)}
                                    defaultValue=""
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.cidade && <p className="text-red-500 text-sm mt-1">Cidade é obrigatória.</p>}
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
                                <Input id="chave_pix" type="text" {...register("chave_pix")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Cargo:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Select
                                    {...register("role")}
                                    onValueChange={(value) => setValue("role", value)}
                                    defaultValue=""
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um cargo" />
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
                                {errors.role && <p className="text-red-500 text-sm mt-1">Cargo é obrigatório.</p>}
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
                    </TableBody>
                </Table>

                <DialogFooter className="mt-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adicionando" : "Adicionar"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

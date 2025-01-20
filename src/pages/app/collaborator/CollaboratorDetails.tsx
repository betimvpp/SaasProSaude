import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useHabilities } from "@/contexts/habilitiesContext";
import supabase from "@/lib/supabase";
import { AArrowDown } from "lucide-react";

export interface CollaboratorDetailsProps {
    collaborator: Collaborator;
    open: boolean;
}

export const CollaboratorDetails = ({ collaborator, }: { collaborator: Collaborator; }) => {
    const { habilities, loading, fetchPatientHabilities } = useHabilities();
    const [selectedHabilities, setSelectedHabilities] = useState<number[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [newNeighborhood, setNewNeighborhood] = useState("");
    const [cities, setCities] = useState<string[]>([]);

    const { updateCollaborator } = useCollaborator();
    const { register, handleSubmit, setValue } = useForm<Collaborator>({
        defaultValues: collaborator,
    });

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

    const handleCheckboxChange = (especialidadeId: number) => {
        setSelectedHabilities((prevSelected) =>
            prevSelected.includes(especialidadeId)
                ? prevSelected.filter((id) => id !== especialidadeId)
                : [...prevSelected, especialidadeId]
        );
    };

    const handleAddNeighborhood = () => {
        if (newNeighborhood !== "") {
            setSelectedNeighborhoods((prev) => [...prev, newNeighborhood]);
            setNewNeighborhood("");
        }
    };

    const handleRemoveNeighborhood = (neighborhood: string) => {
        setSelectedNeighborhoods((prev) =>
            prev.filter((item) => item !== neighborhood)
        );
    };

    const handleUpdate = async (dataResp: Collaborator) => {
        if (!dataResp.cpf) {
            toast.error("Cpf é obrigatório");
            return;
        }
        if (!collaborator.funcionario_id) {
            console.error("ID do colaborador está indefinido");
            toast.error("Erro: colaborador ID indefinido.");
            return;
        }

        try {
            await updateCollaborator(dataResp, collaborator.funcionario_id, selectedHabilities);

            const { data: bairrosExistentes, error } = await supabase
                .from("funcionario_bairro")
                .select("bairro")
                .eq("funcionario_id", collaborator.funcionario_id);

            if (error) throw error;

            const bairrosNoBanco = bairrosExistentes.map((b) => b.bairro);

            const bairrosParaAdicionar = selectedNeighborhoods.filter(
                (bairro) => !bairrosNoBanco.includes(bairro)
            );

            const bairrosParaRemover = bairrosNoBanco.filter(
                (bairro) => !selectedNeighborhoods.includes(bairro)
            );

            if (bairrosParaAdicionar.length > 0) {
                const bairrosData = bairrosParaAdicionar.map((bairro) => ({
                    funcionario_id: collaborator.funcionario_id,
                    bairro,
                }));

                const { error: addError } = await supabase
                    .from("funcionario_bairro")
                    .insert(bairrosData);

                if (addError) throw addError;
            }

            if (bairrosParaRemover.length > 0) {
                const { error: removeError } = await supabase
                    .from("funcionario_bairro")
                    .delete()
                    .eq("funcionario_id", collaborator.funcionario_id)
                    .in("bairro", bairrosParaRemover);

                if (removeError) throw removeError;
            }

        } catch (error) {
            toast.error("Erro ao atualizar colaborador.");
        }
    };

    useEffect(() => {
        if (collaborator.funcionario_id) {
            const loadPatientHabilities = async () => {
                const collaboratorHabilities = await fetchPatientHabilities(collaborator.funcionario_id);
                setSelectedHabilities(collaboratorHabilities);
            };

            loadPatientHabilities();
        }
        fetchCities();
    }, [collaborator.funcionario_id, fetchPatientHabilities]);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!collaborator.funcionario_id) return;
            try {
                const { data, error } = await supabase
                    .from("funcionario_bairro")
                    .select("bairro")
                    .eq("funcionario_id", collaborator.funcionario_id);

                if (error) throw error;
                setSelectedNeighborhoods(data.map((item) => item.bairro));
            } catch (error) {
                console.error("Erro ao carregar bairros:", error);
                toast.error("Erro ao carregar bairros.");
            }
        };

        fetchNeighborhoods();
    }, [collaborator.funcionario_id]);

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
                                    <Input id="telefone" type="text" {...register("cpf")} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">Cidade:</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Select
                                        onValueChange={(value) => setValue("cidade", value)}
                                        defaultValue={collaborator.cidade}
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
                                <TableCell >Chave Pix</TableCell>
                                <TableCell className="flex justify-start -mt-2">
                                    <Input id="chave_pix" type="text" {...register("chave_pix")} />
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
                                <TableCell className="font-semibold">Bairros:</TableCell>
                                <TableCell className="w-full">
                                    <div className="space-y-2 w-full">
                                        <span className="flex space-x-1">
                                            <Input
                                                value={newNeighborhood}
                                                onChange={(e) => setNewNeighborhood(e.target.value)}
                                                // onKeyDown={handleAddNeighborhood}
                                                placeholder="Digite um bairro e clique no botão"
                                                className="w-full"
                                            />
                                            <button type="button" onClick={handleAddNeighborhood}>
                                                <AArrowDown />
                                            </button>
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNeighborhoods.map((neighborhood) => (
                                                <div
                                                    key={neighborhood}
                                                    className="flex items-center px-2 py-1 bg-gray-200 rounded-full"
                                                >
                                                    <span className="mr-2">{neighborhood}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNeighborhood(neighborhood)}
                                                        className="text-red-500"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>

                            <TableRow className="col-span-2 flex">
                                <TableCell className="font-semibold">Especialidades:</TableCell>
                                <TableCell className="w-full grid grid-cols-3 gap-2">
                                    {loading ? (
                                        <p>Carregando especialidades...</p>
                                    ) : (
                                        habilities.map((hability) => (
                                            <div key={hability.especialidade_id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedHabilities.includes(hability.especialidade_id)}
                                                    onChange={() => handleCheckboxChange(hability.especialidade_id)}
                                                    className="cursor-pointer"
                                                />
                                                <label>{hability.nome}</label>
                                            </div>
                                        ))
                                    )}
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

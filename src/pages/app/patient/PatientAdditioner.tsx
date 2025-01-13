import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/authContext";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";
import { useHabilities } from "@/contexts/habilitiesContext";
import { Patient, usePatients } from "@/contexts/patientContext";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const PatientAdditioner = () => {
    const { habilities, loading } = useHabilities();
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Patient>({
        defaultValues: {
            status: "Ativo",
            cidade: "",
        },
        mode: "onSubmit",
    });
    const { addPatient } = usePatients();
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cities, setCities] = useState<string[]>([]);

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

    const [selectedHabilities, setSelectedHabilities] = useState<number[]>([]);

    const handleAdd = async (dataResp: Patient) => {
        if (!dataResp.nome) {
            toast.error("Nome é obrigatório");
            return;
        }
        if (!dataResp.status) {
            toast.error("Status é obrigatório");
            return;
        }
        if (!dataResp.cidade) {
            toast.error("Cidade é obrigatório");
            return;
        }

        try {
            const patientData = {
                ...dataResp,
                especialidades: selectedHabilities,
            };
            await addPatient(patientData);
            reset();
        } catch (error) {
            console.error("Erro ao adicionar paciente:", error!);
        }
        ;
    };

    const handleCheckboxChange = (especialidadeId: number) => {
        setSelectedHabilities((prevSelected) =>
            prevSelected.includes(especialidadeId)
                ? prevSelected.filter((id) => id !== especialidadeId)
                : [...prevSelected, especialidadeId]
        );
    };

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getCollaboratorById(user.id)
                .then(data => setCollaboratorData(data))
                .finally(() => setIsLoading(false));
        }
        fetchCities();
    }, [user, getCollaboratorById]);

    return (
        <DialogContent className="min-w-[90vw]">
            <DialogHeader>
                <DialogTitle>Adicionar Paciente</DialogTitle>
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
                            <TableCell className="font-semibold">Contratante:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="plano" type="text" placeholder="Ex: Planserve" {...register("plano_saude")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Nivel:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="nivel" type="text" placeholder="Ex: 7" {...register("cpf")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">E-mail:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="email" type="email" placeholder="Ex: exemplo@email.com" {...register("email")} />
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
                            <TableCell className="font-semibold">Bairro:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="bairro" type="text" placeholder="Ex: Brotas" {...register("bairro")} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Rua:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="rua" type="text" placeholder="Ex: Rua Silva Lopes" {...register("rua")} />
                            </TableCell>
                        </TableRow>
                        {!isLoading && collaboratorData?.role === 'admin' ? (
                            <>
                                <TableRow>
                                    <TableCell className="font-semibold">Pagamento/Dia:</TableCell>
                                    <TableCell className="flex justify-start -mt-2">
                                        <Input
                                            id="pagamento_dia"
                                            type="number"
                                            placeholder="Ex: 250"
                                            onChange={(e) => setValue("pagamento_dia", parseInt(e.target.value) || 0)}
                                        />
                                    </TableCell>
                                </TableRow>

                            </>
                        ) : (
                            <></>
                        )}
                        <TableRow>
                            <TableCell className="font-semibold">Pagamento/Profissional:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input
                                    id="pagamento_a_profissional"
                                    type="number"
                                    placeholder="Ex: 200"
                                    onChange={(e) => setValue("pagamento_a_profissional", parseInt(e.target.value) || 0)}
                                />
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
                        <TableRow className="col-span-3 flex">
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
                <DialogFooter className="mt-2">
                    <Button type="submit">Adicionar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

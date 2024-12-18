import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useHabilities } from "@/contexts/habilitiesContext";
import { useState } from "react";
import { toast } from "sonner";

export const PatientSpecialtyAdditioner = () => {
    const { addSpecialty } = useHabilities();
    const [specialty, setSpecialty] = useState("");
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const specialtyTrimmed = specialty.trim();
            if (specialtyTrimmed && !specialties.includes(specialtyTrimmed)) {
                setSpecialties([...specialties, specialtyTrimmed]);
                setSpecialty("");
            } else if (specialties.includes(specialtyTrimmed)) {
                alert("Especialidade já adicionada."); 
            }
        }
    };

    const removeSpecialty = (index: number) => {
        setSpecialties(specialties.filter((_, i) => i !== index));
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            for (const item of specialties) {
                await addSpecialty(item);
            }
            setSpecialties([]);
            toast.success("Especialidades adicionadas com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar especialidades:", error);
            toast.error("Erro ao adicionar especialidades.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="min-w-[1000px]">
            <DialogHeader>
                <DialogTitle>Adicionar Especialidade</DialogTitle>
                <DialogDescription>Não Encontrou a especialidade que desejava? Adicione abaixo:</DialogDescription>
            </DialogHeader>
            <form className="space-y-6" onSubmit={onSubmit}>
                <Table >
                    <TableBody className="grid grid-cols-3">
                        <TableRow>
                            <TableCell className="font-semibold">Especialidade:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Ex: Cardiologia"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow className="col-span-2">
                            <TableCell className="font-semibold">Especialidades Adicionadas:</TableCell>
                            <TableCell className="flex flex-wrap justify-start -mt-2 gap-2">
                                {specialties.length > 0 ? (
                                    specialties.map((item, index) => (
                                        <div key={index} className="flex items-center border rounded px-2">
                                            <span>{item}</span>
                                            <Button
                                                variant="ghost"
                                                onClick={() => removeSpecialty(index)}
                                                className="px-1"
                                            >
                                                x
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-500">Nenhuma especialidade adicionada.</span>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <DialogFooter className="mt-2">
                    <Button type="submit">
                        {loading ? "Adicionando..." : "Adicionar"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

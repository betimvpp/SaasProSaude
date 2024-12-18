import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import supabase from "@/lib/supabase";

export const CityAdditioner = () => {
    const [city, setCity] = useState("");
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const checkCityInDatabase = useCallback(async (name: string) => {
        try {
            const { data: existingCity, error } = await supabase
                .from('cidade_de_atuacao')
                .select('cidade')
                .eq('cidade', name)
                .maybeSingle();

            if (error) throw error;

            return !!existingCity;
        } catch (error) {
            console.error("Erro ao verificar cidade no banco:", error);
            toast.error("Erro ao verificar cidade no banco.");
            return false;
        }
    }, []);

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const cityTrimmed = city.trim();
            if (!cityTrimmed) return;

            if (cities.includes(cityTrimmed)) {
                toast.error("Cidade já adicionada localmente.");
                return;
            }

            const existsInDatabase = await checkCityInDatabase(cityTrimmed);
            if (existsInDatabase) {
                toast.error("Cidade já está cadastrada no banco.");
                return;
            }

            setCities([...cities, cityTrimmed]);
            setCity("");
        }
    };

    const removeCity = (index: number) => {
        setCities(cities.filter((_, i) => i !== index));
    };

    const addCityToDatabase = useCallback(async (name: string) => {
        try {
            const { data, error } = await supabase
                .from('cidade_de_atuacao') 
                .insert([{ cidade: name }]);

            if (error) throw error;

            console.log("Cidade adicionada com sucesso:", data);
        } catch (error) {
            console.error("Erro ao adicionar cidade ao banco:", error);
            throw error;
        }
    }, []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            for (const item of cities) {
                await addCityToDatabase(item);
            }
            setCities([]);
            toast.success("Cidades adicionadas com sucesso!");
        } catch (error) {
            toast.error("Erro ao adicionar cidades ao banco.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="min-w-[1000px]">
            <DialogHeader>
                <DialogTitle>Adicionar Cidade</DialogTitle>
                <DialogDescription>Adicione cidades que ainda não estão cadastradas:</DialogDescription>
            </DialogHeader>
            <form className="space-y-6" onSubmit={onSubmit}>
                <Table>
                    <TableBody className="grid grid-cols-3">
                        <TableRow>
                            <TableCell className="font-semibold">Cidade:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Ex: São Paulo"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow className="col-span-2">
                            <TableCell className="font-semibold">Cidades Adicionadas:</TableCell>
                            <TableCell className="flex flex-wrap justify-start -mt-2 gap-2">
                                {cities.length > 0 ? (
                                    cities.map((item, index) => (
                                        <div key={index} className="flex items-center border rounded px-2">
                                            <span>{item}</span>
                                            <Button
                                                variant="ghost"
                                                onClick={() => removeCity(index)}
                                                className="px-1"
                                            >
                                                x
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-500">Nenhuma cidade adicionada.</span>
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
    );
};

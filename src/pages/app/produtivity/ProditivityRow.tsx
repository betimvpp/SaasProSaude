import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { ProdutivityInfo } from "@/contexts/produtivityContext";
import { Search } from "lucide-react";
import { useState } from "react";
import { ProdutivityDetails } from "./ProdutivityDetails";

export const ProdutivityRow = ({ produtividade, moth }: { produtividade: ProdutivityInfo, moth: string }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    return (
        <TableRow key={produtividade.paciente_id}>
            <TableCell className="text-center">
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} key={produtividade.paciente_id}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="xs">
                            <Search className="h-3 w-3" />
                            <span className="sr-only">Detalhes do RH</span>
                        </Button>
                    </DialogTrigger>
                    <ProdutivityDetails produtividade={produtividade} loading={false} open={false} month={moth} />
                </Dialog>
            </TableCell>
            <TableCell className="text-center">{produtividade.nome_paciente}</TableCell>
            <TableCell className='text-center'>{produtividade.cidade}</TableCell>
            <TableCell className="text-center">{produtividade.plano_saude}</TableCell>
            <TableCell className="text-center">{produtividade.M}</TableCell>
            <TableCell className="text-center">{produtividade.T}</TableCell>
            <TableCell className="text-center">{produtividade.SD}</TableCell>
            <TableCell className="text-center">{produtividade.SN}</TableCell>
            <TableCell className="text-center">{produtividade.P}</TableCell>
            <TableCell className="text-center">{produtividade.G}</TableCell>
        </TableRow>
    )
}
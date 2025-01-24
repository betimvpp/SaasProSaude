import { TableCell, TableRow } from "@/components/ui/table";
import { produtividadeInfor } from "@/contexts/produtividadeContex";




export const ProdutividadeRow = ({ produtividade }: { produtividade: produtividadeInfor }) => {


    return (
        <TableRow key={produtividade.paciente_id}>
             <TableCell className="text-center">{}</TableCell>
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
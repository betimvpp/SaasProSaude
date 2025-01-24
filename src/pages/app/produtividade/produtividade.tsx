import { useProdutividade } from "@/contexts/produtividadeContex";
import { ProdutividadeTable } from "./produtividadeTable"
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";

export const Produtividade = () => { 
    const { PacinteEscalaScalesData, loading, fetchProdutividade, totalCount} = useProdutividade();
    const [pageIndex, setPageIndex] = useState(0);

    const handlePageChange = (newPageIndex: number) => {
      setPageIndex(newPageIndex);
    };
    useEffect(() => {
      const fetchData = async () => {
        await fetchProdutividade({}, pageIndex);
      };
  
      fetchData();
    }, [fetchProdutividade, pageIndex]);

    return (
        <div className="flex flex-col w-full h-full gap-2">
           <h1 className="text-4xl font-bold textslate mb-2">Painel de Produtividade dos Pacientes</h1>
                <div className="w-full h-full shadow-lg border rounded-md">
                   <ProdutividadeTable //selectedMonth={selectedMonth}
                    />
                   {PacinteEscalaScalesData?.length === 0 && loading === false &&
                     <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhum usuário encontrado!</div>
                   }
                 </div>
                  <Pagination
                         pageIndex={pageIndex}
                         totalCount={totalCount}
                         perPage={10}
                         onPageChange={handlePageChange}
                       />
                 
        </div>
    )
}
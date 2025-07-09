import { useProdutivity } from "@/contexts/produtivityContext";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { ProdutivityTable } from "./ProdutivityTable";
import { ProdutivityFilters } from "./produtivityFilters";

export const Produtivity = () => {
  const { produtivityData, loading, fetchProdutivity, totalCount } = useProdutivity();
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('');


  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchProdutivity({}, pageIndex);
    };

    fetchData();
  }, [fetchProdutivity, pageIndex]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Produtividade dos Pacientes</h1>
      <ProdutivityFilters setSelectedMonth={setSelectedMonth}
      />
      <div className="w-full min-h-[700px] shadow-lg border rounded-md">
        <ProdutivityTable selectedMonth={selectedMonth}
        />
        {produtivityData?.length === 0 && loading === false &&
          <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhuma produtividade encontrada!</div>
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
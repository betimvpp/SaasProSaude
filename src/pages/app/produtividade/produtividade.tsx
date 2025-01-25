import { useProdutividade } from "@/contexts/produtividadeContex";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { ProdutividadeTable } from "./ProdutividadeTable";
import { ProdutividadeFiltert } from "./produtividadeFilter";

export const Produtividade = () => {
  const {produtividadeData, loading, fetchProdutividade, totalCount } = useProdutividade();
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCidade, setSelectedcidade] = useState<string>('');

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
      <ProdutividadeFiltert setSelectedMonth={setSelectedMonth} setSelectedCidade={setSelectedcidade}
      />
      <div className="w-full h-full shadow-lg border rounded-md">
        <ProdutividadeTable selectedMonth={selectedMonth}
        />
        {produtividadeData?.length === 0 && loading === false &&
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
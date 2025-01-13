import { Helmet } from "react-helmet-async"
import { HumanResourcesTable } from "./HumanResourcesTable"
import { HumanResourcesFilters } from "./HumanResourcesFilters"
import { useHumanResources } from "@/contexts/rhContext";
import { Pagination } from "@/components/pagination";
import { useEffect, useState } from "react";

export const HumanResources = () => {
  const { humanResources, loading, fetchHumanResources, fetchHumanResourcesNotPaginated, humanResourcesNotPaginated } = useHumanResources();
  const [pageIndex, setPageIndex] = useState(0);
  const totalCount = humanResourcesNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchHumanResources({}, pageIndex);
      await fetchHumanResourcesNotPaginated({});
    };

    fetchData();
  }, [fetchHumanResources, pageIndex, fetchHumanResourcesNotPaginated]);

  return (
    <div className="flex flex-col w-full gap-2">
      <Helmet title="Gestores" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Gestores</h1>
      <HumanResourcesFilters />
      <div className="w-full h-full max-h-[700px] shadow-lg border rounded-md">
        <HumanResourcesTable />
        {humanResources?.length === 0 && loading === false &&
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

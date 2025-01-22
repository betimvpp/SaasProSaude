import { Helmet } from "react-helmet-async"

import { Pagination } from "@/components/pagination";
import { useEffect, useState } from "react";
import { useScale } from "@/contexts/scaleContext";
import { Link } from "react-router-dom";
import { PermutationTable } from "./PermutationTable";
import { PermutationFilters } from "./PermutationFilters";

export const Permutation = () => {
    const { fetchServiceExchangesNotPaginated, fetchServiceExchanges, loading, serviceExchangesNotPaginated, serviceExchanges } = useScale()
    const [pageIndex, setPageIndex] = useState(0);
    const totalCount = serviceExchangesNotPaginated?.length || 0;

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchServiceExchanges({}, pageIndex);
            await fetchServiceExchangesNotPaginated({});
        };

        fetchData();
    }, [fetchServiceExchanges, pageIndex, fetchServiceExchangesNotPaginated]);

    return (
        <div className="flex flex-col w-full gap-2">
            <Helmet title="Pacientes" />
            <h1 className="text-4xl font-bold textslate mb-2">
                <Link to={"/escala"}>Painel de Escalas </Link>
                - Permutas
            </h1>
            <PermutationFilters />
            <div className="w-full h-full shadow-lg border rounded-md">
                <PermutationTable />
                {serviceExchanges?.length === 0 && loading === false &&
                    <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhuma permuta encontrada!</div>
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

import { Helmet } from "react-helmet-async"
import { CollaboratorTable } from "./CollaboratorTable"
import { CollaboratorFilters } from "./CollaboratorFilters"
import { useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { CollaboratorFiltersSchema } from "@/contexts/collaboratorContext";

export const Collaborator = () => {
  const { collaborators, loading, collaboratorsNotPaginated, fetchCollaborator, fetchCollaboratorNotPaginated } = useCollaborator();
  const [pageIndex, setPageIndex] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<CollaboratorFiltersSchema>({});
  const totalCount = collaboratorsNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handleFiltersChange = (filters: CollaboratorFiltersSchema) => {
    setCurrentFilters(filters);
    setPageIndex(0); // Reset para primeira página quando aplicar filtros
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCollaborator(currentFilters, pageIndex); 
      await fetchCollaboratorNotPaginated(currentFilters);
    };

    fetchData();
  }, [fetchCollaborator, pageIndex, fetchCollaboratorNotPaginated, currentFilters]);

  return (
    <div className="flex flex-col w-full gap-2">
      <Helmet title="Colaboradores" />
      <h1 className="text-4xl font-bold mb-2">Painel de Colaboradores</h1>
      <CollaboratorFilters onFiltersChange={handleFiltersChange} />
      <div className="w-full min-h-[700px] shadow-lg border rounded-md">
        <CollaboratorTable />
        {collaborators?.length === 0 && loading === false &&
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

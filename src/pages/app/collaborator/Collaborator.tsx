import { Helmet } from "react-helmet-async"
import { CollaboratorTable } from "./CollaboratorTable"
import { CollaboratorFilters } from "./CollaboratorFilters"
import { useCollaborator } from "@/contexts/collaboratorContext";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";

export const Collaborator = () => {
  const { collaborators, loading, collaboratorsNotPaginated, fetchCollaborator, fetchCollaboratorNotPaginated } = useCollaborator();
  const [pageIndex, setPageIndex] = useState(0);
  const totalCount = collaboratorsNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCollaborator({}, pageIndex); 
      await fetchCollaboratorNotPaginated({});
    };

    fetchData();
  }, [fetchCollaborator, pageIndex, fetchCollaboratorNotPaginated]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Colaboradores" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Colaboradores</h1>
      <CollaboratorFilters />
      <div className="w-ful h-full max-h-[700px] shadow-lg border rounded-md">
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

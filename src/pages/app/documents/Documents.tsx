import { Pagination } from '@/components/pagination'
import { Helmet } from 'react-helmet-async'
import { DocumentsFilters } from './DocumentsFilters'
import { useEffect, useState } from 'react';
import { useDocuments } from '@/contexts/docsContext';
import { DocumentsTable } from './DocumentsTable';

export const Documents = () => {
  const { documentsNotPaginated, fetchDocuments, fetchDocumentsNotPaginated } = useDocuments();
  const [pageIndex, setPageIndex] = useState(0);
  const totalCount = documentsNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDocuments({ pageIndex });
      await fetchDocumentsNotPaginated();
    };

    fetchData();
  }, [fetchDocuments, pageIndex, fetchDocumentsNotPaginated]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Documentos" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Documentos</h1>
      <DocumentsFilters />
      <div className="w-full h-full shadow-lg border rounded-md">
        <DocumentsTable />
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

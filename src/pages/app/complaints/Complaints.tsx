import { Pagination } from '@/components/pagination'
import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react';
import { useComplaints } from '@/contexts/complaintsContext';
import { ComplaintsFilters } from './ComplaintsFilters';
import { ComplaintsTable } from './ComplaintsTable';

export const Complaints = () => {
  const { complaintsNotPaginated, fetchComplaints, fetchComplaintsNotPaginated } = useComplaints();
  const [pageIndex, setPageIndex] = useState(0);
  const totalCount = complaintsNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchComplaints({ pageIndex });
      await fetchComplaintsNotPaginated();
    };

    fetchData();
  }, [fetchComplaints, pageIndex, fetchComplaintsNotPaginated]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Reclamações" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Reclamações</h1>
      <ComplaintsFilters />
      <div className="w-full h-full max-h-[700px] shadow-lg border rounded-md">
        <ComplaintsTable />
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

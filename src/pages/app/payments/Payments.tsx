import { Helmet } from 'react-helmet-async'
import { PaymentFilter } from './PaymentsFilter'
import { PaymentTable } from './PaymentTable'
import { useEffect, useState } from 'react';
import { usePayment } from '@/contexts/paymentContext';
import { Pagination } from '@/components/pagination';

export const Payments = () => {
  const { paymentData, loading, fetchPayments, totalCount } = usePayment();
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // 
  const [selectedRole, setSelectedRole] = useState<string>('all'); // 

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handleFilterChange = (month: string, role: string) => {
    setSelectedMonth(month);
    setSelectedRole(role);
    setPageIndex(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPayments({ month: selectedMonth, role: selectedRole }, pageIndex);
    };

    fetchData();
  }, [fetchPayments, selectedMonth, selectedRole, pageIndex]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Pagamentos" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Pagamentos</h1>
      <PaymentFilter onFilterChange={handleFilterChange} />
      <div className="w-full min-h-[700px] shadow-lg border rounded-md">
        <PaymentTable selectedMonth={selectedMonth} />
        {paymentData?.length === 0 && loading === false &&
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
  );
};

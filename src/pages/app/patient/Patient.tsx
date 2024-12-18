import { Helmet } from "react-helmet-async"
import { PatientTable } from "./PatientTable"
import { PatientFilters } from "./PatientFilters"
import { usePatients } from "@/contexts/patientContext";
import { Pagination } from "@/components/pagination";
import { useEffect, useState } from "react";

export const Patient = () => {
  const { patients, patientsNotPaginated, loading, fetchPatients, fetchPatientsNotPaginated } = usePatients();
  const [pageIndex, setPageIndex] = useState(0);
  const totalCount = patientsNotPaginated?.length || 0;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPatients({}, pageIndex);
      await fetchPatientsNotPaginated({});
    };

    fetchData();
  }, [fetchPatients, pageIndex, fetchPatientsNotPaginated]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Pacientes" />
      <h1 className="text-4xl font-bold textslate mb-2">Painel de Pacientes</h1>
      <PatientFilters />
      <div className="w-full h-full max-h-[700px] shadow-lg border rounded-md">
        <PatientTable />
        {patients?.length === 0 && loading === false &&
          <div className="w-full h-full m-auto text-center text-lg font-semibold text-muted-foreground flex items-center justify-center">Nenhum paciente encontrado!</div>
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


import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CreateScheduleTabs } from './CreateScheduleTabs';
export const CreateSchedule = () => {
    return (

        <div className="flex flex-col w-full gap-2">
            <Helmet title="Pacientes" />
            <h1 className="text-4xl font-bold textslate mb-2">
                <Link to={"/escala"}>Painel de Escalas </Link>
                - Criar Escala
            </h1>

            <div className="w-full h-full shadow-lg  rounded-md">
                <CreateScheduleTabs />
            </div>
        </div>
    )
}

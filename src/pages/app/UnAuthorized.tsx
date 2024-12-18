import { ShieldOff } from 'lucide-react'

export const UnAuthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <ShieldOff size={64}/>
            <h1 className="text-3xl font-bold">Acesso Não Autorizado</h1>
            <p>Ops, parece que você não tem permissão para acessar esta página.</p>
        </div>
    )
}

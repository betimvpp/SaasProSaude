import { PanelsLeftBottom } from "lucide-react"

export const WelcolmePage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <PanelsLeftBottom size={64} />
            <h1 className="text-3xl font-bold">Seja bem vindo(a)</h1>
            <p>Você está acessando o painel administrativo da CooperVida</p>
        </div>
    )
}

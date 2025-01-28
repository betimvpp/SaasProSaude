import { MonitorSmartphone } from "lucide-react"

export const ShortScreen = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8">
        <MonitorSmartphone size={64}/>
        <h1 className="font-bold text-3xl">Ops....</h1>
        <h2 className="text-center font-semibold">Parece que você está tentando acessar nosso site pelo celular.</h2>
        <h3 className="text-center text-muted-foreground">Nosso sistema foi desenvolvido para computador e não possui responsividade para ser acessado por dispositivos mobile.</h3>
    </div>
  )
}

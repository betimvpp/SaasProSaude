import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp } from "lucide-react";

export const description = "A radar chart with dots"

const currentMonth = new Date().getMonth();
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

const chartData = [
    { month: months[(currentMonth - (5 - 5) + 12) % 12], habilidade1: 218, habilidade2: 120, habilidade3: 200, habilidade4: 150, habilidade5: 170 },
    { month: months[(currentMonth - (5 - 4) + 12) % 12], habilidade1: 205, habilidade2: 250, habilidade3: 300, habilidade4: 270, habilidade5: 290 },
    { month: months[(currentMonth - (5 - 3) + 12) % 12], habilidade1: 237, habilidade2: 180, habilidade3: 220, habilidade4: 210, habilidade5: 200 },
    { month: months[(currentMonth - (5 - 2) + 12) % 12], habilidade1: 235, habilidade2: 240, habilidade3: 290, habilidade4: 260, habilidade5: 230 },
    { month: months[(currentMonth - (5 - 1) + 12) % 12], habilidade1: 209, habilidade2: 160, habilidade3: 180, habilidade4: 170, habilidade5: 195 },
    { month: months[(currentMonth - (5 - 0) + 12) % 12], habilidade1: 214, habilidade2: 195, habilidade3: 230, habilidade4: 200, habilidade5: 210 },
]

const chartConfig = {
    habilidade1: { label: "Desktop", color: "hsl(var(--chart-1))" },
    habilidade2: { label: "Mobile", color: "hsl(var(--chart-2))" },
    habilidade3: { label: "Web", color: "hsl(var(--chart-3))" },
    habilidade4: { label: "Cloud", color: "hsl(var(--chart-4))" },
    habilidade5: { label: "Data", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

export const MostUsedServices = () => {
    return (
        <Card className="h-full rounded-xl">
            <CardHeader className="">
                <CardTitle>Especialidades mais utilizadas</CardTitle>
                <CardDescription>
                    {months[(currentMonth - (5 - 0) + 12) % 12]} - {months[(currentMonth - (5 - 5) + 12) % 12]} {new Date().getFullYear()}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[220px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid />
                        {Object.keys(chartConfig).map((key) => (
                            <Radar
                                key={key}
                                dataKey={key as keyof typeof chartConfig} // Cast para keyof typeof chartConfig
                                fill={chartConfig[key as keyof typeof chartConfig].color}
                                fillOpacity={0.6}
                                dot={{ r: 4, fillOpacity: 1 }}
                            />
                        ))}
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2024
                </div>
            </CardFooter>
        </Card>
    )
}

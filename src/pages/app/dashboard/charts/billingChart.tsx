import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

const currentMonth = new Date().getMonth();
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

type ChartData = {
    month: string;
    faturamentoTotal: number;
    pagamentoColaboradores: number;
    lucroLiquido: number;
};

const chartConfig = {
    faturamentoTotal: {
        label: "Faturamento Total",
        color: "hsl(var(--chart-1))",
    },
    pagamentoColaboradores: {
        label: "Pagamento aos Colaboradores",
        color: "hsl(var(--chart-2))",
    },
    lucroLiquido: {
        label: "Lucro Liquido",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export const BillingChart = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const { data, error } = await supabase
                    .from("escala")
                    .select("data, valor_recebido, valor_pago");

                if (error) throw error;

                // Processar dados para agrupar por mês
                const processedData = Array.from({ length: 3 }, (_, i) => {
                    const monthIndex = (currentMonth - (2 - i) + 12) % 12;
                    const monthData = data.filter((row) => new Date(row.data).getMonth() === monthIndex);

                    const faturamentoTotal = monthData.reduce((sum, row) => sum + (row.valor_recebido || 0), 0);
                    const pagamentoColaboradores = monthData.reduce((sum, row) => sum + (row.valor_pago || 0), 0);
                    const lucroLiquido = faturamentoTotal - pagamentoColaboradores;

                    return {
                        month: months[monthIndex],
                        faturamentoTotal,
                        pagamentoColaboradores,
                        lucroLiquido,
                    };
                });

                setChartData(processedData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchChartData();
    }, []);

    return (
        <Card className="h-full w-full border rounded-xl shadow-lg">
            <CardHeader className="-mb-4">
                <CardTitle>Faturamento Mensal da Empresa</CardTitle>
                <CardDescription>{months[(currentMonth - (5 - 0) + 12) % 12]} - {months[(currentMonth - (5 - 5) + 12) % 12]} {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <ChartContainer config={chartConfig} className="h-[75%] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        dataKey="faturamentoTotal"
                        tickLine={false}
                        axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="faturamentoTotal" fill="var(--color-faturamentoTotal)" radius={4} />
                    <Bar dataKey="pagamentoColaboradores" fill="var(--color-pagamentoColaboradores)" radius={4} />
                    <Bar dataKey="lucroLiquido" fill="var(--color-lucroLiquido)" radius={4} />
                </BarChart>
            </ChartContainer>
        </Card>
    )
}

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

const currentMonth = new Date().getMonth();
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type ChartData = {
  colaborador: string;
  faturamento: number;
};

const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const EmployeeBilling = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data: escalaData, error: escalaError } = await supabase
          .from("escala")
          .select("funcionario_id, valor_recebido, data");

        if (escalaError) throw escalaError;

        const filteredData = escalaData.filter(
          (row) => new Date(row.data).getMonth() === currentMonth
        );

        const faturamentoPorColaborador = filteredData.reduce((acc, row) => {
          acc[row.funcionario_id] =
            (acc[row.funcionario_id] || 0) + (row.valor_recebido || 0);
          return acc;
        }, {} as Record<string, number>);

        const topColaboradores = Object.entries(faturamentoPorColaborador)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        const colaboradoresPromises = topColaboradores.map(async ([id, faturamento]) => {
          const { data: funcionarioData, error: funcionarioError } = await supabase
            .from("funcionario")
            .select("nome")
            .eq("funcionario_id", id)
            .single();

          if (funcionarioError) throw funcionarioError;

          return {
            colaborador: funcionarioData.nome,
            faturamento,
          };
        });

        const resolvedColaboradores = await Promise.all(colaboradoresPromises);

        // Adicionar placeholders para completar 3 linhas, se necessário
        const placeholders = [
          { colaborador: "Colaborador 1", faturamento: 0 },
          { colaborador: "Colaborador 2", faturamento: 0 },
          { colaborador: "Colaborador 3", faturamento: 0 },
        ];

        const finalData = placeholders.map((placeholder, index) => {
          return resolvedColaboradores[index] || placeholder;
        });

        setChartData(finalData);
      } catch (error) {
        console.error("Erro ao buscar dados dos colaboradores:", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <Card className="h-full w-full rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle>Faturamento por Colaborador</CardTitle>
        <CardDescription>
          {months[currentMonth]} {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[18rem] w-full" config={chartConfig}>
          <BarChart
            className="-mt-7"
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 15 }}
          >
            <YAxis
              dataKey="colaborador"
              type="category"
              tickLine={false}
              tickMargin={0}
              axisLine={false}
            />
            <XAxis
              dataKey="faturamento"
              type="number"
              tickLine={true}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="faturamento"
              layout="vertical"
              radius={5}
              fill={chartConfig.faturamento.color}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

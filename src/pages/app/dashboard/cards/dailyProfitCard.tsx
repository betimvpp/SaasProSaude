import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const DailyProfitCard = () => {
    const [todayProfit, setTodayProfit] = useState(0);
    const [profitChange, setProfitChange] = useState(0);

    useEffect(() => {
        const fetchDailyProfit = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Fetch today's data
                const { data: todayData, error: todayError } = await supabase
                    .from('escala')
                    .select('valor_recebido, valor_pago')
                    .eq('data', today);

                if (todayError) throw todayError;

                const todayTotalProfit = todayData.reduce((acc, curr) => 
                    acc + ((curr.valor_recebido || 0) - (curr.valor_pago || 0)), 0
                );
                setTodayProfit(todayTotalProfit);

                // Fetch yesterday's data
                const { data: yesterdayData, error: yesterdayError } = await supabase
                    .from('escala')
                    .select('valor_recebido, valor_pago')
                    .eq('data', yesterday);

                if (yesterdayError) throw yesterdayError;

                const yesterdayTotalProfit = yesterdayData.reduce((acc, curr) => 
                    acc + ((curr.valor_recebido || 0) - (curr.valor_pago || 0)), 0
                );

                // Calculate percentage change
                const change = yesterdayTotalProfit === 0 ? 0 
                    : ((todayTotalProfit - yesterdayTotalProfit) / yesterdayTotalProfit) * 100;
                setProfitChange(change);
            } catch (error) {
                console.error('Erro ao buscar lucro diário:', error);
            }
        };

        fetchDailyProfit();
    }, []);

    const changeColor = profitChange > 0 
        ? 'text-emerald-500 dark:text-emerald-400' 
        : profitChange < 0 
        ? 'text-red-500 dark:text-red-400' 
        : 'text-gray-500 dark:text-gray-400';

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Lucro Líquido por Dia:</CardTitle>
                <Banknote className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {todayProfit.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                </span>
                <p className={`text-xs ${changeColor}`}>
                    {profitChange === 0 
                        ? 'Sem variação ' 
                        : `${profitChange > 0 ? '+' : ''}${profitChange.toFixed(2)}% `}
                    em relação ao dia anterior
                </p>
            </CardContent>
        </Card>
    );
};

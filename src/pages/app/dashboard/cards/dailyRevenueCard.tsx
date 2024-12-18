import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const DailyRevenueCard = () => {
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [revenueChange, setRevenueChange] = useState(0);

    useEffect(() => {
        const fetchDailyRevenue = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Fetch today's revenue
                const { data: todayData, error: todayError } = await supabase
                    .from('escala')
                    .select('valor_recebido')
                    .eq('data', today);

                if (todayError) throw todayError;

                const todayTotal = todayData.reduce((acc, curr) => acc + (curr.valor_recebido || 0), 0);
                setTodayRevenue(todayTotal);

                // Fetch yesterday's revenue
                const { data: yesterdayData, error: yesterdayError } = await supabase
                    .from('escala')
                    .select('valor_recebido')
                    .eq('data', yesterday);

                if (yesterdayError) throw yesterdayError;

                const yesterdayTotal = yesterdayData.reduce((acc, curr) => acc + (curr.valor_recebido || 0), 0);

                // Calculate percentage change
                const change = yesterdayTotal === 0 ? 0 : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
                setRevenueChange(change);
            } catch (error) {
                console.error('Erro ao buscar receita diária:', error);
            }
        };

        fetchDailyRevenue();
    }, []);

    const changeColor = revenueChange > 0
        ? 'text-emerald-500 dark:text-emerald-400'
        : revenueChange < 0
            ? 'text-red-500 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400';

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Receita Total por Dia:</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {todayRevenue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                </span>
                <p className={`text-xs ${changeColor}`}>
                    {revenueChange === 0
                        ? 'Sem variação '
                        : `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(2)}% `}
                    em relação ao dia anterior
                </p>
            </CardContent>
        </Card>
    );
};

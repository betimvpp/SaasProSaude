import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const DailyScalesCard = () => {
    const [todayScales, setTodayScales] = useState(0);
    const [scalesChange, setScalesChange] = useState(0);

    useEffect(() => {
        const fetchDailyScales = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Fetch today's scales
                const { data: todayData, error: todayError } = await supabase
                    .from('escala')
                    .select('*', { count: 'exact' })
                    .eq('data', today);

                if (todayError) throw todayError;

                setTodayScales(todayData.length);

                // Fetch yesterday's scales
                const { data: yesterdayData, error: yesterdayError } = await supabase
                    .from('escala')
                    .select('*', { count: 'exact' })
                    .eq('data', yesterday);

                if (yesterdayError) throw yesterdayError;

                const yesterdayScales = yesterdayData.length;

                // Calculate percentage change
                const change = yesterdayScales === 0 ? 0 
                    : ((todayData.length - yesterdayScales) / yesterdayScales) * 100;
                setScalesChange(change);
            } catch (error) {
                console.error('Erro ao buscar escalas do dia:', error);
            }
        };

        fetchDailyScales();
    }, []);

    const changeColor = scalesChange > 0 
        ? 'text-emerald-500 dark:text-emerald-400' 
        : scalesChange < 0 
        ? 'text-red-500 dark:text-red-400' 
        : 'text-gray-500 dark:text-gray-400';

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Escalas do Dia:</CardTitle>
                <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {todayScales}
                </span>
                <p className={`text-xs ${changeColor}`}>
                    {scalesChange === 0 
                        ? 'Sem variação ' 
                        : `${scalesChange > 0 ? '+' : ''}${scalesChange.toFixed(2)}% `}
                    em relação ao dia anterior
                </p>
            </CardContent>
        </Card>
    );
};

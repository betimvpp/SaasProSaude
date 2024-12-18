import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const DailyComplaintCard = () => {
    const [todayComplaints, setTodayComplaints] = useState(0);
    const [complaintChange, setComplaintChange] = useState(0);

    useEffect(() => {
        const fetchDailyComplaints = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Fetch today's complaints
                const { data: todayData, error: todayError } = await supabase
                    .from('financeiro_reclamacao')
                    .select('*', { count: 'exact' })
                    .eq('data', today);

                if (todayError) throw todayError;

                setTodayComplaints(todayData.length);

                // Fetch yesterday's complaints
                const { data: yesterdayData, error: yesterdayError } = await supabase
                    .from('financeiro_reclamacao')
                    .select('*', { count: 'exact' })
                    .eq('data', yesterday);

                if (yesterdayError) throw yesterdayError;

                const yesterdayComplaints = yesterdayData.length;

                // Calculate percentage change
                const change = yesterdayComplaints === 0 ? 0 
                    : ((todayData.length - yesterdayComplaints) / yesterdayComplaints) * 100;
                setComplaintChange(change);
            } catch (error) {
                console.error('Erro ao buscar reclamações do dia:', error);
            }
        };

        fetchDailyComplaints();
    }, []);

    const changeColor = complaintChange > 0 
        ? 'text-red-500 dark:text-red-400' 
        : complaintChange < 0 
        ? 'text-emerald-500 dark:text-emerald-400' 
        : 'text-gray-500 dark:text-gray-400';

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Reclamações do Dia:</CardTitle>
                <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {todayComplaints}
                </span>
                <p className={`text-xs ${changeColor}`}>
                    {complaintChange === 0 
                        ? 'Sem variação ' 
                        : `${complaintChange > 0 ? '+' : ''}${complaintChange.toFixed(2)}% `}
                    em relação ao dia anterior
                </p>
            </CardContent>
        </Card>
    );
};
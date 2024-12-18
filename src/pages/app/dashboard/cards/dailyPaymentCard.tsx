
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import supabase from '@/lib/supabase';
import { HandCoins } from 'lucide-react'
import { useEffect, useState } from 'react';

export const DailyPaymentCard = () => {
    const [todayPayment, setTodayPayment] = useState(0);
    const [paymentChange, setPaymentChange] = useState(0);

    useEffect(() => {
        const fetchDailyPayment = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Fetch today's payment
                const { data: todayData, error: todayError } = await supabase
                    .from('escala')
                    .select('valor_pago')
                    .eq('data', today);

                if (todayError) throw todayError;

                const todayTotal = todayData.reduce((acc, curr) => acc + (curr.valor_pago || 0), 0);
                setTodayPayment(todayTotal);

                // Fetch yesterday's payment
                const { data: yesterdayData, error: yesterdayError } = await supabase
                    .from('escala')
                    .select('valor_pago')
                    .eq('data', yesterday);

                if (yesterdayError) throw yesterdayError;

                const yesterdayTotal = yesterdayData.reduce((acc, curr) => acc + (curr.valor_pago || 0), 0);

                // Calculate percentage change
                const change = yesterdayTotal === 0 ? 0 : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
                setPaymentChange(change);
            } catch (error) {
                console.error('Erro ao buscar pagamento diário:', error);
            }
        };

        fetchDailyPayment();
    }, []);

    const changeColor = paymentChange > 0 
        ? 'text-emerald-500 dark:text-emerald-400' 
        : paymentChange < 0 
        ? 'text-red-500 dark:text-red-400' 
        : 'text-gray-500 dark:text-gray-400';

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Pagamento a Profissionais por Dia:</CardTitle>
                <HandCoins className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {todayPayment.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                </span>
                <p className={`text-xs ${changeColor}`}>
                    {paymentChange === 0 
                        ? 'Sem variação ' 
                        : `${paymentChange > 0 ? '+' : ''}${paymentChange.toFixed(2)}% `}
                    em relação ao dia anterior
                </p>
            </CardContent>
        </Card>
    );
};

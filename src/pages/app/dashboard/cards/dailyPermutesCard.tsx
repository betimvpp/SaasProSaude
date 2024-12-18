import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export const DailyPermutesCard = () => {
    const [pendingSwaps, setPendingSwaps] = useState(0);

    useEffect(() => {
        const fetchPendingSwaps = async () => {
            try {
                // Fetch pending swaps
                const { data, error } = await supabase
                    .from('troca_servicos')
                    .select('*', { count: 'exact' })
                    .eq('status_gestor', 'pendente');

                if (error) throw error;

                setPendingSwaps(data.length);
            } catch (error) {
                console.error('Erro ao buscar permutas pendentes:', error);
            }
        };

        fetchPendingSwaps();
    }, []);

    return (
        <Card className='shadow-lg'>
            <CardHeader className='flex-row space-y-0 items-center justify-between p-4 pb-2'>
                <CardTitle className='text-base font-semibold'>Permutas Pendentes:</CardTitle>
                <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1 p-4 pt-0'>
                <span className="text-xl font-bold tracking-tight">
                    {pendingSwaps}
                </span>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Total de permutas aguardando aprovação do gestor
                </p>
            </CardContent>
        </Card>
    );
};

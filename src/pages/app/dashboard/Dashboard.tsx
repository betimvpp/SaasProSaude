import { Helmet } from 'react-helmet-async'
import { BillingChart } from './charts/billingChart'
import { EmployeeBilling } from './charts/employeeBilling'
import { DailyRevenueCard } from './cards/dailyRevenueCard'
import { DailyPaymentCard } from './cards/dailyPaymentCard'
import { DailyProfitCard } from './cards/dailyProfitCard'
import { DailyComplaintCard } from './cards/dailyComplaintCard'
import { DailyScalesCard } from './cards/dailyScalesCard'
import { DailyPermutesCard } from './cards/dailyPermutesCard'

export const Dashboard = () => {
    return (
        <div className="flex flex-col w-full gap-2">
            <Helmet title="Dashboard" />
            <h1 className="text-4xl font-bold textslate mb-4">Dashboard</h1>
            <div className="h-full w-full overflow-hidden shadow-lg border rounded-md p-4 grid grid-cols-3 grid-rows-2 gap-2 ">
                <div className='col-span-2'>
                    <BillingChart />
                </div>
                <div className='grid grid-rows-3 gap-2'>
                    <DailyRevenueCard />
                    <DailyPaymentCard />
                    <DailyProfitCard />
                </div>

                <div className='col-span-2'>
                    <EmployeeBilling />
                </div>
                <div className='grid grid-rows-3 gap-2'>
                    <DailyComplaintCard />
                    <DailyScalesCard />
                    <DailyPermutesCard />
                </div>
            </div>
        </div>
    )
}

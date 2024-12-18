import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

export function PatientTableSkeleton() {
    return Array.from({ length: 5 }).map((_, i) => {
        return (
            <TableRow key={i}>
                <TableCell>
                    <Skeleton className='w-10 h-4' />
                </TableCell>
               
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
                <TableCell>
                    <Skeleton className='w-full h-4' />
                </TableCell>
            </TableRow>
        )
    })
}
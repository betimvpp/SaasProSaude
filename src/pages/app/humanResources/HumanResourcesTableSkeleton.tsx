import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

export function HumanResourcesTableSkeleton() {
    return Array.from({ length: 10 }).map((_, i) => {
        return (
            <TableRow key={i}>
                <TableCell>
                    <Skeleton className='w-10 h-4' />
                </TableCell>
                <TableCell >
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
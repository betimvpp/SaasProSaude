import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Complaint } from '@/contexts/complaintsContext'
import { format } from 'date-fns'
export const ComplaintsDetails = ({ complaint }: { complaint: Complaint }) => {

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {complaint?.nomeFuncionario}
                </DialogTitle>
                <DialogDescription>
                    {complaint?.data ? format(new Date(complaint.data), 'dd/MM/yyyy') : 'Data inválida'}
                </DialogDescription>
            </DialogHeader>
            <p>{complaint?.problem_descripiton}</p>
        </DialogContent>
    )
}

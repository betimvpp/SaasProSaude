import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document } from '@/contexts/docsContext'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export interface DocumentDetailsProps {
    document: Document;
    open: boolean;
}

const downloadImage = (imageUrl: string, fileName: string) => {
    fetch(imageUrl)
        .then(response => response.blob())  // Pega o arquivo como Blob
        .then(blob => {
            const url = window.URL.createObjectURL(blob);  // Cria uma URL para o Blob
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a); // Remove o link após o clique
            window.URL.revokeObjectURL(url);  // Limpa a URL do Blob
        })
        .catch(error => {
            console.error('Erro ao baixar a imagem:', error);
        });
};
export const DocumentsDetails = ({ document }: DocumentDetailsProps) => {
    return (
        <DialogContent className="">
            <DialogHeader>
                <DialogTitle>Detalhes da Documentação</DialogTitle>
                <DialogDescription>Funcionario: {document.nomeFuncionario}</DialogDescription>
                <DialogDescription>Tipo: {document ? capitalizeFirstLetter(document?.tipo_doc!) : ''}</DialogDescription>
            </DialogHeader>
            {document.image_url ? (
                <div className="mt-4 flex flex-col">
                    <img
                        src={document.image_url}
                        alt={`Documento de ${document.nomeFuncionario}`}
                        className=" max-h-[400px] rounded-lg border shadow-md object-scale-down"
                    />
                    <Button
                        variant={'secondary'}
                        className="mt-2"
                        onClick={() =>
                            downloadImage(
                                document?.image_url!,
                                `documento_${document.nomeFuncionario || 'sem_nome'}.jpg`
                            )
                        }
                    >
                        Baixar Imagem
                    </Button>
                </div>
            ) : (
                <p className="mt-4 text-center text-gray-500">Nenhuma imagem disponível.</p>
            )}
        </DialogContent>
    )
}

import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Collaborator } from '@/contexts/collaboratorContext';
import { Table, TableBody, TableCell, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

export interface ProfileDetailsProps {
    profile: Collaborator;
    open: boolean;
}

interface ProfileEditProps {
    email: string;
    password: string;
    passwordConfirmation: string;
}
export const ProfileDetails = ({ profile }: ProfileDetailsProps) => {
    const { register, handleSubmit, reset } = useForm<ProfileEditProps>({
        defaultValues: {
            email: profile.email,
            password: '',
            passwordConfirmation: '',
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const onSubmit = async (data: ProfileEditProps) => {
        if (data.password !== data.passwordConfirmation) {
            toast.error('As senhas não coincidem!');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                email: data.email,
                password: data.password,
            });

            if (error) {
                console.error('Erro ao atualizar usuário:', error.message);
                toast.error('Erro ao atualizar os dados do usuário.');
            } else {
                toast.success('Dados atualizados com sucesso!');
                reset();
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
            toast.error('Erro inesperado ao atualizar os dados.');
        }
    };

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    return (
        <DialogContent className="">
            <DialogHeader>
                <DialogTitle>Usuário: {profile.nome}</DialogTitle>
                <DialogDescription>Cargo: {capitalizeFirstLetter(profile.role)}</DialogDescription>
            </DialogHeader>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Table >
                    <TableBody >
                        <TableRow>
                            <TableCell className="font-semibold">E-mail:</TableCell>
                            <TableCell className="flex justify-start -mt-2">
                                <Input id="email" type="email" {...register("email")} required />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Senha:</TableCell>
                            <TableCell className="relative flex justify-start -mt-2">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Digite sua nova senha"
                                    {...register("password")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-6 flex items-center text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Confirmar Senha:</TableCell>
                            <TableCell className="relative flex justify-start -mt-2">
                                <Input
                                    id="passwordConfirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    placeholder="Confirme sua nova senha"
                                    {...register("passwordConfirmation")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute inset-y-0 right-6 flex items-center text-muted-foreground"
                                >
                                    {showPasswordConfirmation ? <EyeOff className="w-5 h-5 " /> : <Eye className="w-5 h-5" />}
                                </button>
                            </TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
                <DialogFooter className="mt-2">
                    <Button type="submit">Editar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

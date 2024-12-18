import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import supabase from "@/lib/supabase"
import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
        passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "As senhas não coincidem.",
        path: ["passwordConfirmation"],
    });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
    const { register, handleSubmit, reset } = useForm<ResetPasswordForm>();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    async function handleResetPassword(data: ResetPasswordForm) {
        setLoading(true);

        if (data.password !== data.passwordConfirmation) {
            toast.error("As senhas não coincidem. Por favor, verifique e tente novamente.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                console.error("Erro ao atualizar a senha:", error.message);
                toast.error("Erro ao atualizar a senha. Tente novamente.");
            } else {
                toast.success("Senha atualizada com sucesso! Faça login novamente.");
                reset();
            }
        } catch (err) {
            console.error("Erro inesperado:", err);
            toast.error("Ocorreu um erro inesperado. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="mx-auto w-full">
            <Helmet title="Nova Senha" />
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
                <CardDescription className="text-wrap">
                    Insira sua nova senha!
                    <br />
                    Não se esqueça de confirmar a senha!
                </CardDescription>
            </CardHeader>
            <Separator className="w-4/5 m-auto mb-2" />
            <CardContent>
                <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Nova Senha</Label>
                        <div className="relative">
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
                                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2 relative">
                        <Label htmlFor="passwordConfirmation">Confirmar Senha</Label>
                        <div className="relative">
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
                                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                            >
                                {showPasswordConfirmation ? <EyeOff className="w-5 h-5 " /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {!loading ? "Alterar Senha" : "Alterando..."}
                    </Button>
                </form>
                <Separator className="w-4/5 m-auto mb-2 mt-4" />
                <span className="w-full flex items-center justify-center text-center m-auto">
                    <Link to={"/login"} className="text-muted-foreground">
                        Login!
                    </Link>
                </span>
            </CardContent>
        </Card>
    );
};
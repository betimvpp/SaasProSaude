import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import supabase from '@/lib/supabase'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const recoverPassword = z.object({
  email: z.string().email(),
});

type RecoverPasswordForm = z.infer<typeof recoverPassword>;
export const RecoverPassword = () => {
  const { register, handleSubmit, reset } = useForm<RecoverPasswordForm>();
  const [loading, setLoading] = useState(false);

  async function handleRecoverPassword(data: RecoverPasswordForm) {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("funcionario")
        .select("email")
        .eq("email", data.email)
        .single();

      if (userError || !userData) {
        toast.error("E-mail não encontrado. Por favor, verifique e tente novamente.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: "https://coopervidagestao.com/login/nova-senha",
      });

      if (error) {
        console.error("Erro ao enviar o e-mail de recuperação:", error.message);
        toast.error("Erro ao enviar o e-mail de recuperação. Por favor, tente novamente.");
      } else {
        toast.success("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
        reset();
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
    setLoading(false);
  }

  return (
    <Card className="mx-auto w-full">
      <Helmet title="Recuperar Senha" />
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
        <CardDescription className='text-wrap'>
          Insira seu email para recuperar a senha!
          <br />
          Assim que você clicar no botão de Recuperar Senha, será enviado um e-mail com todas as informações para recuperar o seu acesso
        </CardDescription>
      </CardHeader>
      <Separator className="w-4/5 m-auto mb-2" />
      <CardContent>
        <form
          onSubmit={handleSubmit(handleRecoverPassword)}
          className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" required
              {...register("email")}
            />
          </div>
          <Button type="submit" className="w-full " disabled={loading}>
            {!loading ? "Recuperar Senha" : "Recuperando"}
          </Button>
        </form>
        <Separator className="w-4/5 m-auto mb-2 mt-4" />
        <span className="w-full flex items-center justify-center text-center m-auto">
          <Link to={"/login"} className=" text-muted-foreground">Login!</Link>
        </span>
      </CardContent>
    </Card>
  )
}

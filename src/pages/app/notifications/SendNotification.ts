import supabase from "@/lib/supabase";

export const sendNotification = async (title: string, body: string) => {

    if (!title || !body) {
        throw new Error("Título e mensagem são obrigatórios");
    }

    try {
        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error("Usuário não autenticado");
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("fcm_token")
            .eq("id", user.user.id)
            .single();

        if (error) {
            console.error("Erro ao buscar fcm_token:", error);
            throw new Error("Erro ao buscar fcm_token");
        }

        if (!profile || !profile.fcm_token) {
            throw new Error("Token de notificação não encontrado para o usuário");
        }

        const registrationToken = profile.fcm_token;

        const firebaseServerKey = "BG3UcwJOjaPmJIPmoEld7-GY1gmaqHJh5hqEqINBP0NxLTW9amvaeehxepWDp1ySFtk3OLh88WzD3erftyuEEuo";
        const payload = {
            registration_ids: [registrationToken], 
            notification: {
                title,
                body,
            },
        };

        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
                "Authorization": `key=${firebaseServerKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.failure > 0) {
            console.warn("Alguns tokens falharam:", result.results);
        }

        return result;
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        throw new Error("Erro ao enviar notificação");
    }
};

import React, { useState } from "react";
import { sendNotification } from "./SendNotification";


const NotificationForm = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !body) {
            alert("Preencha todos os campos!");
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const result = await sendNotification(title, body);
            console.log("Resultado do envio:", result);
            setStatus("success");
            alert("Notificação enviada com sucesso!");
        } catch (error) {
            console.error("Erro ao enviar notificação:", error);
            setStatus("error");
            alert("Erro ao enviar notificação. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSendNotification} className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Enviar Notificação</h1>
            <div className="mb-4">
                <label className="block mb-2">Título:</label>
                <input
                    type="text"
                    className="border p-2 w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Mensagem:</label>
                <textarea
                    className="border p-2 w-full"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                ></textarea>
            </div>
            <button
                type="submit"
                className={`bg-blue-500 text-white p-2 rounded ${isLoading ? "opacity-50" : ""}`}
                disabled={isLoading}
            >
                {isLoading ? "Enviando..." : "Enviar Notificação"}
            </button>
            {status === "success" && (
                <p className="text-green-500 mt-4">Notificação enviada com sucesso!</p>
            )}
            {status === "error" && (
                <p className="text-red-500 mt-4">Erro ao enviar notificação. Tente novamente.</p>
            )}
        </form>
    );
};

export default NotificationForm;

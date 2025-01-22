import { useState } from "react";



const NotificationForm = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    return (
        <form className="p-4 max-w-md mx-auto">
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
                className={`bg-blue-500 text-white p-2 rounded`}
            >
                enviar
            </button>

        </form>
    );
};

export default NotificationForm;

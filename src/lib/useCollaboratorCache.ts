import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useCollaborator, Collaborator } from '@/contexts/collaboratorContext';

// Cache global para armazenar dados dos colaboradores
const collaboratorCache = new Map<string, Collaborator>();

// Função para acessar o cache global
export const getCollaboratorCache = () => collaboratorCache;

export const useCollaboratorCache = () => {
    const { user } = useAuth();
    const { getCollaboratorById } = useCollaborator();
    const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (user && !hasLoadedRef.current) {
            const userId = user.id;

            // Verifica se já existe no cache
            if (collaboratorCache.has(userId)) {
                setCollaboratorData(collaboratorCache.get(userId)!);
                setIsLoading(false);
                hasLoadedRef.current = true;
                return;
            }

            // Se não existe no cache, faz a requisição
            setIsLoading(true);
            getCollaboratorById(userId)
                .then(data => {
                    if (data) {
                        // Armazena no cache
                        collaboratorCache.set(userId, data);
                        setCollaboratorData(data);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                    hasLoadedRef.current = true;
                });
        }
    }, [user, getCollaboratorById]);

    // Função para limpar o cache (útil para logout)
    const clearCache = () => {
        collaboratorCache.clear();
        hasLoadedRef.current = false;
        setCollaboratorData(null);
        setIsLoading(true);
    };

    return {
        collaboratorData,
        isLoading,
        clearCache
    };
}; 
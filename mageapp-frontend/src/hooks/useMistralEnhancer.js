// src/hooks/useMistralEnhancer.js
import { useState, useCallback } from "react";
import { mistralEnhance } from "../services/mistralService.js";

export function useMistralEnhancer() {
    const [loadingMistral, setLoadingMistral] = useState(false);

    const enhance = useCallback(
        async (
            text,
            prompt = "Mejora el texto conservando el significado y sin inventar datos."
        ) => {
            // Si no hay texto, no llamamos a la API
            if (!text || !text.trim()) return text;

            setLoadingMistral(true);
            try {
                const resp = await mistralEnhance(text, prompt);
                return resp;
            } catch (err) {
                console.error("Error Mistral =>", err);
                return text; // fallback
            } finally {
                setLoadingMistral(false);
            }
        },
        []
    );

    return { enhance, loadingMistral };
}

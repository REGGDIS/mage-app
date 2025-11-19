// src/services/mistralService.js
import axios from "axios";

const API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function mistralEnhance(text, prompt) {

    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

    if (!apiKey) {
        console.warn(
            "[mistralEnhance] Falta VITE_MISTRAL_API_KEY en tu archivo .env; devuelvo el texto original."
        );
        return text;
    }

    try {
        const { data } = await axios.post(
            API_URL,
            {
                model: "mistral-large-latest",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: text },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return data?.choices?.[0]?.message?.content ?? text;
    } catch (err) {
        console.error("[mistralEnhance] Error llamando a Mistral:", err);
        // En caso de error, devolvemos el texto tal cual para no romper el flujo
        return text;
    }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });
redisClient.connect();

const SYSTEM_PROMPT = `You are a helpful assistant.
Always respond in English, regardless of the language the user writes in.
Keep responses short and concise - maximum 3-4 sentences.
Do not use Markdown, headers, or bullet points. Write plain text only.`;

const MAX_HISTORY = 20; // Son 20 mesaj

export async function generateReply(message: string, sessionId: string, retries = 3): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    // Geçmişi Redis'ten al
    const historyKey = `chat:${sessionId}`;
    const raw = await redisClient.get(historyKey);
    const history = raw ? JSON.parse(raw) : [];

    const chat = model.startChat({ history });

    for (let i = 0; i < retries; i++) {
        try {
            const result = await chat.sendMessage(message);
            const reply = result.response.text();

            // Geçmişi güncelle
            history.push({ role: "user", parts: [{ text: message }] });
            history.push({ role: "model", parts: [{ text: reply }] });

            // Son MAX_HISTORY mesajı tut
            const trimmed = history.slice(-MAX_HISTORY);
            await redisClient.set(historyKey, JSON.stringify(trimmed), { EX: 60 * 60 * 24 }); // 24 saat

            return reply;
        } catch (error: any) {
            if (error?.status === 503 && i < retries - 1) {
                console.log(`Gemini 503, ${i + 1}. deneme. ${2 * (i + 1)}sn bekleniyor...`);
                await new Promise(res => setTimeout(res, 2000 * (i + 1)));
                continue;
            }
            throw error;
        }
    }

    throw new Error("Gemini tüm denemeler başarısız oldu.");
}
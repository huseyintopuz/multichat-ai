import TelegramBot from "node-telegram-bot-api";
import { Queue, Worker } from "bullmq";
import { generateReply } from "./gemini.js";
import { getTelegramBot } from "./telegram.js";

const connection = {
    host: "localhost",
    port: 6379,
};

export const telegramQueue = new Queue("telegram-messages", { connection });

async function sendLongMessage(bot: TelegramBot, chatId: string, text: string) {
    const MAX_LENGTH = 4000;
    if (text.length <= MAX_LENGTH) {
        await bot.sendMessage(chatId, text);
        return;
    }
    const parts = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
        parts.push(text.slice(i, i + MAX_LENGTH));
    }
    for (const part of parts) {
        await bot.sendMessage(chatId, part);
    }
}

new Worker(
    "telegram-messages",
    async (job) => {
        try {
            const { chatId, message } = job.data;
            const bot = getTelegramBot();

            // Typing indicator başlat
            const typingInterval = setInterval(() => {
                bot.sendChatAction(chatId, "typing").catch(() => { });
            }, 4000);

            await bot.sendChatAction(chatId, "typing");

            try {
                const reply = await generateReply(message, `telegram:${chatId}`);
                clearInterval(typingInterval);
                await sendLongMessage(bot, chatId, reply);
            } catch (error) {
                clearInterval(typingInterval);
                throw error;
            }
        } catch (error) {
            console.error("Telegram worker hatası:", error);
        }
    },
    { connection }
);
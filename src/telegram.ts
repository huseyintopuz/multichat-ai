import TelegramBot from "node-telegram-bot-api";
import { telegramQueue } from "./telegramQueue.js";

let bot: TelegramBot | null = null;

export function getTelegramBot() {
    if (!bot) {
        bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
    }
    return bot;
}

export async function handleTelegramWebhook(body: any) {
    const message = body.message;

    if (!message || !message.text) return;

    const chatId = String(message.chat.id);
    const text = message.text;

    console.log("Telegram mesajı queue'ya ekleniyor:", { chatId, text });
    await telegramQueue.add("incoming", { chatId, message: text });
}
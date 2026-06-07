import axios from "axios";
import { messageQueue } from "./queue.js";

export async function sendWhatsAppMessage(to: string, message: string) {
    await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: message },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );
}

export async function handleWebhook(body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    console.log("Message:", message);

    if (!message || message.type !== "text") return;

    const from = message.from;
    const text = message.text.body;

    console.log("Queue'ya ekleniyor:", { from, text });
    await messageQueue.add("incoming", { from, message: text });
}
import { Queue, Worker } from "bullmq";
import { generateReply } from "./gemini.js";
import axios from "axios";

const connection = {
    host: "localhost",
    port: 6379,
};

export const messageQueue = new Queue("messages", { connection });

new Worker(
    "messages",
    async (job) => {
        try {
            const { from, message } = job.data;
            console.log("Worker çalışıyor:", { from, message });

            const reply = await generateReply(message, `whatsapp:${from}`);
            console.log("Gemini cevabı:", reply);

            await axios.post(
                `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: "905056652776",
                    type: "text",
                    text: { body: reply },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error("Worker hatası:", error);
        }
    },
    { connection }
);
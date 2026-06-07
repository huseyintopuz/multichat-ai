import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { handleWebhook } from "./webhook.js";
import { handleTelegramWebhook } from "./telegram.js";
import "./queue.js";
import "./telegramQueue.js";

const app = express();
app.use(express.json());

// ── WhatsApp ──────────────────────────────────────────
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post("/webhook", async (req, res) => {
    console.log("WhatsApp webhook geldi:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
    await handleWebhook(req.body);
});

// ── Telegram ──────────────────────────────────────────
app.post("/telegram", async (req, res) => {
    console.log("Telegram webhook geldi:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
    await handleTelegramWebhook(req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
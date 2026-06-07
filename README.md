# multichat-ai

An AI-powered chatbot that integrates WhatsApp and Telegram using Google Gemini, BullMQ, and Node.js.

## Features

- WhatsApp & Telegram support via webhook
- AI replies powered by Google Gemini 2.5 Flash
- Queue-based message processing with BullMQ & Redis
- Conversation history per user (stored in Redis)
- Typing indicator while generating responses
- Long message splitting for Telegram
- Auto-retry on Gemini 503 errors

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **AI:** Google Gemini 2.5 Flash
- **Messaging:** WhatsApp Business API, Telegram Bot API
- **Queue:** BullMQ + Redis
- **Server:** Express.js

## Prerequisites

- Node.js 18+
- Redis (running on localhost:6379)
- pnpm
- ngrok (for local development)
- Meta Developer account (WhatsApp)
- Telegram Bot token (via @BotFather)

## Installation

```bash
git clone https://github.com/yourusername/multichat-ai.git
cd multichat-ai
pnpm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
GOOGLE_API_KEY=your_gemini_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PORT=3000
```

## Running Locally

Start Redis, then run the dev server:

```bash
redis-server
pnpm dev
```

Expose your local server with ngrok:

```bash
ngrok http 3000
```

### WhatsApp Webhook Setup

In Meta Developer Console → WhatsApp → Configuration, set:
- Webhook URL: `https://your-ngrok-url.ngrok-free.app/webhook`
- Verify Token: same as `WEBHOOK_VERIFY_TOKEN` in your `.env`

### Telegram Webhook Setup

Run once after starting ngrok:

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok-free.app/telegram"
```

## Architecture

```
WhatsApp  →  POST /webhook   →  messageQueue  →  Worker  →  Gemini  →  WhatsApp API
Telegram  →  POST /telegram  →  telegramQueue →  Worker  →  Gemini  →  Telegram Bot
```

Each platform has its own queue and worker. Both share the same Gemini integration and conversation history stored in Redis per user session.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled production build |

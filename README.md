# Logic Systems Bot

Static website plus a Discord bot/backend for Logic Systems.

## What This Does

- Runs the Discord bot.
- Registers roleplay slash commands.
- Receives Paddle webhooks.
- Marks a Discord server as Premium after a paid Paddle event with `customData.guildId`.
- Locks `/embed` and `/antiraid` unless the server is Premium.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in `.env`:

   ```text
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=1507551249204117535
   PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
   PORT=3000
   ```

4. Register slash commands:

   ```bash
   npm run deploy:commands
   ```

5. Start the bot/backend:

   ```bash
   npm start
   ```

## Paddle Webhook

In Paddle, set your webhook URL to:

```text
https://YOUR_BACKEND_DOMAIN/webhooks/paddle
```

Subscribe to subscription and transaction events. The website sends the Discord server ID to Paddle checkout as `customData.guildId`, and the webhook uses that to activate Premium.

## Important

The Netlify site only hosts the website. The Discord bot/backend must run on a server such as Railway, Render, Fly.io, a VPS, or your own machine.
# Bot-Services

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
   DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret
   PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
   PUBLIC_SITE_URL=https://logicsystems.netlify.app
   PUBLIC_BACKEND_URL=https://YOUR_BACKEND_DOMAIN
   PORT=3000
   ```

4. In the Discord Developer Portal, add this OAuth2 redirect URL:

   ```text
   https://YOUR_BACKEND_DOMAIN/auth/discord/callback
   ```

5. In `script.js`, set:

   ```js
   const BACKEND_URL = "https://YOUR_BACKEND_DOMAIN";
   ```

6. Register slash commands:

   ```bash
   npm run deploy:commands
   ```

7. Start both bot and backend locally:

   ```bash
   npm start
   ```

## Hosting Split

Use Orihost for the Discord bot only:

```bash
npm run start:bot
```

Use Render for the web backend only:

```bash
npm run start:web
```

This prevents the same Discord bot token from being logged in twice on two different hosts.

## Paddle Webhook

In Paddle, set your webhook URL to:

```text
https://YOUR_BACKEND_DOMAIN/webhooks/paddle
```

Subscribe to subscription and transaction events. The website sends the Discord server ID to Paddle checkout as `customData.guildId`, and the webhook uses that to activate Premium.

## Important

The Netlify site only hosts the website. The Discord bot/backend must run on a server such as Railway, Render, Fly.io, a VPS, or your own machine.

Discord dashboard login requires the backend URL to be public and HTTPS because Discord OAuth redirects back to the backend.
# Bot-Services

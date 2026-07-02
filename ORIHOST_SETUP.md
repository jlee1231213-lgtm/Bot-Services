# Orihost Setup

Use this if Orihost supports Node.js apps or Discord bot hosting.

## App Type

Choose Node.js, Node app, Discord bot, or custom app.

## Install Command

```bash
npm install
```

## Start Command

Use this if Orihost will host both the bot and dashboard backend:

```bash
npm start
```

Use this only if Orihost is hosting the Discord bot by itself and Render is still hosting the dashboard backend:

```bash
npm run start:bot
```

## Node Version

Use Node.js 18 or newer.

## Environment Variables

Set these in the Orihost panel:

```text
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=1507551249204117535
DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret
SESSION_SECRET=make_a_long_random_secret
DISCORD_GUILD_ID=optional_test_server_id_for_command_deploy
PUBLIC_SITE_URL=https://musical-otter-f551a8.netlify.app
PUBLIC_BACKEND_URL=https://your-orihost-app-url
PORT=3000
```

`PADDLE_WEBHOOK_SECRET` is not required for the current free service flow unless you add paid features later.

## Discord Developer Portal

Add this redirect URL after Orihost gives you the app URL:

```text
https://your-orihost-app-url/auth/discord/callback
```

Then update the website `script.js` backend URL if you move the backend from Render to Orihost:

```js
const BACKEND_URL = "https://your-orihost-app-url";
```

Deploy the website to Netlify again after changing that value.

## Slash Commands

Run this once after setting environment variables:

```bash
npm run deploy:commands
```

If Orihost has no command console, run it locally with the same `.env` values.

## Important

Do not run the same Discord bot token on Render and Orihost at the same time. Pick one host for the bot process.

Recommended setup:

- Netlify: website
- Orihost: bot and backend with `npm start`
- GitHub: code


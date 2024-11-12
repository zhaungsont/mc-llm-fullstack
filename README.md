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

1. Clone the repository
2. Make sure you have the correct Node.js versions installed (specified in `.nvmrc` in both `frontend` and `backend`)
   - Using nvm:
     - For backend: `nvm use 18`
     - For frontend: `nvm use 21`
   - Or copy these commands to install manually:
     ```bash
     # For backend
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
     nvm install 18
     nvm use 18

     # For frontend
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
     nvm install 21
     nvm use 21
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

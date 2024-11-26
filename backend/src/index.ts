import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';
import { BotController, BotsManager } from './bot/bot';

const SERVER_PORT = Number(process.env.SERVER_PORT) || 3000;
const SOCKET_PORT = 3001;
const CLIENT_ORIGIN = `https://mcbot.zhsont.cc/`;

const app = express();

// Middleware
app.use(
	cors({
		origin: '*', // allow requests from any origin
		methods: ['GET', 'POST'], // only allow certain HTTP methods
		credentials: true, // allow cookies and authentication headers
	})
);
app.use(express.json());

// Basic GET endpoint
app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'healthy' });
});

app.listen(SERVER_PORT, '0.0.0.0', () => {
	console.log(`HTTP Server running at http://localhost:${SERVER_PORT}`);
});

const httpServer = createServer(app);

const botsManager = new BotsManager();

// Create a Socket.IO server instance for each port
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	const { gameServerIp, botUsername } = socket.handshake.query;
	console.log(`A user connected on port ${SOCKET_PORT}:`, socket.id);

	const newBot = botsManager.addBot({
		gameServerIp: gameServerIp as string,
		botUsername: botUsername as string,
		socketId: socket.id,
	});

	// Listening for messages from the client
	socket.on('message', (data) => {
		console.log(`Message received on port ${SERVER_PORT}:`, data);
		// You can broadcast the message to all connected clients on the same port
		io.emit('message', data);
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log(`A user disconnected from port ${SERVER_PORT}:`, socket.id);
		botsManager.removeBot(socket.id);
	});

	const botInstance = newBot.botInstance;

	// register event listeners
	if (botInstance) {
		botInstance.on('login', () => {
			io.emit('botStatus', 'login');
			newBot.loginHandler();
		});
		botInstance.on('spawn', () => {
			io.emit('botStatus', 'spawn');
			newBot.spawnHandler();
		});
		botInstance.on('end', (reason: string) => {
			io.emit('botStatus', `end: ${reason}`);
			console.log('Bot ended,', reason);
			socket.disconnect();
			botsManager.removeBot(socket.id);
		});

		botInstance.on('chat', (username: string, message: string) => {
			newBot.chatHandler(username, message);
		});

		botInstance.on('physicTick', () => {
			newBot.physicTickHandler();
		});

		// bot.on('soundEffectHeard', (soundName, position, volume, pitch) => {
		// 	botSoundEffectHeardHandler(bot, soundName, position, volume, pitch);
		// });

		// bot.on(
		// 	'hardcodedSoundEffectHeard',
		// 	(soundId, soundCategory, position, volume, pitch) => {
		// 		botHardcodedSoundEffectHeardHandler(
		// 			bot,
		// 			soundId,
		// 			soundCategory,
		// 			position,
		// 			volume,
		// 			pitch
		// 		);
		// 	}
		// );
	}
});

// Start the HTTP server for each port
httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
	console.log(`Socket.IO Server running at ${SOCKET_PORT}`);
});

setInterval(() => {
	console.log('-------');
	console.log('Current bots:');
	botsManager.bots.forEach((bot) => {
		console.log(`Socket ID: ${bot.socketId}, Bot name: ${bot.botName}`);
	});
}, 1000);

// type SocketServer = {
// 	instance: Server | null;
// 	port: number;
// 	isInUse: boolean;
// 	botInstance: mineflayer.Bot | null;
// };
